const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  lastSentAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Auto-delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Hash OTP before storing
otpSchema.pre('save', async function (next) {
  if (!this.isModified('otp')) return next();
  this.otp = await bcrypt.hash(this.otp, 10);
  next();
});

otpSchema.methods.matchOtp = async function (entered) {
  return bcrypt.compare(entered, this.otp);
};

module.exports = mongoose.model('Otp', otpSchema);
