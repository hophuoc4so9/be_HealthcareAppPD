const { body, query, param, validationResult } = require('express-validator');
const usersService = require('../services/usersService');

/**
 * Controller for users management
 */
class UsersController {
  /**
   * Validation rules cho update user
   */
  validateUpdateUser() {
    return [
      body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
      body('role')
        .optional()
        .isIn(['patient', 'doctor', 'admin'])
        .withMessage('Role must be: patient, doctor, or admin')
    ];
  }

  /**
   * GET /api/users
   * Lấy danh sách tất cả users (Admin only)
   */
  async getAllUsers(req, res, next) {
    try {
      const { page, limit, role } = req.query;

      const result = await usersService.getAllUsers({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        role
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/stats
   * Lấy thống kê users (Admin only)
   */
  async getUserStats(req, res, next) {
    try {
      const result = await usersService.getUserStats();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/search
   * Tìm kiếm users (Admin only)
   */
  async searchUsers(req, res, next) {
    try {
      const { q, limit } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query parameter "q" is required'
        });
      }

      const result = await usersService.searchUsers(q, parseInt(limit) || 20);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:id
   * Lấy user theo ID
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await usersService.getUserById(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/users/:id
   * Cập nhật user (Admin only)
   */
  async updateUser(req, res, next) {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { email, role } = req.body;

      // Không cho phép admin tự đổi role của chính mình
      if (role && id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot change your own role'
        });
      }

      const result = await usersService.updateUser(id, { email, role });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id
   * Xóa user (Admin only)
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      // Không cho phép xóa chính mình
      if (id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account'
        });
      }

      const result = await usersService.deleteUser(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:id/activate
   * Activate user (Admin only)
   */
  async activateUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await usersService.toggleActiveStatus(id, true);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:id/deactivate
   * Deactivate user (Admin only)
   */
  async deactivateUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await usersService.toggleActiveStatus(id, false);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:id/ban
   * Ban user (Admin only)
   */
  async banUser(req, res, next) {
    try {
      const { id } = req.params;

      // Không cho phép ban chính mình
      if (id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot ban your own account'
        });
      }

      const result = await usersService.toggleBanStatus(id, true);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:id/unban
   * Unban user (Admin only)
   */
  async unbanUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await usersService.toggleBanStatus(id, false);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsersController();
