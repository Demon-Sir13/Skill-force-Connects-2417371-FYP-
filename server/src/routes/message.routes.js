const router = require('express').Router();
const { sendMessage, getConversation, getInbox, markRead, getUnreadCount } = require('../controllers/message.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, sendMessage);
router.get('/inbox', protect, getInbox);
router.get('/unread-count', protect, getUnreadCount);
router.get('/:userId', protect, getConversation);
router.put('/:userId/read', protect, markRead);

module.exports = router;
