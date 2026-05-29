const router = require('express').Router();
const {
  register, login, verifyOtp, resendOtp,
  getMe, changePassword, forgotPassword, resetPassword,
  refreshTokenHandler, logout,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin, validateChangePassword } = require('../middleware/validate.middleware');

router.post('/register',        validateRegister, register);
router.post('/login',           validateLogin, login);
router.post('/verify-otp',      verifyOtp);
router.post('/resend-otp',      resendOtp);
router.get('/me',               protect, getMe);
router.put('/change-password',  protect, validateChangePassword, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);
router.post('/refresh-token',   refreshTokenHandler);
router.post('/logout',          protect, logout);

module.exports = router;
