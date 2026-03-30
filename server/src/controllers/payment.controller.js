const axios = require('axios');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { log } = require('../utils/activityLog');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const KHALTI_URL = 'https://a.khalti.com/api/v2/epayment/initiate/';
const KHALTI_LOOKUP = 'https://a.khalti.com/api/v2/epayment/lookup/';

const PLANS = {
  free: { priceNPR: 0, features: ['Basic profile', '5 applications/month', 'Email support', '10 free messages'] },
  pro: { priceNPR: 150, features: ['Verified badge', 'Unlimited applications', 'Priority support', 'Unlimited messaging', 'Portfolio priority boost', 'Contract generator'] },
  enterprise: { priceNPR: 999, features: ['All Pro features', 'Featured placement', 'Analytics dashboard', 'Dedicated account manager', 'Custom branding', 'API access', 'Team management', 'SLA guarantee', 'Priority matching'] },
};
const MESSAGE_UNLOCK_PRICE = 150;

// ─── Khalti helpers ──────────────────────────────────────────────────────────
async function initiateKhalti({ amountNPR, orderId, productName, returnUrl }) {
  const key = process.env.KHALTI_SECRET_KEY;
  if (!key) throw new Error('KHALTI_SECRET_KEY not set');
  const { data } = await axios.post(KHALTI_URL, {
    return_url: returnUrl, website_url: CLIENT_URL,
    amount: Math.round(amountNPR * 100),
    purchase_order_id: orderId, purchase_order_name: productName,
  }, { headers: { 'Authorization': `key ${key}` } });
  console.log(`[Khalti] Initiated: ${data.pidx} — ₨${amountNPR}`);
  return data;
}
async function lookupKhalti(pidx) {
  const key = process.env.KHALTI_SECRET_KEY;
  const { data } = await axios.post(KHALTI_LOOKUP, { pidx }, { headers: { 'Authorization': `key ${key}` } });
  return data;
}

// ─── eSewa helpers ───────────────────────────────────────────────────────────
function generateEsewaSignature(message) {
  const secret = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
  return crypto.createHmac('sha256', secret).update(message).digest('base64');
}
function buildEsewaParams({ amountNPR, orderId, returnUrl }) {
  const merchantId = process.env.ESEWA_MERCHANT_ID || 'EPAYTEST';
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://epay.esewa.com.np' : 'https://rc-epay.esewa.com.np';
  const message = `total_amount=${amountNPR},transaction_uuid=${orderId},product_code=${merchantId}`;
  const signature = generateEsewaSignature(message);
  return {
    paymentUrl: `${baseUrl}/api/epay/main/v2/form`,
    params: {
      amount: amountNPR, tax_amount: 0, total_amount: amountNPR,
      transaction_uuid: orderId, product_code: merchantId,
      product_service_charge: 0, product_delivery_charge: 0,
      success_url: returnUrl, failure_url: `${CLIENT_URL}/payment/failure`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature,
    },
  };
}

const getPlans = async (_req, res) => { res.json(PLANS); };

// ─── Initiate subscription ───────────────────────────────────────────────────
const initiateSubscription = async (req, res) => {
  try {
    const { plan, gateway } = req.body; // gateway: 'khalti' | 'esewa'
    if (!PLANS[plan]) return res.status(400).json({ message: 'Invalid plan' });

    if (plan === 'free') {
      let sub = await Subscription.findOne({ userId: req.user._id });
      if (sub) { Object.assign(sub, { plan: 'free', priceNPR: 0, features: PLANS.free.features, active: true, paymentMethod: 'none' }); await sub.save(); }
      else { sub = await Subscription.create({ userId: req.user._id, plan: 'free', features: PLANS.free.features }); }
      return res.json({ subscription: sub, message: 'Switched to free plan' });
    }

    const amountNPR = PLANS[plan].priceNPR;
    const orderId = `SUB-${req.user._id}-${Date.now()}`;
    const chosenGateway = gateway || 'khalti';

    // No keys → dev auto-approve
    if (!process.env.KHALTI_SECRET_KEY && chosenGateway === 'khalti') {
      await Payment.create({ userId: req.user._id, amount: amountNPR, type: 'subscription', purchaseOrderId: orderId, paymentId: `DEV-${Date.now()}`, status: 'completed', paymentGateway: 'dev', meta: { plan } });
      let sub = await Subscription.findOne({ userId: req.user._id });
      if (sub) { Object.assign(sub, { plan, priceNPR: amountNPR, features: PLANS[plan].features, active: true, startDate: new Date(), endDate: new Date(Date.now()+30*24*60*60*1000), paymentMethod: 'dev' }); await sub.save(); }
      else { sub = await Subscription.create({ userId: req.user._id, plan, features: PLANS[plan].features, priceNPR: amountNPR, endDate: new Date(Date.now()+30*24*60*60*1000), paymentMethod: 'dev' }); }
      return res.json({ subscription: sub, message: `Upgraded to ${plan} (dev mode)` });
    }

    await Payment.create({ userId: req.user._id, amount: amountNPR, type: 'subscription', purchaseOrderId: orderId, status: 'pending', paymentGateway: chosenGateway, meta: { plan } });
    const returnUrl = `${CLIENT_URL}/payment/success?type=subscription&plan=${plan}&order_id=${orderId}`;

    if (chosenGateway === 'esewa') {
      const esewa = buildEsewaParams({ amountNPR, orderId, returnUrl });
      return res.json({ gateway: 'esewa', ...esewa, purchaseOrderId: orderId });
    }

    // Khalti
    const khalti = await initiateKhalti({ amountNPR, orderId, productName: `SkillForce ${plan} Plan`, returnUrl });
    await Payment.findOneAndUpdate({ purchaseOrderId: orderId }, { paymentId: khalti.pidx });
    res.json({ gateway: 'khalti', paymentUrl: khalti.payment_url, purchaseOrderId: orderId, pidx: khalti.pidx });
  } catch (err) {
    console.error('[Payment]', err.response?.data || err.message);
    res.status(500).json({ message: 'Payment initiation failed' });
  }
};

