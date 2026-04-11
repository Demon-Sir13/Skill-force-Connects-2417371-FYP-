const ProviderProfile = require('../models/ProviderProfile');
const Notification = require('../models/Notification');

const getProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.params.userId })
      .populate('userId', 'name email profileImage verified trustScore')
      .populate('currentJobId', 'title status');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateProfile = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @PUT /api/providers/availability — provider updates their status
const updateAvailability = async (req, res) => {
  try {
    const { availability, availabilityNote, availableFrom, workMode } = req.body;
    const allowed = ['available', 'busy', 'unavailable'];
    if (availability && !allowed.includes(availability))
      return res.status(400).json({ message: 'Invalid availability status' });

    const update = {};
    if (availability) update.availability = availability;
    if (availabilityNote !== undefined) update.availabilityNote = availabilityNote;
    if (availableFrom !== undefined) update.availableFrom = availableFrom || null;
    if (workMode) update.workMode = workMode;

    // If switching to available, clear currentJobId
    if (availability === 'available') update.currentJobId = null;

    const profile = await ProviderProfile.findOneAndUpdate(
      { userId: req.user._id },
      update,
      { new: true }
    ).populate('userId', 'name email profileImage verified trustScore');

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    // If becoming available again, notify orgs who have pending applications from this provider
    if (availability === 'available') {
      const Application = require('../models/Application');
      const pendingApps = await Application.find({
        providerId: req.user._id,
        status: { $in: ['pending', 'shortlisted'] },
      }).distinct('organizationId');

      for (const orgId of pendingApps.slice(0, 5)) {
        await Notification.create({
          userId: orgId, type: 'system',
          title: 'Provider Now Available',
          message: `${profile.userId?.name || 'A provider'} is now available for work.`,
          referenceUrl: `/providers/${req.user._id}`,
        });
      }
    }

    res.json(profile);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @PUT /api/providers/schedule — update weekly schedule
const updateSchedule = async (req, res) => {
  try {
    const { weeklySchedule } = req.body;
    if (!Array.isArray(weeklySchedule))
      return res.status(400).json({ message: 'weeklySchedule must be an array' });

    const profile = await ProviderProfile.findOneAndUpdate(
      { userId: req.user._id },
      { weeklySchedule },
      { new: true }
    );
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json({ message: 'Schedule updated', weeklySchedule: profile.weeklySchedule });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @GET /api/providers — list with filters including availability + workMode
const getAllProviders = async (req, res) => {
  try {
    const { skill, availability, workMode, page = 1, limit = 12, minRate, maxRate, location, rating } = req.query;
    const filter = {};
    if (skill) filter.skills = { $in: [new RegExp(skill, 'i')] };
    if (availability) filter.availability = availability;
    if (workMode) filter.workMode = { $in: [workMode, 'any'] };
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

    // Sort: available first, then by rating
    const providers = await ProviderProfile.find(filter)
      .populate('userId', 'name email profileImage verified trustScore')
      .populate('currentJobId', 'title')
      .sort({ availability: 1, rating: -1 }) // 'available' sorts before 'busy'/'unavailable'
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ providers, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getProfile, updateProfile, getAllProviders, updateAvailability, updateSchedule };
