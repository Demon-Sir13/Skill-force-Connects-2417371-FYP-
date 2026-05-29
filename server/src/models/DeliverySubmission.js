const mongoose = require('mongoose');

/**
 * DeliverySubmission — tracks work proof uploads per contract.
 * Providers upload files + notes. Org reviews and approves/rejects.
 */
const deliverySubmissionSchema = new mongoose.Schema(
  {
    contractId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Contract',  required: true },
    jobId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Job',       required: true },
    providerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },
    organizationId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },

    // ── Submission content ────────────────────────────────────────────────
    deliveryNote:  { type: String, default: '' },
    files: [{
      url:          { type: String, required: true },
      originalName: { type: String, default: '' },
      mimeType:     { type: String, default: '' },
      size:         { type: Number, default: 0 },       // bytes
      fileType:     { type: String, enum: ['image', 'pdf', 'video', 'document', 'other'], default: 'other' },
    }],

    // ── Lifecycle ─────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'rejected', 'revision_requested'],
      default: 'submitted',
    },
    submissionNumber: { type: Number, default: 1 },   // increments on each resubmission

    // ── Org review ────────────────────────────────────────────────────────
    reviewedAt:    { type: Date },
    reviewNote:    { type: String, default: '' },      // org's feedback
    revisionNote:  { type: String, default: '' },      // what needs to be fixed

    // ── Timestamps ────────────────────────────────────────────────────────
    submittedAt:   { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for fast contract lookups
deliverySubmissionSchema.index({ contractId: 1, submittedAt: -1 });
deliverySubmissionSchema.index({ providerId: 1, status: 1 });

module.exports = mongoose.model('DeliverySubmission', deliverySubmissionSchema);
