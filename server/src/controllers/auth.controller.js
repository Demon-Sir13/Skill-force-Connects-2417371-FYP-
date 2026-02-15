const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const OrganizationProfile = require('../models/OrganizationProfile');
const ProviderProfile = require('../models/ProviderProfile');
const Subscription = require('../models/Subscription');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const { sendEmail, emails } = require('../utils/email');
const { log } = require('../utils/activityLog');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;
const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_COOLDOWN_MS = 60 * 1000;

const sanitize = (u) => ({
  _id: u._id, name: u.name, email: u.email, role: u.role,
  profileImage: u.profileImage, verified: u.verified, createdAt: u.createdAt,
});

const generateOtpCode = () => crypto.randomInt(100000, 999999).toString();

// ─── REGISTER ─────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, password, role, orgType } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already in use' });
    const userData = { name, email, password, role };
    if (role === 'organization' && orgType) userData.orgType = orgType;
    const user = await User.create(userData);
    if (role === 'organization') await OrganizationProfile.create({ userId: user._id, companyName: name });
    else if (role === 'provider') await ProviderProfile.create({ userId: user._id });
    await Subscription.create({ userId: user._id, plan: 'free', features: ['Basic profile', '5 applications/month'] });
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);
    user.refreshToken = refreshToken;
    await user.save();
    res.status(201).json({ ...sanitize(user), token, refreshToken });
    sendEmail({ to: user.email, ...emails.welcome({ name: user.name, role: user.role }) });
    log(user._id, 'register', { meta: { role: user.role } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── LOGIN STEP 1: credentials → OTP ─────────────────────────────────────────
const login = async (req, res) => {
  const { email, password, deviceToken } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const mins = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(429).json({ message: `Account locked. Try again in ${mins} minutes.` });
    }

    if (!(await user.matchPassword(password))) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
        user.loginAttempts = 0;
      }
      await user.save();
      const rem = MAX_LOGIN_ATTEMPTS - (user.loginAttempts || 0);
      return res.status(401).json({ message: `Invalid email or password.${rem > 0 ? ' ' + rem + ' attempts left.' : ''}` });
    }

    if (user.suspended)
      return res.status(403).json({ message: `Account suspended: ${user.suspendReason || 'Contact admin'}` });

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // Trusted device — skip OTP
    if (deviceToken && user.trustedDevices?.includes(deviceToken)) {
      const token = generateToken(user._id, user.role);
      const rToken = generateRefreshToken(user._id, user.role);
      user.refreshToken = rToken;
      await user.save();
      return res.json({ ...sanitize(user), token, refreshToken: rToken, step: 'complete' });
    }

    // Send OTP
    await Otp.deleteMany({ userId: user._id });
    const code = generateOtpCode();
    await Otp.create({ userId: user._id, otp: code, expiresAt: new Date(Date.now() + OTP_EXPIRY_MS) });
    const emailData = emails.otp({ name: user.name, otp: code });
    sendEmail({ to: user.email, ...emailData });

    // Always log OTP to console in dev for easy testing
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n🔑 OTP for ${user.email}: ${code}\n`);
    }

    res.json({ step: 'otp_required', userId: user._id, email: user.email, message: 'Verification code sent to your email' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── LOGIN STEP 2: verify OTP → issue tokens ─────────────────────────────────
const verifyOtp = async (req, res) => {
  const { userId, otp, rememberDevice } = req.body;
  try {
    if (!userId || !otp) return res.status(400).json({ message: 'User ID and OTP required' });
    const rec = await Otp.findOne({ userId });
    if (!rec) return res.status(400).json({ message: 'No OTP found. Request a new one.' });
    if (rec.expiresAt < Date.now()) { await Otp.deleteMany({ userId }); return res.status(400).json({ message: 'Verification code expired. Request a new one.' }); }
    if (rec.attempts >= 5) { await Otp.deleteMany({ userId }); return res.status(429).json({ message: 'Too many failed attempts. Request a new OTP.' }); }

    if (!(await rec.matchOtp(otp))) {
      rec.attempts += 1; await rec.save();
      return res.status(401).json({ message: `Invalid or expired verification code. ${5 - rec.attempts} attempts left.` });
    }

    await Otp.deleteMany({ userId });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);
    user.refreshToken = refreshToken;

    let devToken = null;
    if (rememberDevice) {
      devToken = crypto.randomBytes(32).toString('hex');
      if (!user.trustedDevices) user.trustedDevices = [];
      user.trustedDevices = [...user.trustedDevices.slice(-4), devToken];
    }
    await user.save();

    res.json({ ...sanitize(user), token, refreshToken, deviceToken: devToken, step: 'complete' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── RESEND OTP ───────────────────────────────────────────────────────────────
const resendOtp = async (req, res) => {
  const { userId } = req.body;
  try {
    if (!userId) return res.status(400).json({ message: 'User ID required' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const existing = await Otp.findOne({ userId });
    if (existing && (Date.now() - existing.lastSentAt) < OTP_COOLDOWN_MS) {
      const wait = Math.ceil((OTP_COOLDOWN_MS - (Date.now() - existing.lastSentAt)) / 1000);
      return res.status(429).json({ message: `Wait ${wait}s before requesting a new code.` });
    }
    await Otp.deleteMany({ userId });
    const code = generateOtpCode();
    await Otp.create({ userId: user._id, otp: code, expiresAt: new Date(Date.now() + OTP_EXPIRY_MS) });
    const emailData = emails.otp({ name: user.name, otp: code });
    sendEmail({ to: user.email, ...emailData });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n🔑 OTP for ${user.email}: ${code}\n`);
    }

    res.json({ message: 'New verification code sent' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────────
const refreshTokenHandler = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) return res.status(401).json({ message: 'Invalid refresh token' });
    const newToken = generateToken(user._id, user.role);
    const newRefresh = generateRefreshToken(user._id, user.role);
    user.refreshToken = newRefresh; await user.save();
    res.json({ token: newToken, refreshToken: newRefresh });
  } catch (err) { res.status(401).json({ message: 'Refresh token expired' }); }
};

const getMe = async (req, res) => { res.json(sanitize(req.user)); };

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) return res.status(401).json({ message: 'Current password is incorrect' });
    user.password = newPassword; await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { register, login, verifyOtp, resendOtp, getMe, changePassword, refreshTokenHandler };
