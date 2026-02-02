const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: { type: String, default: '' },
}, { _id: true });

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

const organizationProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    bannerImage: { type: String, default: '' },
    description: { type: String, default: '' },
    industry: { type: String, default: '' },
    location: { type: String, default: '' },
    district: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    establishedYear: { type: Number },
    employeeCount: { type: String, default: '' },
    panNumber: { type: String, default: '' },
    logo: { type: String, default: '' },
    requiredSkills: [{ type: String }],
    gallery: [galleryItemSchema],
    certifications: [certificationSchema],
    portfolio: [portfolioItemSchema],
    servicesOffered: [{ type: String }],
    serviceAreas: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalJobsPosted: { type: Number, default: 0 },
    totalHires: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OrganizationProfile', organizationProfileSchema);
