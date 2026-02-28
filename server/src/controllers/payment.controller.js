const axios = require('axios');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { log } = require('../utils/activityLog');

const KHALTI_URL = 'https://a.khalti.com/api/v2/epayment/initiate/';
const KHALTI_LOOKUP = 'https://a.khalti.com/api/v2/epayment/lookup/';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const PLANS = {
  free: {
    priceNPR: 0,
    features: ['Basic profile', '5 applications/month', 'Email support', '10 free messages'],
  },
  pro: {
    priceNPR: 150,
    features: [
      'Verified badge', 'Unlimited applications', 'Priority support',
      'Unlimited messaging', 'Portfolio priority boost', 'Contract generator',
    ],
  },
  enterprise: {
    priceNPR: 999,
    features: [
      'All Pro features', 'Featured placement', 'Analytics dashboard',
      'Dedicated account manager', 'Custom branding', 'API access',
      'Team management', 'SLA guarantee', 'Priority matching',
    ],
  },
};

const MESSAGE_UNLOCK_PRICE = 150; // NPR

function getKhaltiKey() {
  return process.env.KHALTI_SECRET_KEY || process.env.PERIPAY_API_KEY || '';
}

// ─── Helper: initiate Khalti payment ─────────────────────────────────────────
async function initiateKhalti({ amountNPR, orderId, productName, returnUrl }) {
  const key = getKhaltiKey();
  if (!key) throw new Error('KHALTI_SECRET_KEY not set');

  const amountPaisa = Math.round(amountNPR * 100);
  const { data } = await axios.post(KHALTI_URL, {
    return_url: returnUrl,
    website_url: CLIENT_URL,
    amount: amountPaisa,
    purchase_order_id: orderId,
    purchase_order_name: productName,
  }, {
    headers: { 'Authorization': `key ${key}` },
  });

  console.log(`[Khalti] Payment initiated: ${data.pidx} — ₨${amountNPR}`);
  return data; // { pidx, payment_url, expires_at }
}

// ─── Helper: verify Khalti payment ───────────────────────────────────────────
async function lookupKhalti(pidx) {
  const key = getKhaltiKey();
  const { data } = await axios.post(KHALTI_LOOKUP, { pidx }, {
    headers: { 'Authorization': `key ${key}` },
  });
  return data; // { pidx, status, total_amount, ... }
}

// ─── Get plans ───────────────────────────────────────────────────────────────
const getPlans = async (_req, res) => { res.json(PLANS); };

// ─── Initiate subscription payment ───────────────────────────────────────────
const initiateSubscription = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ message: 'Invalid plan' });

    if (plan === 'free') {
      let sub = await Subscription.findOne({ userId: req.user._id });
      if (sub) {
        sub.plan = 'free'; sub.priceNPR = 0; sub.features = PLANS.free.features;
        sub.active = true; sub.paymentMethod = 'none'; await sub.save();
      } else {
        sub = await Subscription.create({ userId: req.user._id, plan: 'free', features: PLANS.free.features });
      }
      return res.json({ subscription: sub, message: 'Switched to free plan' });
    }

    const amountNPR = PLANS[plan].priceNPR;
    const orderId = `SUB-${req.user._id}-${Date.now()}`;
    const khaltiKey = getKhaltiKey();

    // No key → dev auto-approve
    if (!khaltiKey) {
      await Payment.create({
        userId: req.user._id, amount: amountNPR, type: 'subscription',
        purchaseOrderId: orderId, paymentId: `DEV-${Date.now()}`,
        status: 'completed', paymentGateway: 'dev',
        meta: { plan, mode: 'dev' },
      });
      let sub = await Subscription.findOne({ userId: req.user._id });
      if (sub) {
        Object.assign(sub, { plan, priceNPR: amountNPR, features: PLANS[plan].features,
          active: true, startDate: new Date(),
          endDate: new Date(Date.now() + 30*24*60*60*1000),
          paymentMethod: 'dev', paymentId: `DEV-${Date.now()}` });
        await sub.save();
      } else {
        sub = await Subscription.create({ userId: req.user._id, plan,
          features: PLANS[plan].features, priceNPR: amountNPR,
          endDate: new Date(Date.now() + 30*24*60*60*1000),
          paymentMethod: 'dev', paymentId: `DEV-${Date.now()}` });
      }
      await log(req.user._id, 'subscription_upgrade', { meta: { plan, amount: amountNPR } });
      return res.json({ subscription: sub, message: `Upgraded to ${plan} (dev mode)` });
    }

    // Real Khalti payment
    await Payment.create({
      userId: req.user._id, amount: amountNPR, type: 'subscription',
      purchaseOrderId: orderId, status: 'pending', paymentGateway: 'khalti',
      meta: { plan },
    });

    const returnUrl = `${CLIENT_URL}/payment/success?type=subscription&plan=${plan}&order_id=${orderId}`;
    const khalti = await initiateKhalti({ amountNPR, orderId, productName: `SkillForce ${plan} Plan`, returnUrl });

    // Store pidx for later verification
    await Payment.findOneAndUpdate({ purchaseOrderId: orderId }, { paymentId: khalti.pidx });

    res.json({ paymentUrl: khalti.payment_url, purchaseOrderId: orderId, pidx: khalti.pidx });
  } catch (err) {
    console.error('[Payment] Error:', err.response?.data || err.message);
    res.status(500).json({ message: err.response?.data?.detail || 'Payment initiation failed' });
  }
};

