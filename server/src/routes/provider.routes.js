const router = require('express').Router();
const { getProfile, updateProfile, getAllProviders, updateAvailability, updateSchedule } = require('../controllers/provider.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Static routes FIRST (before /:userId)
router.get('/', getAllProviders);
router.put('/me', protect, authorize('provider'), updateProfile);
router.put('/availability', protect, authorize('provider'), updateAvailability);
router.put('/schedule', protect, authorize('provider'), updateSchedule);

// Dynamic route LAST
router.get('/:userId', getProfile);

module.exports = router;
