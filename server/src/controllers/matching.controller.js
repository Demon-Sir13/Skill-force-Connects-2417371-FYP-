const Job = require('../models/Job');
const ProviderProfile = require('../models/ProviderProfile');
const { calculateMatchScore } = require('../utils/matchScore');

// Smart matching: find best providers for a job
const matchProvidersForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const providers = await ProviderProfile.find({ availability: { $ne: 'unavailable' } })
      .populate('userId', 'name email profileImage verified trustScore');

    const scored = await Promise.all(providers.map(async (p) => {
      const jobSkills = (job.skillsRequired || []).map(s => s.toLowerCase());
      const provSkills = (p.skills || []).map(s => s.toLowerCase());
      const matched = jobSkills.filter(s => provSkills.some(ps => ps.includes(s) || s.includes(ps)));
      const score = await calculateMatchScore(p.userId?._id, job);
      return { provider: p, matchScore: score, matchedSkills: matched };
    }));

    scored.sort((a, b) => b.matchScore - a.matchScore);
    res.json(scored.filter(s => s.matchScore > 10).slice(0, 20));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Smart matching: find best jobs for a provider
const matchJobsForProvider = async (req, res) => {
  try {
    const profile = await ProviderProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const jobs = await Job.find({ status: 'open', approvalStatus: 'approved' })
      .populate('organizationId', 'name profileImage verified trustScore');

    const provSkills = (profile.skills || []).map(s => s.toLowerCase());
    const scored = jobs.map(j => {
      let score = 0;
      const jobSkills = (j.skillsRequired || []).map(s => s.toLowerCase());
      const matched = jobSkills.filter(s => provSkills.some(ps => ps.includes(s) || s.includes(ps)));

      // Skill match (40 pts)
      score += jobSkills.length > 0 ? Math.min(40, (matched.length / jobSkills.length) * 40) : 20;
      // Location (20 pts)
      if (j.location && profile.location && j.location.toLowerCase().includes(profile.location.toLowerCase())) score += 20;
      // Budget fit (15 pts)
      if (j.budget && profile.hourlyRate && j.budget >= profile.hourlyRate * 8) score += 15;
      // Org trust (10 pts)
      score += ((j.organizationId?.trustScore || 50) / 100) * 10;
      // Recency (15 pts)
      const daysOld = (Date.now() - new Date(j.createdAt)) / 86400000;
      score += Math.max(0, 15 - daysOld);

      return { job: j, matchScore: Math.round(score), matchedSkills: matched };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    res.json(scored.filter(s => s.matchScore > 10).slice(0, 20));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { matchProvidersForJob, matchJobsForProvider };
