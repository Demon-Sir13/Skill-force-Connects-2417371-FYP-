const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema(
  {
    // REQUIRED: every contract must trace back to a real application.
    // This enforces the Job → Application → Contract relationship.
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    jobId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Job',  required: true },
    organizationId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    providerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:       { type: String, required: true },
    description: { type: String, default: '' },
    amount:      { type: Number, required: true },
    currency:    { type: String, default: 'NPR' },
    startDate:   { type: Date, default: Date.now },
    endDate:     { type: Date },
    duration:    { type: String, default: '' },
    terms:       { type: String, default: '' },
    contractNumber: { type: String, unique: true },

    // ── LIFECYCLE STATUS ─────────────────────────────────────────────────────
    // draft        → created, awaiting signatures
    // signed       → both parties signed, not yet activated
    // active       → both signed + job started
    // pending_review → provider submitted work, awaiting org approval
    // completed    → org accepted work & released payment
    // overdue      → endDate passed without completion/submission
    // cancelled    → terminated by either party or admin
    status: {
      type: String,
      enum: ['draft', 'signed', 'active', 'pending_review', 'completed', 'overdue', 'cancelled'],
      default: 'draft',
    },

    // ── SIGNATURES ───────────────────────────────────────────────────────────
    signedByOrg:      { type: Boolean, default: false },
    signedByProvider: { type: Boolean, default: false },
    // Typed/drawn signature strings captured from the UI
    orgSignatureInput:      { type: String, default: '' },
    providerSignatureInput: { type: String, default: '' },
    // Timestamps of when each party signed
    orgSignedAt:      { type: Date },
    providerSignedAt: { type: Date },
    // IP addresses at time of signing (for legal audit trail)
    orgSignedIp:      { type: String, default: '' },
    providerSignedIp: { type: String, default: '' },

    // ── WORK SUBMISSION ──────────────────────────────────────────────────────
    workSubmittedAt:  { type: Date },          // when provider clicked "Submit Work"
    workSubmissionNote: { type: String, default: '' },
    revisionRequests: { type: Number, default: 0 }, // how many times org requested revision
    lastRevisionNote: { type: String, default: '' },

    // ── COMPLETION ───────────────────────────────────────────────────────────
    completedAt:      { type: Date },
    paymentReleasedAt:{ type: Date },
  },
  { timestamps: true }
);

// ── PRE-SAVE HOOK ─────────────────────────────────────────────────────────────
contractSchema.pre('save', function (next) {
  // Auto-generate contract number
  if (!this.contractNumber) {
    this.contractNumber = `SF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  // draft → signed when both parties have signed
  if (this.signedByOrg && this.signedByProvider && this.status === 'draft') {
    this.status = 'signed';
  }
  next();
});

// ── INSTANCE METHOD: check if overdue ────────────────────────────────────────
contractSchema.methods.isOverdue = function () {
  if (!this.endDate) return false;
  const safe = ['completed', 'overdue', 'cancelled'];
  return !safe.includes(this.status) && new Date() > new Date(this.endDate);
};

module.exports = mongoose.model('Contract', contractSchema);
