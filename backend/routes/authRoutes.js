const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', authController.validateRegister(), authController.register);
router.post('/register-doctor', authController.validateRegister(), authController.registerDoctor);
router.post('/login', authController.validateLogin(), authController.login);
router.post('/verify-token', authController.verifyToken);

// Protected routes
router.get('/profile', authenticate, authController.getProfile);
router.post('/change-password', authenticate, authController.validateChangePassword(), authController.changePassword);

module.exports = router;
