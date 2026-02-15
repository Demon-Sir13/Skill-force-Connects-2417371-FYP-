const router = require('express').Router();
const { register, login, verifyOtp, resendOtp, getMe, changePassword, refreshTokenHandler } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin, validateChangePassword } = require('../middleware/validate.middleware');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.get('/me', protect, getMe);
router.put('/change-password', protect, validateChangePassword, changePassword);
router.post('/refresh-token', refreshTokenHandler);

module.exports = router;
