const pool = require('../db');
const { convertKeysToCamel, normalizeToSnake } = require('../utils/fieldConverter');

/**
 * Repository for users management operations
 */
class UsersRepository {
  /**
   * Lấy tất cả users với pagination
   * @param {number} limit
   * @param {number} offset
   * @param {string} role - Filter by role (optional)
   * @returns {Promise<Array>}
   */
  async getAllUsers(limit = 20, offset = 0, role = null) {
    let query = `
      SELECT id, email, role, is_active, is_banned, created_at, updated_at
      FROM users
    `;
    
    const params = [];
    
    if (role) {
      query += ` WHERE role = $1`;
      params.push(role);
      query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Đếm tổng số users
   * @param {string} role - Filter by role (optional)
   * @returns {Promise<number>}
   */
  async countUsers(role = null) {
    let query = 'SELECT COUNT(*) FROM users';
    const params = [];
    
    if (role) {
      query += ' WHERE role = $1';
      params.push(role);
    }
    
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  /**
   * Lấy user theo ID
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  async getUserById(userId) {
    const query = `
      SELECT id, email, role, is_active, is_banned, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0] ? convertKeysToCamel(result.rows[0]) : null;
  }

  /**
   * Cập nhật user
   * @param {string} userId
   * @param {Object} updates - {email, role}
   * @returns {Promise<Object>}
   */
  async updateUser(userId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.email) {
      fields.push(`email = $${paramCount++}`);
      values.push(updates.email);
    }

    if (updates.role) {
      fields.push(`role = $${paramCount++}`);
      values.push(updates.role);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, role, is_active, is_banned, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Xóa user
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async deleteUser(userId) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [userId]);
    return result.rowCount > 0;
  }

  /**
   * Toggle active status
   * @param {string} userId
   * @param {boolean} isActive
   * @returns {Promise<Object>}
   */
  async toggleActiveStatus(userId, isActive) {
    const query = `
      UPDATE users
      SET is_active = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, role, is_active, updated_at
    `;
    
    const result = await pool.query(query, [isActive, userId]);
    return convertKeysToCamel(result.rows[0]);
  }

  /**
   * Toggle ban status
   * @param {string} userId
   * @param {boolean} isBanned
   * @returns {Promise<Object>}
   */
  async toggleBanStatus(userId, isBanned) {
    const query = `
      UPDATE users
      SET is_banned = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, role, is_banned, updated_at
    `;
    
    const result = await pool.query(query, [isBanned, userId]);
    return convertKeysToCamel(result.rows[0]);
  }

  /**
   * Tìm kiếm users theo email
   * @param {string} searchTerm
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async searchUsers(searchTerm, limit = 20) {
    const query = `
      SELECT id, email, role, is_active, is_banned, created_at
      FROM users
      WHERE email ILIKE $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [`%${searchTerm}%`, limit]);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  /**
   * Lấy thống kê users
   * @returns {Promise<Object>}
   */
  async getUserStats() {
    const query = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE role = 'patient') as total_patients,
        COUNT(*) FILTER (WHERE role = 'doctor') as total_doctors,
        COUNT(*) FILTER (WHERE role = 'admin') as total_admins,
        COUNT(*) FILTER (WHERE is_active = true) as active_users,
        COUNT(*) FILTER (WHERE is_banned = true) as banned_users
      FROM users
    `;
    
    const result = await pool.query(query);
    return convertKeysToCamel(result.rows[0]);
  }
}

module.exports = new UsersRepository();
