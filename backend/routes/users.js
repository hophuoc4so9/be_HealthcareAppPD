const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken, authorize } = require('../middleware/auth');

/**
 * Users Management API Routes
 * Base path: /api/users
 * All routes require admin authentication
 */

// Middleware: Tất cả routes yêu cầu authentication và admin role
router.use(authenticateToken);
router.use(authorize('admin'));

// GET /api/users - Lấy danh sách users
router.get('/', usersController.getAllUsers);

// GET /api/users/stats - Lấy thống kê users
router.get('/stats', usersController.getUserStats);

// GET /api/users/search - Tìm kiếm users
router.get('/search', usersController.searchUsers);

// GET /api/users/:id - Lấy user theo ID
router.get('/:id', usersController.getUserById);

// PUT /api/users/:id - Cập nhật user
router.put('/:id', 
  usersController.validateUpdateUser(), 
  usersController.updateUser
);

// DELETE /api/users/:id - Xóa user
router.delete('/:id', usersController.deleteUser);

// PATCH /api/users/:id/activate - Activate user
router.patch('/:id/activate', usersController.activateUser);

// PATCH /api/users/:id/deactivate - Deactivate user
router.patch('/:id/deactivate', usersController.deactivateUser);

// PATCH /api/users/:id/ban - Ban user
router.patch('/:id/ban', usersController.banUser);

// PATCH /api/users/:id/unban - Unban user
router.patch('/:id/unban', usersController.unbanUser);

module.exports = router;
