const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    plan:          { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    startDate:     { type: Date, default: Date.now },
    endDate:       { type: Date },
    active:        { type: Boolean, default: true },
    features:      [{ type: String }],
    priceNPR:      { type: Number, default: 0 },
    paymentMethod: { type: String, default: '' },
    paymentId:     { type: String, default: '' },

    // ── Usage tracking (reset monthly) ───────────────────────────────────────
    usagePeriodStart: { type: Date, default: Date.now },
    jobsPostedThisMonth:    { type: Number, default: 0 },
    applicationsThisMonth:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Plan limits ───────────────────────────────────────────────────────────────
subscriptionSchema.statics.LIMITS = {
  free:       { jobsPerMonth: 2,  applicationsPerMonth: 5,  featuredJobs: 0, featuredProfile: false },
  pro:        { jobsPerMonth: 20, applicationsPerMonth: -1, featuredJobs: 3, featuredProfile: true  },
  enterprise: { jobsPerMonth: -1, applicationsPerMonth: -1, featuredJobs: -1, featuredProfile: true  },
};

// ── Auto-expire check ─────────────────────────────────────────────────────────
subscriptionSchema.methods.isActive = function () {
  if (!this.active) return false;
  if (this.plan === 'free') return true;
  if (this.endDate && new Date() > new Date(this.endDate)) {
    this.active = false;
    this.plan = 'free';
    return false;
  }
  return true;
};

// ── Reset monthly usage if period has rolled over ─────────────────────────────
subscriptionSchema.methods.resetUsageIfNeeded = function () {
  const now = new Date();
  const periodStart = new Date(this.usagePeriodStart || now);
  const diffDays = (now - periodStart) / (1000 * 60 * 60 * 24);
  if (diffDays >= 30) {
    this.jobsPostedThisMonth   = 0;
    this.applicationsThisMonth = 0;
    this.usagePeriodStart      = now;
  }
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
