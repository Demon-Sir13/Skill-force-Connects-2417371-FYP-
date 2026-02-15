const Job = require('../models/Job');
const ProviderProfile = require('../models/ProviderProfile');

const createJob = async (req, res) => {
  try {
    const { title, description, category, budget, deadline, district, location, urgency, jobType, skillsRequired } = req.body;

    // Duplicate prevention: same org, same title, same category within last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const duplicate = await Job.findOne({
      organizationId: req.user._id,
      title: { $regex: `^${title.trim()}$`, $options: 'i' },
      category,
      createdAt: { $gte: since },
    });
    if (duplicate) {
      return res.status(409).json({
        message: 'A job with this title and category was already posted in the last 24 hours.',
      });
    }

    const job = await Job.create({
      title: title.trim(),
      description: description.trim(),
      category,
      budget: Number(budget),
      deadline,
      district: district || '',
      location: location || district || '',
      urgency: urgency || 'medium',
      jobType: jobType || 'one-time',
      skillsRequired: skillsRequired || [],
      organizationId: req.user._id,
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const { category, status, search, orgId, providerId, page = 1, limit = 12, minBudget, maxBudget, location, district, skills } = req.query;
    const filter = {};
    if (category)   filter.category         = category;
    if (status)     filter.status           = status;
    if (search)     filter.title            = { $regex: search, $options: 'i' };
    if (orgId)      filter.organizationId   = orgId;
    if (providerId) filter.assignedProviderId = providerId;
    if (location)   filter.location         = { $regex: location, $options: 'i' };
    if (district)   filter.district         = { $regex: district, $options: 'i' };
    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = Number(minBudget);
      if (maxBudget) filter.budget.$lte = Number(maxBudget);
    }
    if (skills) filter.skillsRequired = { $in: skills.split(',').map(s => new RegExp(s.trim(), 'i')) };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const total = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .populate('organizationId', 'name profileImage')
      .populate('assignedProviderId', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.json({ jobs, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('organizationId', 'name profileImage')
      .populate('assignedProviderId', 'name profileImage');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.organizationId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.organizationId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    await job.deleteOne();
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/jobs/:id/assign  — org assigns a provider
const assignProvider = async (req, res) => {
  try {
    const { providerId } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.organizationId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (job.status !== 'open')
      return res.status(400).json({ message: 'Can only assign to open jobs' });

    job.assignedProviderId = providerId;
    job.status = 'in-progress';
    await job.save();

    const updated = await Job.findById(job._id)
      .populate('organizationId', 'name profileImage')
      .populate('assignedProviderId', 'name profileImage');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/jobs/:id/status  — org changes job status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['open', 'in-progress', 'completed'];
    if (!allowed.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.organizationId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    // When marking completed, increment provider's job count
    if (status === 'completed' && job.status !== 'completed' && job.assignedProviderId) {
      await ProviderProfile.findOneAndUpdate(
        { userId: job.assignedProviderId },
        { $inc: { totalJobsCompleted: 1 } }
      );
    }

    job.status = status;
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/jobs/:id/rate  — org rates provider after completion
const rateProvider = async (req, res) => {
  try {
    const { rating } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.organizationId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    if (job.status !== 'completed')
      return res.status(400).json({ message: 'Can only rate completed jobs' });
    if (!job.assignedProviderId)
      return res.status(400).json({ message: 'No provider assigned to this job' });
    if (job.rated)
      return res.status(400).json({ message: 'This job has already been rated' });

    // Compute new rolling average
    const profile = await ProviderProfile.findOne({ userId: job.assignedProviderId });
    if (!profile) return res.status(404).json({ message: 'Provider profile not found' });

    const total = profile.totalJobsCompleted || 1;
    const currentRating = profile.rating || 0;
    const newRating = ((currentRating * (total - 1)) + Number(rating)) / total;

    profile.rating = Math.round(newRating * 10) / 10;
    await profile.save();

    job.rated = true;
    await job.save();

    res.json({ message: 'Provider rated successfully', newRating: profile.rating });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/jobs/:id/provider-status  — provider updates their assigned job status
const providerUpdateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    // Provider can only move to in-progress (acknowledge) — completion is org's call
    const allowed = ['in-progress'];
    if (!allowed.includes(status))
      return res.status(400).json({ message: 'Providers can only set status to in-progress' });

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const assignedId = job.assignedProviderId?.toString();
    if (assignedId !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized — you are not assigned to this job' });

    job.status = status;
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/jobs/provider/earnings  — provider earnings summary
const getEarnings = async (req, res) => {
  try {
    const jobs = await Job.find({
      assignedProviderId: req.user._id,
      status: 'completed',
    }).populate('organizationId', 'name');

    const totalEarned   = jobs.reduce((sum, j) => sum + (j.budget || 0), 0);
    const totalJobs     = jobs.length;
    const avgPerJob     = totalJobs ? Math.round(totalEarned / totalJobs) : 0;

    // Monthly breakdown (last 6 months)
    const monthly = {};
    jobs.forEach(j => {
      const key = new Date(j.updatedAt).toLocaleString('default', { month: 'short', year: '2-digit' });
      monthly[key] = (monthly[key] || 0) + (j.budget || 0);
    });

    res.json({ totalEarned, totalJobs, avgPerJob, monthly, jobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/jobs/provider/ratings  — provider's received ratings
const getRatings = async (req, res) => {
  try {
    const jobs = await Job.find({
      assignedProviderId: req.user._id,
      rated: true,
    }).populate('organizationId', 'name profileImage');

    const profile = await ProviderProfile.findOne({ userId: req.user._id });

    res.json({
      averageRating: profile?.rating || 0,
      totalRated: jobs.length,
      jobs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createJob, getJobs, getJobById, updateJob, deleteJob,
  assignProvider, updateStatus, rateProvider,
  providerUpdateStatus, getEarnings, getRatings,
};
