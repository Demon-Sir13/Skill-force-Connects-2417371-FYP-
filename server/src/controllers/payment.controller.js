const axios  = require('axios');
const crypto = require('crypto');
const Subscription    = require('../models/Subscription');
const Payment         = require('../models/Payment');
const User            = require('../models/User');
const ProviderProfile = require('../models/ProviderProfile');
const { log }         = require('../utils/activityLog');

const CLIENT_URL    = process.env.CLIENT_URL || 'http://localhost:5173';
const KHALTI_URL    = 'https://a.khalti.com/api/v2/epayment/initiate/';
const KHALTI_LOOKUP = 'https://a.khalti.com/api/v2/epayment/lookup/';

// ── Plan definitions (single source of truth) ─────────────────────────────────
const PLANS = {
  free: {
    priceNPR: 0,
    features: [
      'Basic profile',
      '5 applications/month',
      '2 job posts/month',
      'Email support',
      '10 free messages',
    ],
  },
  pro: {
    priceNPR: 150,
    features: [
      'Verified badge',
      'Unlimited applications',
      '20 job posts/month',
      'Priority support',
      'Unlimited messaging',
      'Portfolio priority boost',
      'Contract generator',
      '3 featured job slots',
      'Featured provider profile',
    ],
  },
  enterprise: {
    priceNPR: 999,
    features: [
      'All Pro features',
      'Unlimited job posts',
      'Featured placement',
      'Analytics dashboard',
      'Dedicated account manager',
      'Custom branding',
      'API access',
      'Team management',
      'SLA guarantee',
      'Priority matching',
    ],
  },
};

const MESSAGE_UNLOCK_PRICE = 150; // NPR

// ── Khalti helpers ────────────────────────────────────────────────────────────
async function initiateKhalti({ amountNPR, orderId, productName, returnUrl }) {
  const key = process.env.KHALTI_SECRET_KEY;
  if (!key) throw new Error('KHALTI_SECRET_KEY not configured');
  const { data } = await axios.post(
    KHALTI_URL,
    {
      return_url: returnUrl,
      website_url: CLIENT_URL,
      amount: Math.round(amountNPR * 100), // Khalti uses paisa
      purchase_order_id: orderId,
      purchase_order_name: productName,
    },
    { headers: { Authorization: `key ${key}` } }
  );
  return data; // { pidx, payment_url, ... }
}

async function lookupKhalti(pidx) {
  const key = process.env.KHALTI_SECRET_KEY;
  if (!key) throw new Error('KHALTI_SECRET_KEY not configured');
  const { data } = await axios.post(
    KHALTI_LOOKUP,
    { pidx },
    { headers: { Authorization: `key ${key}` } }
  );
  return data; // { status: 'Completed' | 'Pending' | ... }
}

// ── eSewa helpers ─────────────────────────────────────────────────────────────
function esewaSignature(message) {
  const secret = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
  return crypto.createHmac('sha256', secret).update(message).digest('base64');
}

function buildEsewaParams({ amountNPR, orderId, returnUrl }) {
  const merchantId = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
  const baseUrl    = process.env.NODE_ENV === 'production'
    ? 'https://epay.esewa.com.np'
    : 'https://rc-epay.esewa.com.np';
  const message   = `total_amount=${amountNPR},transaction_uuid=${orderId},product_code=${merchantId}`;
  const signature = esewaSignature(message);
  return {
    paymentUrl: `${baseUrl}/api/epay/main/v2/form`,
    params: {
      amount: amountNPR,
      tax_amount: 0,
      total_amount: amountNPR,
      transaction_uuid: orderId,
      product_code: merchantId,
      product_service_charge: 0,
      product_delivery_charge: 0,
      success_url: returnUrl,
      failure_url: `${CLIENT_URL}/payment/failure`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature,
    },
  };
}

/**
 * Verify eSewa callback data (base64-encoded JSON from eSewa redirect).
 * Returns { ok: true } or throws with a message.
 */
