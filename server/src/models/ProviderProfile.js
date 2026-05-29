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

// Weekly time slot: e.g. { day: 'Monday', startTime: '09:00', endTime: '17:00' }
const timeSlotSchema = new mongoose.Schema({
  day: { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], required: true },
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '17:00' },
  available: { type: Boolean, default: true },
}, { _id: false });

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
    skillScore: { type: Number, default: 0, min: 0, max: 100 },
    skillVerified: { type: Boolean, default: false },
    skillVerifiedAt: { type: Date },
    totalReviews: { type: Number, default: 0 },
    totalJobsCompleted: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },

    // ── AVAILABILITY SYSTEM ──────────────────────────────────────────────────
    availability: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available',
    },
    availabilityNote: { type: String, default: '' }, // e.g. "Back on Monday"
    availableFrom: { type: Date, default: null },    // when they'll be free again
    currentJobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },

    // ── WORK MODE ────────────────────────────────────────────────────────────
    workMode: {
      type: String,
      enum: ['freelance', 'part-time', 'full-time', 'any'],
      default: 'any',
    },

    // ── WEEKLY SCHEDULE ──────────────────────────────────────────────────────
    weeklySchedule: [timeSlotSchema],

    // ── VERIFICATION ─────────────────────────────────────────────────────────
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending', 'approved', 'rejected'],
      default: 'unverified',
    },
    citizenshipDoc: { type: String, default: '' },
    certificateDoc: { type: String, default: '' },
    verificationRequestedAt: { type: Date },
    verificationNote: { type: String, default: '' },
    languages: [{ type: String }],
    education: { type: String, default: '' },

    // ── PREMIUM / FEATURED ────────────────────────────────────────────────────
    featured:      { type: Boolean, default: false },
    featuredUntil: { type: Date },
    premiumBadge:  { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProviderProfile', providerProfileSchema);