const verifySubscription = async (req, res) => {
  try {
    const { plan, purchaseOrderId, pidx } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ message: 'Invalid plan' });
    if (pidx && process.env.KHALTI_SECRET_KEY) {
      try { const l = await lookupKhalti(pidx); if (l.status !== 'Completed') return res.status(400).json({ message: `Payment ${l.status}` }); } catch (e) { console.warn('[Khalti] Lookup:', e.message); }
    }
    if (purchaseOrderId) await Payment.findOneAndUpdate({ purchaseOrderId }, { status: 'completed', paymentId: pidx || '' });
    let sub = await Subscription.findOne({ userId: req.user._id });
    const subData = { plan, startDate: new Date(), endDate: new Date(Date.now()+30*24*60*60*1000), active: true, features: PLANS[plan].features, priceNPR: PLANS[plan].priceNPR, paymentMethod: pidx ? 'khalti' : 'esewa', paymentId: pidx || purchaseOrderId || '' };
    if (sub) { Object.assign(sub, subData); await sub.save(); } else { sub = await Subscription.create({ userId: req.user._id, ...subData }); }
    await log(req.user._id, 'subscription_upgrade', { meta: { plan, amount: PLANS[plan].priceNPR } });
    res.json(sub);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const initiateMessageUnlock = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.messagingUnlocked) return res.json({ message: 'Already unlocked', unlocked: true });
    const orderId = `MSG-${req.user._id}-${Date.now()}`;
    const gw = req.body.gateway || 'khalti';
    if (!process.env.KHALTI_SECRET_KEY && gw === 'khalti') {
      await Payment.create({ userId: req.user._id, amount: MESSAGE_UNLOCK_PRICE, type: 'messaging', purchaseOrderId: orderId, paymentId: `DEV-${Date.now()}`, status: 'completed', paymentGateway: 'dev' });
      user.messagingUnlocked = true; await user.save();
      return res.json({ message: 'Messaging unlocked (dev)', unlocked: true });
    }
    await Payment.create({ userId: req.user._id, amount: MESSAGE_UNLOCK_PRICE, type: 'messaging', purchaseOrderId: orderId, status: 'pending', paymentGateway: gw });
    const returnUrl = `${CLIENT_URL}/payment/success?type=messaging&order_id=${orderId}`;
    if (gw === 'esewa') { const e = buildEsewaParams({ amountNPR: MESSAGE_UNLOCK_PRICE, orderId, returnUrl }); return res.json({ gateway: 'esewa', ...e }); }
    const k = await initiateKhalti({ amountNPR: MESSAGE_UNLOCK_PRICE, orderId, productName: 'SkillForce Messaging', returnUrl });
    await Payment.findOneAndUpdate({ purchaseOrderId: orderId }, { paymentId: k.pidx });
    res.json({ gateway: 'khalti', paymentUrl: k.payment_url, purchaseOrderId: orderId });
  } catch (err) { res.status(500).json({ message: 'Payment failed' }); }
};

const verifyMessageUnlock = async (req, res) => {
  try {
    const { purchaseOrderId, pidx } = req.body || {};
    const user = await User.findById(req.user._id);
    if (user.messagingUnlocked) return res.json({ message: 'Already unlocked', unlocked: true });
    if (pidx && process.env.KHALTI_SECRET_KEY) { try { const l = await lookupKhalti(pidx); if (l.status !== 'Completed') return res.status(400).json({ message: `Payment ${l.status}` }); } catch {} }
    if (purchaseOrderId) await Payment.findOneAndUpdate({ purchaseOrderId }, { status: 'completed', paymentId: pidx || '' });
    user.messagingUnlocked = true; await user.save();
    await log(req.user._id, 'messaging_unlocked', { meta: { amount: MESSAGE_UNLOCK_PRICE } });
    res.json({ message: 'Messaging unlocked', unlocked: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const getMessagingStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const sub = await Subscription.findOne({ userId: req.user._id });
    const isPro = sub && ['pro', 'enterprise'].includes(sub.plan) && sub.active;
    res.json({ messageCount: user.messageCount || 0, messagingUnlocked: user.messagingUnlocked || isPro, freeLimit: 10, unlockPrice: MESSAGE_UNLOCK_PRICE });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
const getPaymentHistory = async (req, res) => {
  try { res.json(await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 })); } catch (err) { res.status(500).json({ message: err.message }); }
};
const getAllPayments = async (req, res) => {
  try { res.json(await Payment.find().populate('userId', 'name email role').sort({ createdAt: -1 }).limit(100)); } catch (err) { res.status(500).json({ message: err.message }); }
};
module.exports = { getPlans, initiateSubscription, verifySubscription, initiateMessageUnlock, verifyMessageUnlock, getMessagingStatus, getPaymentHistory, getAllPayments };