function verifyEsewaData(esewaData) {
  let decoded;
  try {
    decoded = JSON.parse(Buffer.from(esewaData, 'base64').toString('utf8'));
  } catch {
    throw new Error('Invalid eSewa data encoding');
  }

  if (decoded.status !== 'COMPLETE') {
    throw new Error(`eSewa payment status: ${decoded.status}`);
  }

  // Signature verification
  const merchantId = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
  const message    = `total_amount=${decoded.total_amount},transaction_uuid=${decoded.transaction_uuid},product_code=${merchantId}`;
  const expected   = esewaSignature(message);

  if (decoded.signature !== expected) {
    // In test/dev mode allow through with a warning; block in production
    if (process.env.NODE_ENV === 'production') {
      throw new Error('eSewa signature mismatch — possible tampered callback');
    }
    console.warn('[eSewa] Signature mismatch (allowed in dev/test mode)');
  }

  return { ok: true, decoded };
}

// ── Activate subscription + premium perks ─────────────────────────────────────
async function activateSubscription(userId, plan, gateway, paymentRef) {
  const now     = new Date();
  const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

  let sub = await Subscription.findOne({ userId });
  const subData = {
    plan,
    startDate:     now,
    endDate:       plan === 'free' ? null : endDate,
    active:        true,
    features:      PLANS[plan].features,
    priceNPR:      PLANS[plan].priceNPR,
    paymentMethod: gateway,
    paymentId:     paymentRef || '',
    // Reset usage on upgrade
    jobsPostedThisMonth:   0,
    applicationsThisMonth: 0,
    usagePeriodStart:      now,
  };

  if (sub) {
    Object.assign(sub, subData);
    await sub.save();
  } else {
    sub = await Subscription.create({ userId, ...subData });
  }

  // ── Grant premium perks based on plan ─────────────────────────────────────
  if (plan === 'pro' || plan === 'enterprise') {
    // Mark user as verified (premium badge)
    await User.findByIdAndUpdate(userId, { verified: true });

    // Mark provider profile as featured + premium badge
    await ProviderProfile.findOneAndUpdate(
      { userId },
      {
        featured:      true,
        featuredUntil: endDate,
        premiumBadge:  true,
      }
    );
  } else {
    // Downgrade: remove premium perks
    await ProviderProfile.findOneAndUpdate(
      { userId },
      { featured: false, premiumBadge: false }
    );
  }

  return sub;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/plans
// ─────────────────────────────────────────────────────────────────────────────
const getPlans = async (_req, res) => {
  res.json(PLANS);
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/subscribe
// Body: { plan, gateway }
// ─────────────────────────────────────────────────────────────────────────────
const initiateSubscription = async (req, res) => {
  try {
    const { plan, gateway = 'khalti' } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ message: 'Invalid plan' });

    // ── Free plan: instant switch, no payment ─────────────────────────────
    if (plan === 'free') {
      const sub = await activateSubscription(req.user._id, 'free', 'none', '');
      return res.json({ subscription: sub, message: 'Switched to free plan' });
    }

    const amountNPR = PLANS[plan].priceNPR;
    const orderId   = `SUB-${req.user._id}-${Date.now()}`;

    // ── Dev mode: no payment keys → auto-approve ──────────────────────────
    const hasKhaltiKey = !!process.env.KHALTI_SECRET_KEY;
    const hasEsewaKey  = !!process.env.ESEWA_SECRET_KEY;
    const isDev        = !hasKhaltiKey && !hasEsewaKey;

    if (isDev) {
      await Payment.create({
        userId: req.user._id, amount: amountNPR, type: 'subscription',
        purchaseOrderId: orderId, paymentId: `DEV-${Date.now()}`,
        status: 'completed', paymentGateway: 'dev', meta: { plan },
      });
      const sub = await activateSubscription(req.user._id, plan, 'dev', orderId);
      await log(req.user._id, 'subscription_upgrade', { meta: { plan, amount: amountNPR, gateway: 'dev' } });
      return res.json({ subscription: sub, message: `Upgraded to ${plan} (dev mode)` });
    }

    // ── Create pending payment record ─────────────────────────────────────
    await Payment.create({
      userId: req.user._id, amount: amountNPR, type: 'subscription',
      purchaseOrderId: orderId, status: 'pending',
      paymentGateway: gateway, meta: { plan },
    });

    const returnUrl = `${CLIENT_URL}/payment/success?type=subscription&plan=${plan}&order_id=${orderId}`;

    if (gateway === 'esewa') {
      const esewa = buildEsewaParams({ amountNPR, orderId, returnUrl });
      return res.json({ gateway: 'esewa', ...esewa, purchaseOrderId: orderId });
    }

    // Khalti
    const khalti = await initiateKhalti({
      amountNPR, orderId,
      productName: `SkillForce ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
      returnUrl,
    });
    await Payment.findOneAndUpdate({ purchaseOrderId: orderId }, { paymentId: khalti.pidx });
    return res.json({
      gateway: 'khalti',
      paymentUrl: khalti.payment_url,
      purchaseOrderId: orderId,
      pidx: khalti.pidx,
    });
  } catch (err) {
    console.error('[Payment/subscribe]', err.response?.data || err.message);
    res.status(500).json({ message: 'Payment initiation failed. Please try again.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/verify-subscription
// Body: { plan, purchaseOrderId, pidx?, esewaData? }
// ─────────────────────────────────────────────────────────────────────────────
const verifySubscription = async (req, res) => {
  try {
    const { plan, purchaseOrderId, pidx, esewaData } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ message: 'Invalid plan' });

    // ── Idempotency: if already completed for this order, return existing sub ─
    if (purchaseOrderId) {
      const existingPayment = await Payment.findOne({ purchaseOrderId });
      if (existingPayment?.status === 'completed') {
        const sub = await Subscription.findOne({ userId: req.user._id });
        return res.json(sub);
      }
    }

    // ── Verify Khalti ─────────────────────────────────────────────────────
    if (pidx && process.env.KHALTI_SECRET_KEY) {
      const lookup = await lookupKhalti(pidx);
      if (lookup.status !== 'Completed') {
        return res.status(400).json({
          message: `Khalti payment not completed. Status: ${lookup.status}`,
          code: 'PAYMENT_NOT_COMPLETED',
        });
      }
    }

    // ── Verify eSewa ──────────────────────────────────────────────────────
    if (esewaData) {
      try {
        verifyEsewaData(esewaData);
      } catch (err) {
        return res.status(400).json({ message: err.message, code: 'ESEWA_VERIFICATION_FAILED' });
      }
    }

    // ── Mark payment completed ────────────────────────────────────────────
    const gateway = pidx ? 'khalti' : esewaData ? 'esewa' : 'dev';
    const payRef  = pidx || purchaseOrderId || '';
    if (purchaseOrderId) {
      await Payment.findOneAndUpdate(
        { purchaseOrderId },
        { status: 'completed', paymentId: payRef, paymentGateway: gateway }
      );
    }

    // ── Activate subscription + premium perks ─────────────────────────────
    const sub = await activateSubscription(req.user._id, plan, gateway, payRef);
    await log(req.user._id, 'subscription_upgrade', { meta: { plan, amount: PLANS[plan].priceNPR, gateway } });

    res.json(sub);
  } catch (err) {
    console.error('[Payment/verify-subscription]', err.message);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/unlock-messaging
// Body: { gateway }
// ─────────────────────────────────────────────────────────────────────────────
const initiateMessageUnlock = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.messagingUnlocked) {
      return res.json({ message: 'Messaging already unlocked', unlocked: true });
    }

    const orderId = `MSG-${req.user._id}-${Date.now()}`;
    const gw      = req.body.gateway || 'khalti';

    // Dev mode
    if (!process.env.KHALTI_SECRET_KEY && !process.env.ESEWA_SECRET_KEY) {
      await Payment.create({
        userId: req.user._id, amount: MESSAGE_UNLOCK_PRICE, type: 'messaging',
        purchaseOrderId: orderId, paymentId: `DEV-${Date.now()}`,
        status: 'completed', paymentGateway: 'dev',
      });
      user.messagingUnlocked = true;
      await user.save();
      return res.json({ message: 'Messaging unlocked (dev)', unlocked: true });
    }

    await Payment.create({
      userId: req.user._id, amount: MESSAGE_UNLOCK_PRICE, type: 'messaging',
      purchaseOrderId: orderId, status: 'pending', paymentGateway: gw,
    });

    const returnUrl = `${CLIENT_URL}/payment/success?type=messaging&order_id=${orderId}`;

    if (gw === 'esewa') {
      const esewa = buildEsewaParams({ amountNPR: MESSAGE_UNLOCK_PRICE, orderId, returnUrl });
      return res.json({ gateway: 'esewa', ...esewa, purchaseOrderId: orderId });
    }

    const khalti = await initiateKhalti({
      amountNPR: MESSAGE_UNLOCK_PRICE, orderId,
      productName: 'SkillForce Messaging Unlock', returnUrl,
    });
    await Payment.findOneAndUpdate({ purchaseOrderId: orderId }, { paymentId: khalti.pidx });
    res.json({ gateway: 'khalti', paymentUrl: khalti.payment_url, purchaseOrderId: orderId, pidx: khalti.pidx });
  } catch (err) {
    console.error('[Payment/unlock-messaging]', err.message);
    res.status(500).json({ message: 'Payment initiation failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payments/verify-messaging
// Body: { purchaseOrderId, pidx?, esewaData? }
// ─────────────────────────────────────────────────────────────────────────────
const verifyMessageUnlock = async (req, res) => {
  try {
    const { purchaseOrderId, pidx, esewaData } = req.body || {};
    const user = await User.findById(req.user._id);

    if (user.messagingUnlocked) {
      return res.json({ message: 'Already unlocked', unlocked: true });
    }

    // Idempotency
    if (purchaseOrderId) {
      const existing = await Payment.findOne({ purchaseOrderId });
      if (existing?.status === 'completed') {
        user.messagingUnlocked = true;
        await user.save();
        return res.json({ message: 'Messaging unlocked', unlocked: true });
      }
    }

    // Verify Khalti
    if (pidx && process.env.KHALTI_SECRET_KEY) {
      const lookup = await lookupKhalti(pidx);
      if (lookup.status !== 'Completed') {
        return res.status(400).json({ message: `Khalti payment not completed. Status: ${lookup.status}` });
      }
    }

    // Verify eSewa
    if (esewaData) {
      try {
        verifyEsewaData(esewaData);
      } catch (err) {
        return res.status(400).json({ message: err.message, code: 'ESEWA_VERIFICATION_FAILED' });
      }
    }

    const gateway = pidx ? 'khalti' : esewaData ? 'esewa' : 'dev';
    if (purchaseOrderId) {
      await Payment.findOneAndUpdate(
        { purchaseOrderId },
        { status: 'completed', paymentId: pidx || '', paymentGateway: gateway }
      );
    }

    user.messagingUnlocked = true;
    await user.save();
    await log(req.user._id, 'messaging_unlocked', { meta: { amount: MESSAGE_UNLOCK_PRICE } });
    res.json({ message: 'Messaging unlocked', unlocked: true });
  } catch (err) {
    console.error('[Payment/verify-messaging]', err.message);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/messaging-status
// ─────────────────────────────────────────────────────────────────────────────
const getMessagingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const sub  = await Subscription.findOne({ userId: req.user._id });
    const isPro = sub && ['pro', 'enterprise'].includes(sub.plan) && sub.active;
    res.json({
      messageCount:      user.messageCount || 0,
      messagingUnlocked: user.messagingUnlocked || isPro,
      freeLimit:         10,
      unlockPrice:       MESSAGE_UNLOCK_PRICE,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/history  — user's own payment history
// ─────────────────────────────────────────────────────────────────────────────
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/all  — admin: all payments
// ─────────────────────────────────────────────────────────────────────────────
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(payments);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payments/subscription-status  — current sub + usage
// ─────────────────────────────────────────────────────────────────────────────
const getSubscriptionStatus = async (req, res) => {
  try {
    let sub = await Subscription.findOne({ userId: req.user._id });
    if (!sub) {
      sub = await Subscription.create({
        userId: req.user._id,
        plan: 'free',
        features: PLANS.free.features,
      });
    }

    // Auto-expire check
    if (sub.plan !== 'free' && sub.endDate && new Date() > new Date(sub.endDate)) {
      sub.plan   = 'free';
      sub.active = false;
      await sub.save();
    }

    const limits = {
      free:       { jobsPerMonth: 2,  applicationsPerMonth: 5  },
      pro:        { jobsPerMonth: 20, applicationsPerMonth: -1 },
      enterprise: { jobsPerMonth: -1, applicationsPerMonth: -1 },
    };

    res.json({
      ...sub.toObject(),
      limits: limits[sub.plan] || limits.free,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = {
  getPlans,
  initiateSubscription,
  verifySubscription,
  initiateMessageUnlock,
  verifyMessageUnlock,
  getMessagingStatus,
  getPaymentHistory,
  getAllPayments,
  getSubscriptionStatus,
};
