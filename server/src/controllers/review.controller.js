const Review = require('../models/Review');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

const createReview = async (req, res) => {
  try {
    const { jobId, revieweeId, rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be 1-5' });

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.status !== 'completed')
      return res.status(400).json({ message: 'Can only review completed jobs' });

    const review = await Review.create({
      jobId,
      reviewerId: req.user._id,
      revieweeId,
      rating,
      comment,
    });

    await Notification.create({
      userId: revieweeId,
      type: 'review',
      title: 'New Review',
      message: `You received a ${rating}-star review for "${job.title}"`,
      relatedId: job._id,
      referenceUrl: `/jobs/${job._id}`,
    });

    // Update provider profile rating
    const ProviderProfile = require('../models/ProviderProfile');
    const profile = await ProviderProfile.findOne({ userId: revieweeId });
    if (profile) {
      const allReviews = await Review.find({ revieweeId });
      const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
      profile.rating = Math.round(avg * 10) / 10;
      profile.totalReviews = allReviews.length;
      await profile.save();
    }

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Already reviewed this job' });
    res.status(500).json({ message: err.message });
  }
};

const getReviewsForUser = async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.userId })
      .populate('reviewerId', 'name profileImage')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });
    const avg = reviews.length
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;
    res.json({ reviews, averageRating: avg, totalReviews: reviews.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createReview, getReviewsForUser };
