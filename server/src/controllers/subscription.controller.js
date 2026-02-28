const Subscription = require('../models/Subscription');

const PLANS = {
  free: { priceNPR: 0, features: ['Basic profile', '5 applications/month', 'Email support', '10 free messages'] },
  pro: { priceNPR: 150, features: ['Verified badge', 'Unlimited applications', 'Priority support', 'Unlimited messaging', 'Portfolio priority boost', 'Contract generator'] },
  enterprise: { priceNPR: 999, features: ['All Pro features', 'Featured placement', 'Analytics dashboard', 'Dedicated account manager', 'Custom branding', 'API access', 'Team management', 'SLA guarantee', 'Priority matching'] },
};

const getPlans = async (_req, res) => { res.json(PLANS); };

const subscribe = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) return res.status(400).json({ message: 'Invalid plan' });
    let sub = await Subscription.findOne({ userId: req.user._id });
    if (sub) {
      sub.plan = plan;
      sub.startDate = new Date();
      sub.endDate = plan === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      sub.active = true;
      sub.features = PLANS[plan].features;
      sub.priceNPR = PLANS[plan].priceNPR;
      await sub.save();
    } else {
      sub = await Subscription.create({
        userId: req.user._id, plan,
        endDate: plan === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        features: PLANS[plan].features, priceNPR: PLANS[plan].priceNPR,
      });
    }
    res.json(sub);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getMySubscription = async (req, res) => {
  try {
    let sub = await Subscription.findOne({ userId: req.user._id });
    if (!sub) sub = await Subscription.create({ userId: req.user._id, plan: 'free', features: PLANS.free.features });
    res.json(sub);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getPlans, subscribe, getMySubscription };
