const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

/**
 * Authentication API Routes
 * Base path: /api/auth
 */

// POST /api/auth/register - Đăng ký user mới
router.post('/register', 
  authController.validateRegister(), 
  authController.register
);

// POST /api/auth/login - Đăng nhập
router.post('/login', 
  authController.validateLogin(), 
  authController.login
);

// POST /api/auth/change-password - Đổi password (cần authentication)
router.post('/change-password', 
  authenticateToken,
  authController.validateChangePassword(), 
  authController.changePassword
);

// GET /api/auth/profile - Lấy profile user đang login
router.get('/profile', 
  authenticateToken, 
  authController.getProfile
);

// POST /api/auth/verify-token - Verify JWT token
router.post('/verify-token', authController.verifyToken);

module.exports = router;
