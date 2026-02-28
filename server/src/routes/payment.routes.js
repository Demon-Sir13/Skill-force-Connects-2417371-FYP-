const router = require('express').Router();
const {
  getPlans, initiateSubscription, verifySubscription,
  initiateMessageUnlock, verifyMessageUnlock, getMessagingStatus,
  getPaymentHistory, getAllPayments,
} = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/plans', getPlans);
router.post('/subscribe', protect, initiateSubscription);
router.post('/verify-subscription', protect, verifySubscription);
router.post('/unlock-messaging', protect, initiateMessageUnlock);
router.post('/verify-messaging', protect, verifyMessageUnlock);
router.get('/messaging-status', protect, getMessagingStatus);
router.get('/history', protect, getPaymentHistory);
router.get('/all', protect, authorize('admin'), getAllPayments);

module.exports = router;
