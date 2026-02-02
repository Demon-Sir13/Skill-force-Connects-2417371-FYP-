const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    budget: { type: Number, required: true },
    currency: { type: String, default: 'NPR' },
    deadline: { type: Date, required: true },
    location: { type: String, default: '' },
    district: { type: String, default: '' },
    skillsRequired: [{ type: String }],
    status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' },
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    assignedProviderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    applicantCount: { type: Number, default: 0 },
    rated: { type: Boolean, default: false },
    paid: { type: Boolean, default: false },
    contractGenerated: { type: Boolean, default: false },
    urgency: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    jobType: { type: String, enum: ['one-time', 'recurring', 'contract', 'part-time', 'full-time'], default: 'one-time' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
