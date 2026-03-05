const router = require('express').Router();
const { createUpdate, getUpdates } = require('../controllers/workupdate.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createUpdate);
router.get('/:contractId', protect, getUpdates);

module.exports = router;
