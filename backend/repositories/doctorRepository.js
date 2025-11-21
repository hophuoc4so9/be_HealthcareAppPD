const pool = require('../db');
const { convertKeysToCamel, normalizeToSnake } = require('../utils/fieldConverter');

/**
 * Repository for doctor profile operations
 */
class DoctorRepository {
  /**
   * Tạo doctor profile
   */
  async createProfile(profileData) {
    // Normalize input to snake_case (accepts both camelCase and snake_case)
    const normalized = normalizeToSnake(profileData);
    const { user_id, full_name, specialization, medical_license_id, clinic_address, bio } = normalized;
    
    const query = `
      INSERT INTO doctor_profiles 
        (user_id, full_name, specialization, medical_license_id, clinic_address, bio)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      user_id, full_name, specialization, medical_license_id, clinic_address, bio
    ]);
    
    return convertKeysToCamel(result.rows[0]);
  }

  /**
   * Lấy doctor profile theo user ID
   */
  async getProfileByUserId(userId) {
    const query = `
      SELECT 
        dp.*,
        u.email,
        u.role,
        u.is_active,
        u.created_at as user_created_at
      FROM doctor_profiles dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0] ? convertKeysToCamel(result.rows[0]) : null;
  }

  /**
   * Cập nhật doctor profile
   */
  async updateProfile(userId, updates) {
    // Normalize input to snake_case (accepts both camelCase and snake_case)
    const normalized = normalizeToSnake(updates);
    
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['full_name', 'specialization', 'medical_license_id', 'clinic_address', 'bio'];
    
    Object.keys(normalized).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount++}`);
        values.push(normalized[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(userId);

    const query = `
      UPDATE doctor_profiles
      SET ${fields.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return convertKeysToCamel(result.rows[0]);
  }

  /**
   * Cập nhật verification status (Admin only)
   */
  async updateVerificationStatus(userId, status, adminNotes = null) {
    const query = `
      UPDATE doctor_profiles
      SET status = $1, admin_notes = $2
      WHERE user_id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, adminNotes, userId]);
    return convertKeysToCamel(result.rows[0]);
  }

  /**
   * Lấy tất cả doctors
   */
  async getAllDoctors(limit = 20, offset = 0, status = null) {
    let query = `
      SELECT 
        dp.*,
        u.email,
        u.is_active,
        u.created_at as user_created_at
      FROM doctor_profiles dp
      JOIN users u ON dp.user_id = u.id
    `;
    
    const params = [];
    
    if (status) {
      query += ` WHERE dp.status = $1`;
      params.push(status);
      query += ` ORDER BY u.created_at DESC LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }
    
    const result = await pool.query(query, params);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  /**
   * Đếm doctors
   */
  async countDoctors(status = null) {
    let query = 'SELECT COUNT(*) FROM doctor_profiles';
    const params = [];
    
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  /**
   * Tìm kiếm doctors theo specialization
   */
  async searchBySpecialization(specialization, limit = 20) {
    const query = `
      SELECT 
        dp.*,
        u.email,
        u.is_active
      FROM doctor_profiles dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.specialization ILIKE $1 AND dp.status = 'approved'
      ORDER BY dp.full_name
      LIMIT $2
    `;
    
    const result = await pool.query(query, [`%${specialization}%`, limit]);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  /**
   * Kiểm tra profile tồn tại
   */
  async profileExists(userId) {
    const query = 'SELECT EXISTS(SELECT 1 FROM doctor_profiles WHERE user_id = $1)';
    const result = await pool.query(query, [userId]);
    return result.rows[0].exists;
  }

  /**
   * Xóa doctor profile
   */
  async deleteProfile(userId) {
    const query = 'DELETE FROM doctor_profiles WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount > 0;
  }
}

module.exports = new DoctorRepository();
