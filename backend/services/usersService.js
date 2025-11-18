const usersRepository = require('../repositories/usersRepository');

/**
 * Service layer for users management
 */
class UsersService {
  /**
   * Lấy danh sách tất cả users
   * @param {Object} options - {page, limit, role}
   * @returns {Promise<Object>}
   */
  async getAllUsers({ page = 1, limit = 20, role = null }) {
    // Validate pagination
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 20;

    const offset = (page - 1) * limit;

    // Validate role if provided
    if (role && !['patient', 'doctor', 'admin'].includes(role)) {
      throw new Error('Invalid role. Must be: patient, doctor, or admin');
    }

    const [users, total] = await Promise.all([
      usersRepository.getAllUsers(limit, offset, role),
      usersRepository.countUsers(role)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    };
  }

  /**
   * Lấy user theo ID
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getUserById(userId) {
    const user = await usersRepository.getUserById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      success: true,
      data: user
    };
  }

  /**
   * Cập nhật user
   * @param {string} userId
   * @param {Object} updates - {email, role}
   * @returns {Promise<Object>}
   */
  async updateUser(userId, updates) {
    // Kiểm tra user tồn tại
    const existingUser = await usersRepository.getUserById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Validate role
    if (updates.role && !['patient', 'doctor', 'admin'].includes(updates.role)) {
      throw new Error('Invalid role. Must be: patient, doctor, or admin');
    }

    // Validate email format
    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        throw new Error('Invalid email format');
      }
    }

    const updatedUser = await usersRepository.updateUser(userId, updates);

    return {
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    };
  }

  /**
   * Xóa user
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async deleteUser(userId) {
    // Kiểm tra user tồn tại
    const user = await usersRepository.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const deleted = await usersRepository.deleteUser(userId);

    if (!deleted) {
      throw new Error('Failed to delete user');
    }

    return {
      success: true,
      message: 'User deleted successfully'
    };
  }

  /**
   * Activate/Deactivate user
   * @param {string} userId
   * @param {boolean} isActive
   * @returns {Promise<Object>}
   */
  async toggleActiveStatus(userId, isActive) {
    // Kiểm tra user tồn tại
    const user = await usersRepository.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await usersRepository.toggleActiveStatus(userId, isActive);

    return {
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedUser
    };
  }

  /**
   * Ban/Unban user
   * @param {string} userId
   * @param {boolean} isBanned
   * @returns {Promise<Object>}
   */
  async toggleBanStatus(userId, isBanned) {
    // Kiểm tra user tồn tại
    const user = await usersRepository.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await usersRepository.toggleBanStatus(userId, isBanned);

    return {
      success: true,
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
      data: updatedUser
    };
  }

  /**
   * Tìm kiếm users
   * @param {string} query
   * @param {number} limit
   * @returns {Promise<Object>}
   */
  async searchUsers(query, limit = 20) {
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }

    const users = await usersRepository.searchUsers(query.trim(), limit);

    return {
      success: true,
      data: {
        users,
        count: users.length
      }
    };
  }

  /**
   * Lấy thống kê users
   * @returns {Promise<Object>}
   */
  async getUserStats() {
    const stats = await usersRepository.getUserStats();

    return {
      success: true,
      data: stats
    };
  }
}

module.exports = new UsersService();
