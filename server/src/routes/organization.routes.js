const router = require('express').Router();
const { getProfile, updateProfile, getAllOrganizations } = require('../controllers/organization.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', getAllOrganizations);
router.get('/:userId', getProfile);
router.put('/me', protect, authorize('organization'), updateProfile);

module.exports = router;
