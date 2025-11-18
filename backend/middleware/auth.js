const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/jwt');

/**
 * Middleware xác thực JWT token
 */
const authenticateToken = (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      // Lưu thông tin user vào request
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

/**
 * Middleware kiểm tra role của user
 * @param {Array} allowedRoles - Danh sách roles được phép
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Middleware kiểm tra user có phải owner của resource không
 */
const isOwner = (req, res, next) => {
  const resourceUserId = req.params.userId || req.params.id;
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }

  // Admin có thể truy cập mọi resource
  if (req.user.role === 'admin') {
    return next();
  }

  // Kiểm tra xem user có phải owner không
  if (req.user.id !== resourceUserId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  authorize,
  isOwner
};
