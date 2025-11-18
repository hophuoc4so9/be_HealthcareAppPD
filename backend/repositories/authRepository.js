const pool = require('../db');

/**
 * Repository for authentication operations
 */
class AuthRepository {
  /**
   * Tìm user theo email
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  async findUserByEmail(email) {
    const query = `
      SELECT id, email, hashed_password, role, is_active, is_banned, created_at
      FROM users
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Tìm user theo ID
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  async findUserById(userId) {
    const query = `
      SELECT id, email, role, is_active, is_banned, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Tạo user mới
   * @param {Object} userData - {email, hashedPassword, role}
   * @returns {Promise<Object>}
   */
  async createUser({ email, hashedPassword, role }) {
    const query = `
      INSERT INTO users (email, hashed_password, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, is_active, created_at
    `;
    
    const result = await pool.query(query, [email, hashedPassword, role]);
    return result.rows[0];
  }

  /**
   * Cập nhật password
   * @param {string} userId
   * @param {string} hashedPassword
   * @returns {Promise<Object>}
   */
  async updatePassword(userId, hashedPassword) {
    const query = `
      UPDATE users
      SET hashed_password = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, role
    `;
    
    const result = await pool.query(query, [hashedPassword, userId]);
    return result.rows[0];
  }

  /**
   * Cập nhật trạng thái active của user
   * @param {string} userId
   * @param {boolean} isActive
   * @returns {Promise<Object>}
   */
  async updateActiveStatus(userId, isActive) {
    const query = `
      UPDATE users
      SET is_active = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, role, is_active
    `;
    
    const result = await pool.query(query, [isActive, userId]);
    return result.rows[0];
  }

  /**
   * Ban/unban user
   * @param {string} userId
   * @param {boolean} isBanned
   * @returns {Promise<Object>}
   */
  async updateBanStatus(userId, isBanned) {
    const query = `
      UPDATE users
      SET is_banned = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, role, is_banned
    `;
    
    const result = await pool.query(query, [isBanned, userId]);
    return result.rows[0];
  }

  /**
   * Kiểm tra email đã tồn tại chưa
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  async emailExists(email) {
    const query = 'SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)';
    const result = await pool.query(query, [email]);
    return result.rows[0].exists;
  }
}

module.exports = new AuthRepository();
