const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const { protect, restrictTo } = require('../middlewares/authMiddlewares');

// Register a new admin (only accessible to superadmins)
router.post('/register', authController.register);

// Login route (accessible to all)
router.post('/login', authController.login);

// Forgot password (accessible to all)
router.post('/forgot-password', authController.forgotPassword);

// Reset password (accessible via the token sent to email)
router.put('/reset-password/:token', authController.resetPassword);

module.exports = router;
