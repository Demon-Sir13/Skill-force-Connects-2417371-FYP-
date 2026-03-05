const OrganizationProfile = require('../models/OrganizationProfile');

const getProfile = async (req, res) => {
  try {
    const profile = await OrganizationProfile.findOne({ userId: req.params.userId })
      .populate('userId', 'name email profileImage verified');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const profile = await OrganizationProfile.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllOrganizations = async (req, res) => {
  try {
    const orgs = await OrganizationProfile.find().populate('userId', 'name email profileImage verified');
    res.json(orgs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile, getAllOrganizations };
