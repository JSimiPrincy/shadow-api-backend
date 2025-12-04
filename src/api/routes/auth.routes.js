const express = require('express');
// ... existing imports
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../../middleware/authMiddleware');

// Public
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);

module.exports = router;