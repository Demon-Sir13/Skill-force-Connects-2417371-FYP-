const ProviderProfile = require('../models/ProviderProfile');

/**
 * Calculate match score between a provider and a job (0–100).
 */
async function calculateMatchScore(providerId, job) {
  const profile = await ProviderProfile.findOne({ userId: providerId })
    .populate('userId', 'trustScore verified');
  if (!profile) return 0;

  let score = 0;
  const jobSkills = (job.skillsRequired || []).map(s => s.toLowerCase());
  const provSkills = (profile.skills || []).map(s => s.toLowerCase());

  // Skill match (40 pts)
  if (jobSkills.length > 0) {
    const matched = jobSkills.filter(s => provSkills.some(ps => ps.includes(s) || s.includes(ps)));
    score += Math.min(40, (matched.length / jobSkills.length) * 40);
  } else {
    score += 20;
  }

  // Rating (15 pts)
  score += ((profile.rating || 0) / 5) * 15;
  // Experience / completed jobs (15 pts)
  score += Math.min(15, ((profile.totalJobsCompleted || 0) / 10) * 15);
  // Location match (10 pts)
  if (job.location && profile.location) {
    if (profile.location.toLowerCase().includes(job.location.toLowerCase()) ||
        job.location.toLowerCase().includes(profile.location.toLowerCase())) score += 10;
  }
  // Trust score (10 pts)
  score += ((profile.userId?.trustScore || 50) / 100) * 10;
  // Availability (5 pts)
  if (profile.availability === 'available') score += 5;
  // Verification (5 pts)
  if (profile.verificationStatus === 'approved' || profile.userId?.verified) score += 5;

  return Math.round(Math.min(100, score));
}

/**
 * Calculate profile completeness (0–100).
 */
function profileCompleteness(profile) {
  if (!profile) return 0;
  const checks = [
    (profile.skills?.length || 0) > 0,
    !!profile.experience?.trim(),
    !!profile.bio?.trim(),
    !!profile.location,
    !!profile.phone,
    (profile.hourlyRate || 0) > 0,
    (profile.portfolioLinks?.filter(Boolean).length || 0) > 0,
    (profile.certifications?.length || 0) > 0,
    !!profile.education,
    (profile.languages?.length || 0) > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/**
 * Calculate resume/application quality score (0–100).
 * Weights: skills 40%, experience 20%, profile completeness 20%, portfolio 20%
 */
async function calculateResumeScore(providerId, job) {
  const profile = await ProviderProfile.findOne({ userId: providerId });
  if (!profile) return 0;

  let score = 0;
  const jobSkills = (job.skillsRequired || []).map(s => s.toLowerCase());
  const provSkills = (profile.skills || []).map(s => s.toLowerCase());

  // Skills match (40%)
  if (jobSkills.length > 0) {
    const matched = jobSkills.filter(s => provSkills.some(ps => ps.includes(s) || s.includes(ps)));
    score += (matched.length / jobSkills.length) * 40;
  } else {
    score += provSkills.length > 0 ? 25 : 10;
  }

  // Experience (20%) — based on text length + completed jobs
  const expLength = (profile.experience || '').trim().length;
  const expScore = Math.min(10, expLength / 50) + Math.min(10, (profile.totalJobsCompleted || 0) / 5);
  score += expScore;

  // Profile completeness (20%)
  score += (profileCompleteness(profile) / 100) * 20;

  // Portfolio presence (20%)
  const hasPortfolio = (profile.portfolio?.length || 0) > 0;
  const hasGallery = (profile.gallery?.length || 0) > 0;
  const hasLinks = (profile.portfolioLinks?.filter(Boolean).length || 0) > 0;
  const hasCerts = (profile.certifications?.length || 0) > 0;
  const portfolioPts = (hasPortfolio ? 6 : 0) + (hasGallery ? 5 : 0) + (hasLinks ? 5 : 0) + (hasCerts ? 4 : 0);
  score += portfolioPts;

  return Math.round(Math.min(100, score));
}

/**
 * Predict hiring success (0–100) with label.
 * Based on: resumeScore, completed jobs, profile strength.
 */
async function predictSuccess(providerId, job, resumeScore) {
  const profile = await ProviderProfile.findOne({ userId: providerId })
    .populate('userId', 'trustScore');
  if (!profile) return { successRate: 0, label: 'Low' };

  // Weighted formula
  let rate = 0;
  rate += (resumeScore || 0) * 0.45;                                    // resume quality 45%
  rate += Math.min(25, ((profile.totalJobsCompleted || 0) / 10) * 25);  // track record 25%
  rate += ((profile.rating || 0) / 5) * 15;                             // rating 15%
  rate += ((profile.userId?.trustScore || 50) / 100) * 15;              // trust 15%

  const successRate = Math.round(Math.min(100, rate));
  const label = successRate >= 70 ? 'High' : successRate >= 40 ? 'Medium' : 'Low';

  return { successRate, label };
}

module.exports = { calculateMatchScore, profileCompleteness, calculateResumeScore, predictSuccess };
