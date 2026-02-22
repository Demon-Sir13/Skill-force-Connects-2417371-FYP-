const router = require('express').Router();
const { matchProvidersForJob, matchJobsForProvider } = require('../controllers/matching.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/providers/:jobId', protect, matchProvidersForJob);
router.get('/jobs', protect, matchJobsForProvider);

// Aliases for recommendation engine
router.get('/recommend/jobs', protect, matchJobsForProvider);
router.get('/recommend/providers/:jobId', protect, matchProvidersForJob);

module.exports = router;