// ─── Verify subscription after Khalti return ─────────────────────────────────
const verifySubscription = async (req, res) => {
  try {
    const { plan, purchaseOrderId, pidx } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ message: 'Invalid plan' });

    // Verify with Khalti if pidx provided
    if (pidx && getKhaltiKey()) {
      try {
        const lookup = await lookupKhalti(pidx);
        console.log('[Khalti] Lookup:', lookup.status, lookup.total_amount);
        if (lookup.status !== 'Completed') {
          return res.status(400).json({ message: `Payment ${lookup.status}. Not completed.` });
        }
      } catch (e) {
        console.warn('[Khalti] Lookup failed:', e.response?.data || e.message);
      }
    }

    // Update payment record
    if (purchaseOrderId) {
      await Payment.findOneAndUpdate({ purchaseOrderId }, { status: 'completed', paymentId: pidx || '' });
    }

    let sub = await Subscription.findOne({ userId: req.user._id });
    if (sub) {
      Object.assign(sub, { plan, startDate: new Date(),
        endDate: new Date(Date.now() + 30*24*60*60*1000),
        active: true, features: PLANS[plan].features,
        priceNPR: PLANS[plan].priceNPR, paymentMethod: 'khalti',
        paymentId: pidx || purchaseOrderId || '' });
      await sub.save();
    } else {
      sub = await Subscription.create({ userId: req.user._id, plan,
        endDate: new Date(Date.now() + 30*24*60*60*1000),
        features: PLANS[plan].features, priceNPR: PLANS[plan].priceNPR,
        paymentMethod: 'khalti', paymentId: pidx || purchaseOrderId || '' });
    }

    await log(req.user._id, 'subscription_upgrade', { meta: { plan, amount: PLANS[plan].priceNPR, pidx } });
    res.json(sub);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Initiate message unlock ─────────────────────────────────────────────────
const initiateMessageUnlock = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.messagingUnlocked) return res.json({ message: 'Already unlocked', unlocked: true });

    const orderId = `MSG-${req.user._id}-${Date.now()}`;
    const khaltiKey = getKhaltiKey();

    if (!khaltiKey) {
      await Payment.create({ userId: req.user._id, amount: MESSAGE_UNLOCK_PRICE,
        type: 'messaging', purchaseOrderId: orderId, paymentId: `DEV-${Date.now()}`,
        status: 'completed', paymentGateway: 'dev', meta: { mode: 'dev' } });
      user.messagingUnlocked = true; await user.save();
      await log(req.user._id, 'messaging_unlocked', { meta: { amount: MESSAGE_UNLOCK_PRICE } });
      return res.json({ message: 'Messaging unlocked (dev mode)', unlocked: true });
    }

    await Payment.create({ userId: req.user._id, amount: MESSAGE_UNLOCK_PRICE,
      type: 'messaging', purchaseOrderId: orderId, status: 'pending', paymentGateway: 'khalti' });

    const returnUrl = `${CLIENT_URL}/payment/success?type=messaging&order_id=${orderId}`;
    const khalti = await initiateKhalti({ amountNPR: MESSAGE_UNLOCK_PRICE, orderId,
      productName: 'SkillForce Messaging Unlock', returnUrl });

    await Payment.findOneAndUpdate({ purchaseOrderId: orderId }, { paymentId: khalti.pidx });
    res.json({ price: MESSAGE_UNLOCK_PRICE, paymentUrl: khalti.payment_url, purchaseOrderId: orderId });
  } catch (err) {
    console.error('[Payment] Unlock error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Payment initiation failed' });
  }
};

// ─── Verify message unlock ───────────────────────────────────────────────────
const verifyMessageUnlock = async (req, res) => {
  try {
    const { purchaseOrderId, pidx } = req.body || {};
    const user = await User.findById(req.user._id);
    if (user.messagingUnlocked) return res.json({ message: 'Already unlocked', unlocked: true });

    if (pidx && getKhaltiKey()) {
      try {
        const lookup = await lookupKhalti(pidx);
        if (lookup.status !== 'Completed') {
          return res.status(400).json({ message: `Payment ${lookup.status}` });
        }
      } catch (e) { console.warn('[Khalti] Lookup failed:', e.message); }
    }

    if (purchaseOrderId) {
      await Payment.findOneAndUpdate({ purchaseOrderId }, { status: 'completed', paymentId: pidx || '' });
    }
    user.messagingUnlocked = true; await user.save();
    await log(req.user._id, 'messaging_unlocked', { meta: { amount: MESSAGE_UNLOCK_PRICE } });
    res.json({ message: 'Messaging unlocked', unlocked: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Messaging status ────────────────────────────────────────────────────────
const getMessagingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const sub = await Subscription.findOne({ userId: req.user._id });
    const isPro = sub && ['pro', 'enterprise'].includes(sub.plan) && sub.active;
    res.json({
      messageCount: user.messageCount || 0,
      messagingUnlocked: user.messagingUnlocked || isPro,
      freeLimit: 10, unlockPrice: MESSAGE_UNLOCK_PRICE,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('userId', 'name email role').sort({ createdAt: -1 }).limit(100);
    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  getPlans, initiateSubscription, verifySubscription,
  initiateMessageUnlock, verifyMessageUnlock, getMessagingStatus,
  getPaymentHistory, getAllPayments,
};
