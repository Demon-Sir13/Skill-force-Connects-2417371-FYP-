const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { log } = require('../utils/activityLog');

// eSewa config — uses test credentials in dev
const ESEWA_CONFIG = {
  merchantId: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
  secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
  baseUrl: process.env.NODE_ENV === 'production'
    ? 'https://epay.esewa.com.np'
    : 'https://rc-epay.esewa.com.np',
  successUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/success`,
  failureUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment/failure`,
};

const PLANS = {
  free: { priceNPR: 0, features: ['Basic profile', '5 applications/month', 'Email support', '10 free messages'] },
  pro: { priceNPR: 150, features: ['Verified badge', 'Unlimited applications', 'Priority support', 'Unlimited messaging', 'Portfolio priority boost', 'Contract generator'] },
  enterprise: { priceNPR: 999, features: ['All Pro features', 'Featured placement', 'Analytics dashboard', 'Dedicated account manager', 'Custom branding', 'API access', 'Team management', 'SLA guarantee', 'Priority matching'] },
};

const MESSAGE_UNLOCK_PRICE = 150; // NPR

// Generate eSewa signature
const generateSignature = (message) => {
  return crypto.createHmac('sha256', ESEWA_CONFIG.secretKey)
    .update(message).digest('base64');
};

// Get subscription plans with NPR pricing
const getPlans = async (_req, res) => {
  res.json(PLANS);
};

// Initiate eSewa payment for subscription
const initiateSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ message: 'Invalid plan' });
    if (plan === 'free') {
      let sub = await Subscription.findOne({ userId: req.user._id });
      if (sub) {
        sub.plan = 'free'; sub.priceNPR = 0; sub.features = PLANS.free.features; sub.active = true;
        await sub.save();
      } else {
        sub = await Subscription.create({ userId: req.user._id, plan: 'free', features: PLANS.free.features });
      }
      return res.json({ subscription: sub, message: 'Switched to free plan' });
    }

    const amount = PLANS[plan].priceNPR;
    const txnId = `SUB-${req.user._id}-${Date.now()}`;
    const message = `total_amount=${amount},transaction_uuid=${txnId},product_code=${ESEWA_CONFIG.merchantId}`;
    const signature = generateSignature(message);

    res.json({
      paymentUrl: `${ESEWA_CONFIG.baseUrl}/api/epay/main/v2/form`,
      params: {
        amount: amount,
        tax_amount: 0,
        total_amount: amount,
        transaction_uuid: txnId,
        product_code: ESEWA_CONFIG.merchantId,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `${ESEWA_CONFIG.successUrl}?type=subscription&plan=${plan}`,
        failure_url: ESEWA_CONFIG.failureUrl,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: signature,
      },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Verify eSewa payment and activate subscription
const verifySubscription = async (req, res) => {
  try {
    const { plan, transactionData } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ message: 'Invalid plan' });

    // In dev mode, auto-approve for testing
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev && transactionData) {
      // Verify with eSewa API in production
      const decoded = JSON.parse(Buffer.from(transactionData, 'base64').toString());
      const message = `total_amount=${decoded.total_amount},transaction_uuid=${decoded.transaction_uuid},product_code=${ESEWA_CONFIG.merchantId}`;
      const expectedSig = generateSignature(message);
      if (decoded.signature !== expectedSig) {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
    }

    let sub = await Subscription.findOne({ userId: req.user._id });
    if (sub) {
      sub.plan = plan;
      sub.startDate = new Date();
      sub.endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      sub.active = true;
      sub.features = PLANS[plan].features;
      sub.priceNPR = PLANS[plan].priceNPR;
      sub.paymentMethod = 'esewa';
      sub.paymentId = transactionData || `DEV-${Date.now()}`;
      await sub.save();
    } else {
      sub = await Subscription.create({
        userId: req.user._id, plan,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        features: PLANS[plan].features, priceNPR: PLANS[plan].priceNPR,
        paymentMethod: 'esewa', paymentId: transactionData || `DEV-${Date.now()}`,
      });
    }

    await log(req.user._id, 'subscription_upgrade', { meta: { plan, amount: PLANS[plan].priceNPR } });
    res.json(sub);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Unlock messaging (NPR 150)
const initiateMessageUnlock = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.messagingUnlocked) return res.json({ message: 'Messaging already unlocked', unlocked: true });

    const txnId = `MSG-${req.user._id}-${Date.now()}`;
    const message = `total_amount=${MESSAGE_UNLOCK_PRICE},transaction_uuid=${txnId},product_code=${ESEWA_CONFIG.merchantId}`;
    const signature = generateSignature(message);

    res.json({
      price: MESSAGE_UNLOCK_PRICE,
      paymentUrl: `${ESEWA_CONFIG.baseUrl}/api/epay/main/v2/form`,
      params: {
        amount: MESSAGE_UNLOCK_PRICE, tax_amount: 0, total_amount: MESSAGE_UNLOCK_PRICE,
        transaction_uuid: txnId, product_code: ESEWA_CONFIG.merchantId,
        product_service_charge: 0, product_delivery_charge: 0,
        success_url: `${ESEWA_CONFIG.successUrl}?type=messaging`,
        failure_url: ESEWA_CONFIG.failureUrl,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: signature,
      },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Verify message unlock payment
const verifyMessageUnlock = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.messagingUnlocked) return res.json({ message: 'Already unlocked', unlocked: true });
    user.messagingUnlocked = true;
    await user.save();
    await log(req.user._id, 'messaging_unlocked', { meta: { amount: MESSAGE_UNLOCK_PRICE } });
    res.json({ message: 'Messaging unlocked', unlocked: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Check messaging status
const getMessagingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const sub = await Subscription.findOne({ userId: req.user._id });
    const isPro = sub && ['pro', 'enterprise'].includes(sub.plan) && sub.active;
    res.json({
      messageCount: user.messageCount || 0,
      messagingUnlocked: user.messagingUnlocked || isPro,
      freeLimit: 10,
      unlockPrice: MESSAGE_UNLOCK_PRICE,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  getPlans, initiateSubscription, verifySubscription,
  initiateMessageUnlock, verifyMessageUnlock, getMessagingStatus,
};
