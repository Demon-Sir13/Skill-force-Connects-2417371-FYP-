const mongoose = require('mongoose');

const workUpdateSchema = new mongoose.Schema(
  {
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract', required: true },
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    files: [{ type: String }],
    type: { type: String, enum: ['update', 'milestone', 'completion', 'response'], default: 'update' },
  },
  { timestamps: true }
);

workUpdateSchema.index({ contractId: 1, createdAt: -1 });

module.exports = mongoose.model('WorkUpdate', workUpdateSchema);
