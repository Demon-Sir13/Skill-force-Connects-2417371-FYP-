const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');
const User = require('../models/User');
const OrganizationProfile = require('../models/OrganizationProfile');
const ProviderProfile = require('../models/ProviderProfile');

// POST /api/upload/avatar — upload profile image
router.post('/avatar', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const imageUrl = req.file.path;
    await User.findByIdAndUpdate(req.user._id, { profileImage: imageUrl });
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/upload/logo — upload organization logo
router.post('/logo', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const imageUrl = req.file.path;
    await OrganizationProfile.findOneAndUpdate(
      { userId: req.user._id },
      { logo: imageUrl }
    );
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/upload/portfolio — upload portfolio image
router.post('/portfolio', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const imageUrl = req.file.path;
    const { title, description } = req.body;

    // Try provider profile first, then org profile
    const provider = await ProviderProfile.findOne({ userId: req.user._id });
    if (provider) {
      provider.portfolio.push({ title: title || 'Portfolio Item', description: description || '', imageUrl });
      await provider.save();
      return res.json({ imageUrl, portfolio: provider.portfolio });
    }

    const org = await OrganizationProfile.findOne({ userId: req.user._id });
    if (org) {
      org.portfolio.push({ title: title || 'Portfolio Item', description: description || '', imageUrl });
      await org.save();
      return res.json({ imageUrl, portfolio: org.portfolio });
    }

    res.status(404).json({ message: 'Profile not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/upload/gallery — upload gallery image
router.post('/gallery', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const imageUrl = req.file.path;
    const { caption } = req.body;

    const provider = await ProviderProfile.findOne({ userId: req.user._id });
    if (provider) {
      provider.gallery.push({ url: imageUrl, caption: caption || '' });
      await provider.save();
      return res.json({ imageUrl, gallery: provider.gallery });
    }

    const org = await OrganizationProfile.findOne({ userId: req.user._id });
    if (org) {
      org.gallery.push({ url: imageUrl, caption: caption || '' });
      await org.save();
      return res.json({ imageUrl, gallery: org.gallery });
    }

    res.status(404).json({ message: 'Profile not found' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/upload/banner — upload banner image
router.post('/banner', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const imageUrl = req.file.path;
    const provider = await ProviderProfile.findOne({ userId: req.user._id });
    if (provider) { provider.bannerImage = imageUrl; await provider.save(); return res.json({ imageUrl }); }
    const org = await OrganizationProfile.findOne({ userId: req.user._id });
    if (org) { org.bannerImage = imageUrl; await org.save(); return res.json({ imageUrl }); }
    res.status(404).json({ message: 'Profile not found' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
