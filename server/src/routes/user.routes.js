const router = require('express').Router();
const { updateUser, getUserById } = require('../controllers/user.controller');
const { protect, isSelf } = require('../middleware/auth.middleware');

// Any authenticated user can look up a profile by id,
// but only the owner (or admin) can update it.
router.get('/:id', protect, getUserById);
router.put('/me', protect, updateUser);

module.exports = router;
