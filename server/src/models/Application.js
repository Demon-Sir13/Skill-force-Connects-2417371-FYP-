const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'interview', 'approved', 'rejected', 'contracted'],
      default: 'pending',
    },
    coverLetter: { type: String, required: true },
    cvFile: { type: String, default: '' },
    portfolioFiles: [{ type: String }],
    portfolioLink: { type: String, default: '' },
    expectedSalary: { type: Number, default: 0 },
    availabilityDate: { type: Date },
    matchScore: { type: Number, default: 0, min: 0, max: 100 },
    resumeScore: { type: Number, default: 0, min: 0, max: 100 },
    successRate: { type: Number, default: 0, min: 0, max: 100 },
    successLabel: { type: String, enum: ['High', 'Medium', 'Low', ''], default: '' },
    profileCompleteness: { type: Number, default: 0, min: 0, max: 100 },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

applicationSchema.index({ jobId: 1, providerId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
