const router = require('express').Router();
const {
  createJob, getJobs, getJobById,
  updateJob, deleteJob,
  assignProvider, updateStatus, rateProvider,
  providerUpdateStatus, getEarnings, getRatings,
} = require('../controllers/job.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateJob } = require('../middleware/validate.middleware');

// ── Static / named routes first (before /:id) ──────────────────────────────
router.get('/provider/earnings', protect, authorize('provider'), getEarnings);
router.get('/provider/ratings',  protect, authorize('provider'), getRatings);

// ── AI Job Description Generator ─────────────────────────────────────────────
router.get('/generate-description/:category', (req, res) => {
  const { generateJobDescription } = require('../utils/jobTemplates');
  const result = generateJobDescription(req.params.category);
  res.json(result);
});

// ── General ─────────────────────────────────────────────────────────────────
router.get('/',    getJobs);
router.get('/:id', getJobById);

// ── Organization actions ─────────────────────────────────────────────────────
router.post('/',              protect, authorize('organization'), validateJob, createJob);
router.put('/:id',            protect, authorize('organization'), updateJob);
router.delete('/:id',         protect, authorize('organization'), deleteJob);
router.put('/:id/assign',     protect, authorize('organization'), assignProvider);
router.put('/:id/status',     protect, authorize('organization'), updateStatus);
router.post('/:id/rate',      protect, authorize('organization'), rateProvider);

// ── Provider actions ─────────────────────────────────────────────────────────
router.put('/:id/provider-status', protect, authorize('provider'), providerUpdateStatus);

module.exports = router;
