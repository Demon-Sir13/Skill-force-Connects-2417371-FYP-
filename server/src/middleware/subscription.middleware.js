/**
 * Subscription enforcement middleware.
 * Attach to routes that need plan-gating or usage-limit checks.
 *
 * Usage:
 *   router.post('/jobs', protect, requirePlan('pro'), createJob);
 *   router.post('/jobs', protect, checkJobPostLimit, createJob);
 *   router.post('/applications/:jobId', protect, checkApplicationLimit, applyToJob);
 */

const Subscription = require('../models/Subscription');

const PLANS = {
  free:       { priceNPR: 0,   jobsPerMonth: 2,  applicationsPerMonth: 5,  featuredJobs: 0,  featuredProfile: false },
  pro:        { priceNPR: 150, jobsPerMonth: 20, applicationsPerMonth: -1, featuredJobs: 3,  featuredProfile: true  },
  enterprise: { priceNPR: 999, jobsPerMonth: -1, applicationsPerMonth: -1, featuredJobs: -1, featuredProfile: true  },
};

// ── Helper: get or create subscription ───────────────────────────────────────
async function getOrCreateSub(userId) {
  let sub = await Subscription.findOne({ userId });
  if (!sub) {
    sub = await Subscription.create({
      userId,
      plan: 'free',
      features: ['Basic profile', '5 applications/month', 'Email support', '10 free messages'],
    });
  }
  // Auto-expire paid plans
  if (sub.plan !== 'free' && sub.endDate && new Date() > new Date(sub.endDate)) {
    sub.plan   = 'free';
    sub.active = false;
    await sub.save();
  }
  // Reset monthly usage if period rolled over
  const now = new Date();
  const periodStart = new Date(sub.usagePeriodStart || now);
  if ((now - periodStart) / (1000 * 60 * 60 * 24) >= 30) {
    sub.jobsPostedThisMonth   = 0;
    sub.applicationsThisMonth = 0;
    sub.usagePeriodStart      = now;
    await sub.save();
  }
  return sub;
}

// ── Attach subscription to req.subscription ───────────────────────────────────
const attachSubscription = async (req, _res, next) => {
  try {
    req.subscription = await getOrCreateSub(req.user._id);
    next();
  } catch (err) {
    next(err);
  }
};

// ── Require minimum plan ──────────────────────────────────────────────────────
const requirePlan = (...plans) => async (req, res, next) => {
  try {
    const sub = req.subscription || await getOrCreateSub(req.user._id);
    if (!plans.includes(sub.plan)) {
      return res.status(403).json({
        message: `This feature requires a ${plans.join(' or ')} plan. You are on the ${sub.plan} plan.`,
        code: 'PLAN_REQUIRED',
        requiredPlans: plans,
        currentPlan: sub.plan,
      });
    }
    next();
  } catch (err) { next(err); }
};

// ── Check job-post monthly limit (org) ───────────────────────────────────────
const checkJobPostLimit = async (req, res, next) => {
  try {
    if (req.user.role !== 'organization') return next();
    const sub = req.subscription || await getOrCreateSub(req.user._id);
    const limits = PLANS[sub.plan] || PLANS.free;
    if (limits.jobsPerMonth !== -1 && sub.jobsPostedThisMonth >= limits.jobsPerMonth) {
      return res.status(403).json({
        message: `You have reached your ${sub.plan} plan limit of ${limits.jobsPerMonth} job posts per month. Upgrade to post more.`,
        code: 'JOB_LIMIT_REACHED',
        limit: limits.jobsPerMonth,
        used: sub.jobsPostedThisMonth,
        currentPlan: sub.plan,
      });
    }
    next();
  } catch (err) { next(err); }
};

// ── Increment job post counter after successful post ─────────────────────────
const incrementJobPostCount = async (userId) => {
  try {
    await Subscription.findOneAndUpdate(
      { userId },
      { $inc: { jobsPostedThisMonth: 1 } }
    );
  } catch {}
};

// ── Check application monthly limit (provider) ───────────────────────────────
const checkApplicationLimit = async (req, res, next) => {
  try {
    if (req.user.role !== 'provider') return next();
    const sub = req.subscription || await getOrCreateSub(req.user._id);
    const limits = PLANS[sub.plan] || PLANS.free;
    if (limits.applicationsPerMonth !== -1 && sub.applicationsThisMonth >= limits.applicationsPerMonth) {
      return res.status(403).json({
        message: `You have reached your ${sub.plan} plan limit of ${limits.applicationsPerMonth} applications per month. Upgrade to apply to more jobs.`,
        code: 'APPLICATION_LIMIT_REACHED',
        limit: limits.applicationsPerMonth,
        used: sub.applicationsThisMonth,
        currentPlan: sub.plan,
      });
    }
    next();
  } catch (err) { next(err); }
};

// ── Increment application counter after successful application ────────────────
const incrementApplicationCount = async (userId) => {
  try {
    await Subscription.findOneAndUpdate(
      { userId },
      { $inc: { applicationsThisMonth: 1 } }
    );
  } catch {}
};

// ── Get plan limits for a user ────────────────────────────────────────────────
const getPlanLimits = (plan) => PLANS[plan] || PLANS.free;

module.exports = {
  attachSubscription,
  requirePlan,
  checkJobPostLimit,
  checkApplicationLimit,
  incrementJobPostCount,
  incrementApplicationCount,
  getPlanLimits,
  getOrCreateSub,
};
