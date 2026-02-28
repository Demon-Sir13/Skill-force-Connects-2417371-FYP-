const router = require('express').Router();
const { getPlans, subscribe, getMySubscription } = require('../controllers/subscription.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/plans', getPlans);
router.get('/my', protect, getMySubscription);
router.post('/subscribe', protect, subscribe);

module.exports = router;
