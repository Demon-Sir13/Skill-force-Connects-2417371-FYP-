const router = require('express').Router();
const { getProfile, updateProfile, getAllProviders } = require('../controllers/provider.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', getAllProviders);
router.get('/:userId', getProfile);
router.put('/me', protect, authorize('provider'), updateProfile);

module.exports = router;
