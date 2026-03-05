const router = require('express').Router();
const {
  getPlans, initiateSubscription, verifySubscription,
  initiateMessageUnlock, verifyMessageUnlock, getMessagingStatus,
} = require('../controllers/esewa.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/plans', getPlans);
router.post('/subscribe', protect, initiateSubscription);
router.post('/verify-subscription', protect, verifySubscription);
router.post('/unlock-messaging', protect, initiateMessageUnlock);
router.post('/verify-messaging', protect, verifyMessageUnlock);
router.get('/messaging-status', protect, getMessagingStatus);

module.exports = router;
