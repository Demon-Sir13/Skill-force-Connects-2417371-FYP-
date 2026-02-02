const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    active: { type: Boolean, default: true },
    features: [{ type: String }],
    priceNPR: { type: Number, default: 0 },
    paymentMethod: { type: String, default: '' },
    paymentId: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
