const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['user', 'job'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    details: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
