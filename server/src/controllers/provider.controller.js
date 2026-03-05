const ProviderProfile = require('../models/ProviderProfile');

const getProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.params.userId })
      .populate('userId', 'name email profileImage verified trustScore');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllProviders = async (req, res) => {
  try {
    const { skill, availability, page = 1, limit = 12, minRate, maxRate, location, rating } = req.query;
    const filter = {};
    if (skill) filter.skills = { $in: [new RegExp(skill, 'i')] };
    if (availability) filter.availability = availability;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (rating) filter.rating = { $gte: Number(rating) };
    if (minRate || maxRate) {
      filter.hourlyRate = {};
      if (minRate) filter.hourlyRate.$gte = Number(minRate);
      if (maxRate) filter.hourlyRate.$lte = Number(maxRate);
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const total = await ProviderProfile.countDocuments(filter);

    const providers = await ProviderProfile.find(filter)
      .populate('userId', 'name email profileImage verified trustScore')
      .sort({ rating: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ providers, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile, getAllProviders };
