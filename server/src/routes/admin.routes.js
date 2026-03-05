const router = require('express').Router();
const {
  getAllUsers, deleteUser, changeUserRole, suspendUser, unsuspendUser, toggleVerification,
  getAllJobs, deleteJob, updateJobApproval,
  getReports, createReport, updateReport,
  getStats, getAnalytics, getRevenue, getActivityLogs, updateProviderVerification,
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

// Stats & Analytics — admin only
router.get('/stats', authorize('admin'), getStats);
router.get('/analytics', authorize('admin'), getAnalytics);
router.get('/revenue', authorize('admin'), getRevenue);

// Users — admin only
router.get('/users',              authorize('admin'), getAllUsers);
router.delete('/users/:id',       authorize('admin'), deleteUser);
router.put('/users/:id/role',     authorize('admin'), changeUserRole);
router.put('/users/:id/suspend',  authorize('admin'), suspendUser);
router.put('/users/:id/unsuspend',authorize('admin'), unsuspendUser);
router.put('/users/:id/verify',  authorize('admin'), toggleVerification);

// Jobs — admin only
router.get('/jobs',        authorize('admin'), getAllJobs);
router.delete('/jobs/:id', authorize('admin'), deleteJob);
router.put('/jobs/:id/approval', authorize('admin'), updateJobApproval);

// Provider verification
router.put('/providers/:id/verification', authorize('admin'), updateProviderVerification);

// Reports — any authenticated user can file, admin can manage
router.post('/reports',         protect, createReport);
router.get('/reports',          authorize('admin'), getReports);
router.put('/reports/:id',      authorize('admin'), updateReport);

// Activity logs — admin only
router.get('/activity-logs',    authorize('admin'), getActivityLogs);

module.exports = router;
