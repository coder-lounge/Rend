const express = require('express');
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  getNonce,
  walletLogin,
  googleLogin,
  getGoogleAuthUrl,
  googleCallback
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);

// Wallet authentication routes
router.post('/wallet/nonce', getNonce);
router.post('/wallet', walletLogin);

// Google OAuth routes
router.get('/google/url', getGoogleAuthUrl);
router.post('/google/callback', googleCallback);
router.post('/google', googleLogin);

module.exports = router;