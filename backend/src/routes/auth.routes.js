const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.jwt');

// Register a new user
router.post('/signup', authController.register);

// Login
router.post('/signin', authController.login);

// Update profile (requires authentication)
router.put('/profile', verifyToken, authController.updateProfile);

// Change password (requires authentication)
router.post('/change-password', verifyToken, authController.changePassword);

module.exports = router;
