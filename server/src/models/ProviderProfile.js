const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String, default: '' },
  year: { type: Number },
  url: { type: String, default: '' },
}, { _id: true });

const portfolioItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  link: { type: String, default: '' },
  date: { type: Date, default: Date.now },
}, { _id: true });

const galleryItemSchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: { type: String, default: '' },
}, { _id: true });

const providerProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    bannerImage: { type: String, default: '' },
    skills: [{ type: String }],
    experience: { type: String, default: '' },
    bio: { type: String, default: '' },
    portfolioLinks: [{ type: String }],
    portfolio: [portfolioItemSchema],
    gallery: [galleryItemSchema],
    certifications: [certificationSchema],
    resumeUrl: { type: String, default: '' },
    location: { type: String, default: '' },
    phone: { type: String, default: '' },
    hourlyRate: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalJobsCompleted: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    availability: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available',
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    languages: [{ type: String }],
    education: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
