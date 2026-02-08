const nodemailer = require('nodemailer');

const isDev = process.env.NODE_ENV !== 'production';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  transporter.verify()
    .then(() => console.log('[Email] Gmail SMTP connected'))
    .catch((err) => console.error('[Email] Gmail SMTP verification failed:', err.message));
  return transporter;
};

const sendEmail = async ({ to, subject, html, _otpCode }) => {
  if (isDev) {
    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║           📧  DEV EMAIL (not sent)               ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  To:      ${to}`);
    console.log(`║  Subject: ${subject}`);
    if (_otpCode) {
      console.log('║──────────────────────────────────────────────────║');
      console.log(`║  🔑 OTP CODE: ${_otpCode}                        `);
    }
    console.log('╚══════════════════════════════════════════════════╝\n');
    return;
  }
  const t = getTransporter();
  if (!t) {
    console.warn('[Email] Skipped — EMAIL_USER/EMAIL_PASS not configured');
    if (_otpCode) console.log(`[Email] OTP fallback for ${to}: ${_otpCode}`);
    return;
  }
  try {
    const info = await t.sendMail({
      from: process.env.EMAIL_FROM || `SkillForce <${process.env.EMAIL_USER}>`,
      to, subject, html,
    });
    console.log(`[Email] Sent to ${to} — messageId: ${info.messageId}`);
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err.message);
    if (_otpCode) console.log(`[Email] ⚠️  OTP fallback for ${to}: ${_otpCode}`);
  }
};

const base = (content) => `
<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0B0F14;color:#e2e8f0;margin:0;padding:0}
  .wrap{max-width:560px;margin:40px auto;background:#11161E;border:1px solid #1E2530;border-radius:16px;overflow:hidden}
  .header{background:linear-gradient(135deg,#0EA5E9,#6366F1);padding:28px 32px;text-align:center}
  .header h1{color:#fff;margin:0;font-size:22px;font-weight:700}.header .logo{font-size:28px;margin-bottom:8px}
  .body{padding:32px}.body p{color:#94a3b8;line-height:1.7;margin:0 0 16px}
  .btn{display:inline-block;background:linear-gradient(135deg,#0EA5E9,#6366F1);color:#fff!important;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px;margin:8px 0}
  .footer{padding:20px 32px;border-top:1px solid #1E2530;text-align:center;color:#475569;font-size:12px}
  .badge{display:inline-block;background:rgba(14,165,233,0.15);color:#0EA5E9;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600}
  .otp-box{text-align:center;margin:28px 0}
  .otp-code{display:inline-block;background:linear-gradient(135deg,#0EA5E9,#6366F1);color:#fff;font-size:36px;font-weight:800;letter-spacing:10px;padding:18px 36px;border-radius:14px;box-shadow:0 4px 24px rgba(14,165,233,0.3)}
  .otp-expiry{display:inline-block;background:rgba(239,68,68,0.1);color:#f87171;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;margin-top:12px}
  .warning{background:#1E2530;padding:12px 16px;border-radius:8px;border-left:3px solid #f59e0b;color:#fbbf24;font-size:12px;margin-top:8px}
</style></head><body><div class="wrap">${content}</div></body></html>`;

const emails = {
  welcome: ({ name, role }) => ({
    subject: 'Welcome to SkillForce 🚀',
    html: base(`
      <div class="header"><div class="logo">⚡</div><h1>Welcome to SkillForce</h1></div>
      <div class="body">
        <p>Hi <strong style="color:#e2e8f0">${name}</strong>,</p>
        <p>Your account has been created as a <span class="badge">${role}</span>.</p>
        <p>You're all set to ${role === 'organization' ? 'post jobs and hire top talent' : 'browse jobs and grow your career'}.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="btn">Go to Dashboard →</a>
        <p style="margin-top:24px">Welcome aboard,<br/><strong style="color:#e2e8f0">The SkillForce Team</strong></p>
      </div>
      <div class="footer">© ${new Date().getFullYear()} SkillForce Nepal. You're receiving this because you signed up.</div>`),
  }),

  otp: ({ name, otp }) => ({
    subject: `${otp} is your SkillForce verification code`,
    html: base(`
      <div class="header"><div class="logo">🔐</div><h1>Two-Step Verification</h1></div>
      <div class="body">
        <p>Hi <strong style="color:#e2e8f0">${name}</strong>,</p>
        <p>Someone is trying to sign in to your <strong style="color:#0EA5E9">SkillForce</strong> account. Use the code below to verify your identity:</p>
        <div class="otp-box"><div class="otp-code">${otp}</div><br/><span class="otp-expiry">⏱ Expires in 5 minutes</span></div>
        <div class="warning">⚠️ Never share this code with anyone. SkillForce will never ask for your verification code.</div>
        <p style="margin-top:20px;color:#64748b;font-size:12px">If you didn't request this code, you can safely ignore this email.</p>
      </div>
      <div class="footer">&copy; ${new Date().getFullYear()} <strong>SkillForce</strong> &mdash; Secure Login Verification<br/><span style="color:#64748b">This is an automated message. Do not reply.</span></div>`),
    _otpCode: otp,
  }),

  jobAssigned: ({ providerName, jobTitle, orgName, jobId }) => ({
    subject: `You've been assigned: ${jobTitle}`,
    html: base(`
      <div class="header"><h1>New Job Assignment</h1></div>
      <div class="body">
        <p>Hi <strong style="color:#e2e8f0">${providerName}</strong>,</p>
        <p><strong style="color:#e2e8f0">${orgName}</strong> has assigned you to:</p>
        <p style="font-size:18px;font-weight:700;color:#0EA5E9">${jobTitle}</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/jobs/${jobId}" class="btn">View Job →</a>
      </div>
      <div class="footer">© ${new Date().getFullYear()} SkillForce Nepal</div>`),
  }),

  jobCompleted: ({ orgName, jobTitle, providerName, amount }) => ({
    subject: `Job completed: ${jobTitle}`,
    html: base(`
      <div class="header"><h1>Job Completed</h1></div>
      <div class="body">
        <p>Hi <strong style="color:#e2e8f0">${orgName}</strong>,</p>
        <p><strong style="color:#e2e8f0">${providerName}</strong> has completed <strong style="color:#e2e8f0">${jobTitle}</strong>.</p>
        ${amount ? `<p>Budget: <strong style="color:#10B981">₨${amount.toLocaleString()}</strong></p>` : ''}
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-jobs" class="btn">View Jobs →</a>
      </div>
      <div class="footer">© ${new Date().getFullYear()} SkillForce Nepal</div>`),
  }),

  paymentSuccess: ({ name, amount, jobTitle }) => ({
    subject: `Payment confirmed — ₨${amount}`,
    html: base(`
      <div class="header"><h1>Payment Confirmed</h1></div>
      <div class="body">
        <p>Hi <strong style="color:#e2e8f0">${name}</strong>,</p>
        <p>Your payment of <strong style="color:#10B981">₨${amount}</strong> for <strong style="color:#e2e8f0">${jobTitle}</strong> was successful.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/my-jobs" class="btn">View Job →</a>
      </div>
      <div class="footer">© ${new Date().getFullYear()} SkillForce Nepal</div>`),
  }),

  suspended: ({ name, reason }) => ({
    subject: 'Your SkillForce account has been suspended',
    html: base(`
      <div class="header"><h1>Account Suspended</h1></div>
      <div class="body">
        <p>Hi <strong style="color:#e2e8f0">${name}</strong>,</p>
        <p>Your account has been suspended for the following reason:</p>
        <p style="background:#1E2530;padding:12px 16px;border-radius:8px;border-left:3px solid #EF4444;color:#fca5a5">${reason || 'Violation of terms of service'}</p>
        <p>If you believe this is a mistake, please contact support.</p>
      </div>
      <div class="footer">© ${new Date().getFullYear()} SkillForce Nepal</div>`),
  }),
};

module.exports = { sendEmail, emails };
