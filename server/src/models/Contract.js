const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application' },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'NPR' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    duration: { type: String, default: '' },
    terms: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'signed', 'active', 'completed', 'cancelled'], default: 'draft' },
    signedByOrg: { type: Boolean, default: false },
    signedByProvider: { type: Boolean, default: false },
    contractNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

contractSchema.pre('save', function (next) {
  if (!this.contractNumber) {
    this.contractNumber = `SF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  if (this.signedByOrg && this.signedByProvider && this.status === 'draft') {
    this.status = 'signed';
  }
  next();
});

module.exports = mongoose.model('Contract', contractSchema);
