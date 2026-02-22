const router = require('express').Router();
const { applyToJob, getMyApplications, getOrgApplications, getJobApplications, updateApplicationStatus } = require('../controllers/application.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/my', protect, authorize('provider'), getMyApplications);
router.get('/org', protect, authorize('organization', 'admin'), getOrgApplications);
router.post('/:jobId', protect, authorize('provider'), applyToJob);
router.get('/job/:jobId', protect, authorize('organization', 'admin'), getJobApplications);
router.put('/:id/status', protect, authorize('organization', 'admin'), updateApplicationStatus);

module.exports = router;
