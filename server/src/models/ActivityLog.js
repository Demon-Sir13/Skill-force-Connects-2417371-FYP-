const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action:   { type: String, required: true },   // e.g. 'job_posted', 'job_assigned'
    entity:   { type: String },                   // e.g. 'Job', 'User'
    entityId: { type: mongoose.Schema.Types.ObjectId },
    meta:     { type: mongoose.Schema.Types.Mixed, default: {} },
    ip:       { type: String },
  },
  { timestamps: true }
);

// Auto-expire logs after 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
