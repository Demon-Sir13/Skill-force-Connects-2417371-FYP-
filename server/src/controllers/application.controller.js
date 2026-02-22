const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const Contract = require('../models/Contract');
const { calculateMatchScore, profileCompleteness, calculateResumeScore, predictSuccess } = require('../utils/matchScore');
const ProviderProfile = require('../models/ProviderProfile');

// Helper: emit socket event if available
const emitTo = (userId, event, data) => {
  try { const { getIO } = require('../socket/socket'); getIO().to(userId.toString()).emit(event, data); } catch {}
};

// @POST /api/applications/:jobId — provider applies with full form
const applyToJob = async (req, res) => {
  try {
    const { coverLetter, cvFile, portfolioFiles, portfolioLink, expectedSalary, availabilityDate } = req.body;
    if (!coverLetter?.trim()) return res.status(400).json({ message: 'Cover letter is required' });

    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'open') return res.status(400).json({ message: 'Job is not open for applications' });

    const existing = await Application.findOne({ jobId: job._id, providerId: req.user._id });
    if (existing) return res.status(409).json({ message: 'Already applied to this job' });

    const application = await Application.create({
      jobId: job._id,
      providerId: req.user._id,
      organizationId: job.organizationId,
      coverLetter: coverLetter.trim(),
      cvFile: cvFile || '',
      portfolioFiles: portfolioFiles || [],
      portfolioLink: portfolioLink || '',
      expectedSalary: expectedSalary || 0,
      availabilityDate: availabilityDate || null,
    });

    // Calculate all AI scores asynchronously (don't block response)
    (async () => {
      try {
        const profile = await ProviderProfile.findOne({ userId: req.user._id });
        const [matchSc, resumeSc, completeness] = await Promise.all([
          calculateMatchScore(req.user._id, job),
          calculateResumeScore(req.user._id, job),
          Promise.resolve(profileCompleteness(profile)),
        ]);
        const prediction = await predictSuccess(req.user._id, job, resumeSc);
        application.matchScore = matchSc;
        application.resumeScore = resumeSc;
        application.profileCompleteness = completeness;
        application.successRate = prediction.successRate;
        application.successLabel = prediction.label;
        await application.save();
      } catch (e) { console.warn('[Scoring] Failed:', e.message); }
    })();

    job.applicantCount = (job.applicantCount || 0) + 1;
    await job.save();

    // Notify org + socket
    await Notification.create({
      userId: job.organizationId, type: 'application', title: 'New Application',
      message: `${req.user.name} applied to "${job.title}"`, relatedId: job._id,
      referenceUrl: `/jobs/${job._id}`,
    });
    emitTo(job.organizationId, 'notification', { type: 'application', message: `${req.user.name} applied to "${job.title}"` });

    res.status(201).json(application);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Already applied' });
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/applications/org — org sees ALL applications across their jobs
const getOrgApplications = async (req, res) => {
  try {
    const apps = await Application.find({ organizationId: req.user._id })
      .populate('providerId', 'name email profileImage verified trustScore')
      .populate('jobId', 'title category budget status')
      .sort({ resumeScore: -1, matchScore: -1, createdAt: -1 });
    res.json(apps);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @GET /api/applications/my — provider's applications
const getMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ providerId: req.user._id })
      .populate({ path: 'jobId', populate: { path: 'organizationId', select: 'name profileImage' } })
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @GET /api/applications/job/:jobId — org views applicants
const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.organizationId.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    const apps = await Application.find({ jobId: req.params.jobId })
      .populate('providerId', 'name email profileImage verified trustScore')
      .sort({ resumeScore: -1, matchScore: -1, createdAt: -1 });
    res.json(apps);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// @PUT /api/applications/:id/status — org updates application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'shortlisted', 'interview', 'approved', 'rejected', 'contracted'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const app = await Application.findById(req.params.id).populate('jobId');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (app.jobId.organizationId.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    app.status = status;
    await app.save();

    // If approved, assign provider to job and update job status
    if (status === 'approved') {
      await Job.findByIdAndUpdate(app.jobId._id, {
        assignedProviderId: app.providerId,
        status: 'in-progress',
      });
    }

    // Notify provider + socket
    const statusLabel = status === 'approved' ? 'approved! You can now message the organization.' : status;
    await Notification.create({
      userId: app.providerId, type: 'application', title: 'Application Update',
      message: `Your application for "${app.jobId.title}" was ${statusLabel}`, relatedId: app.jobId._id,
      referenceUrl: `/jobs/${app.jobId._id}`,
    });
    emitTo(app.providerId, 'notification', { type: 'application', message: `Application ${statusLabel}` });

    res.json(app);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { applyToJob, getMyApplications, getOrgApplications, getJobApplications, updateApplicationStatus };
