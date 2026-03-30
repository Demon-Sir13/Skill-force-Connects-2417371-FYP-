const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary');
const User = require('../models/User');
const OrganizationProfile = require('../models/OrganizationProfile');
const ProviderProfile = require('../models/ProviderProfile');

const fileUrl = (req, file) => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

router.post('/avatar', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const imageUrl = fileUrl(req, req.file);
    await User.findByIdAndUpdate(req.user._id, { profileImage: imageUrl });
    res.json({ imageUrl });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/logo', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const imageUrl = fileUrl(req, req.file);
    await OrganizationProfile.findOneAndUpdate({ userId: req.user._id }, { logo: imageUrl });
    res.json({ imageUrl });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/banner', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const imageUrl = fileUrl(req, req.file);
    const prov = await ProviderProfile.findOne({ userId: req.user._id });
    if (prov) { prov.bannerImage = imageUrl; await prov.save(); return res.json({ imageUrl }); }
    const org = await OrganizationProfile.findOne({ userId: req.user._id });
    if (org) { org.bannerImage = imageUrl; await org.save(); return res.json({ imageUrl }); }
    res.status(404).json({ message: 'Profile not found' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/portfolio', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const imageUrl = fileUrl(req, req.file);
    const { title, description } = req.body;
    const prov = await ProviderProfile.findOne({ userId: req.user._id });
    if (prov) { prov.portfolio.push({ title: title || 'Portfolio', description: description || '', imageUrl }); await prov.save(); return res.json({ imageUrl }); }
    const org = await OrganizationProfile.findOne({ userId: req.user._id });
    if (org) { org.portfolio.push({ title: title || 'Portfolio', description: description || '', imageUrl }); await org.save(); return res.json({ imageUrl }); }
    res.status(404).json({ message: 'Profile not found' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/gallery', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });
    const imageUrl = fileUrl(req, req.file);
    const { caption } = req.body;
    const prov = await ProviderProfile.findOne({ userId: req.user._id });
    if (prov) { prov.gallery.push({ url: imageUrl, caption: caption || '' }); await prov.save(); return res.json({ imageUrl }); }
    const org = await OrganizationProfile.findOne({ userId: req.user._id });
    if (org) { org.gallery.push({ url: imageUrl, caption: caption || '' }); await org.save(); return res.json({ imageUrl }); }
    res.status(404).json({ message: 'Profile not found' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
