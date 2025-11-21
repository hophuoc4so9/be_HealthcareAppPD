const pool = require('../db');
const { convertKeysToCamel, normalizeToSnake } = require('../utils/fieldConverter');

/**
 * Repository for patient profile operations
 */
class PatientRepository {
  /**
   * Tạo patient profile
   * @param {Object} profileData
   * @returns {Promise<Object>}
   */
  async createProfile(profileData) {
    // Normalize input to snake_case (accepts both camelCase and snake_case)
    const normalized = normalizeToSnake(profileData);
    const { user_id, full_name, date_of_birth, sex, phone_number, address } = normalized;
    
    // Ensure full_name has a value (required by database)
    const name = full_name || `Patient_${user_id.substring(0, 8)}`;
    
    const query = `
      INSERT INTO patient_profiles 
        (user_id, full_name, date_of_birth, sex, phone_number, address)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      user_id, name, date_of_birth, sex, phone_number, address
    ]);
    
    return convertKeysToCamel(result.rows[0]);
  }

  /**
   * Lấy patient profile theo user ID
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  async getProfileByUserId(userId) {
    const query = `
      SELECT 
        pp.*,
        u.email,
        u.role,
        u.is_active,
        u.created_at as user_created_at
      FROM patient_profiles pp
      JOIN users u ON pp.user_id = u.id
      WHERE pp.user_id = $1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0] ? convertKeysToCamel(result.rows[0]) : null;
  }

  /**
   * Cập nhật patient profile
   * @param {string} userId
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateProfile(userId, updates) {
    // Normalize input to snake_case (accepts both camelCase and snake_case)
    const normalized = normalizeToSnake(updates);
    
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Only update fields that exist in the patient_profiles table
    const allowedFields = ['full_name', 'date_of_birth', 'sex', 'phone_number', 'address'];
    
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
      UPDATE patient_profiles
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return convertKeysToCamel(result.rows[0]);
  }

  /**
   * Xóa patient profile
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async deleteProfile(userId) {
    const query = 'DELETE FROM patient_profiles WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rowCount > 0;
  }

  /**
   * Kiểm tra profile tồn tại
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async profileExists(userId) {
    const query = 'SELECT EXISTS(SELECT 1 FROM patient_profiles WHERE user_id = $1)';
    const result = await pool.query(query, [userId]);
    return result.rows[0].exists;
  }

  // ========== VITALS (Chỉ số tĩnh) ==========

  /**
   * Thêm vitals record
   * @param {Object} vitalsData
   * @returns {Promise<Object>}
   */
  async addVitals(vitalsData) {
    // Normalize input to snake_case (accepts both camelCase and snake_case)
    const normalized = normalizeToSnake(vitalsData);
    const { patient_user_id, height_cm, weight_kg, bmi } = normalized;
    
    const query = `
      INSERT INTO patient_vitals 
        (patient_user_id, height_cm, weight_kg, bmi)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [patient_user_id, height_cm, weight_kg, bmi]);
    return convertKeysToCamel(result.rows[0]);
  }

  /**
   * Lấy vitals history
   * @param {string} patientUserId
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getVitalsHistory(patientUserId, limit = 10) {
    const query = `
      SELECT * FROM patient_vitals
      WHERE patient_user_id = $1
      ORDER BY recorded_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [patientUserId, limit]);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  /**
   * Lấy vitals mới nhất
   * @param {string} patientUserId
   * @returns {Promise<Object|null>}
   */
  async getLatestVitals(patientUserId) {
    const query = `
      SELECT * FROM patient_vitals
      WHERE patient_user_id = $1
      ORDER BY recorded_at DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query, [patientUserId]);
    return result.rows[0] ? convertKeysToCamel(result.rows[0]) : null;
  }

  /**
   * Xóa vitals record
   * @param {number} vitalsId
   * @param {string} patientUserId
   * @returns {Promise<boolean>}
   */
  async deleteVitals(vitalsId, patientUserId) {
    const query = `
      DELETE FROM patient_vitals 
      WHERE id = $1 AND patient_user_id = $2
    `;
    
    const result = await pool.query(query, [vitalsId, patientUserId]);
    return result.rowCount > 0;
  }

  // ========== METRICS (Chỉ số động) ==========

  /**
   * Thêm metrics record
   * @param {Object} metricsData
   * @returns {Promise<Object>}
   */
  async addMetrics(metricsData) {
    // Normalize input to snake_case (accepts both camelCase and snake_case)
    const normalized = normalizeToSnake(metricsData);
    const { patient_user_id, metric_type, value, start_time, end_time, source, metadata } = normalized;
    
    const query = `
      INSERT INTO patient_metrics 
        (patient_user_id, metric_type, value, start_time, end_time, source, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      patient_user_id, metric_type, value, start_time, end_time, source, metadata
    ]);
    
    return convertKeysToCamel(result.rows[0]);
  }

  /**
   * Lấy metrics theo type và time range
   * @param {string} patientUserId
   * @param {string} metricType
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Array>}
   */
  async getMetrics(patientUserId, metricType, startDate, endDate) {
    const query = `
      SELECT * FROM patient_metrics
      WHERE patient_user_id = $1 
        AND metric_type = $2
        AND start_time >= $3
        AND end_time <= $4
      ORDER BY start_time DESC
    `;
    
    const result = await pool.query(query, [patientUserId, metricType, startDate, endDate]);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  /**
   * Lấy metrics summary (tổng hợp)
   * @param {string} patientUserId
   * @param {string} metricType
   * @param {Date} startDate
   * @param {Date} endDate
   * @returns {Promise<Object>}
   */
  async getMetricsSummary(patientUserId, metricType, startDate, endDate) {
    const query = `
      SELECT 
        metric_type,
        COUNT(*) as total_records,
        SUM(value) as total_value,
        AVG(value) as average_value,
        MIN(value) as min_value,
        MAX(value) as max_value
      FROM patient_metrics
      WHERE patient_user_id = $1 
        AND metric_type = $2
        AND start_time >= $3
        AND end_time <= $4
      GROUP BY metric_type
    `;
    
    const result = await pool.query(query, [patientUserId, metricType, startDate, endDate]);
    return result.rows[0] ? convertKeysToCamel(result.rows[0]) : null;
  }

  /**
   * Xóa metrics record
   * @param {number} metricsId
   * @param {string} patientUserId
   * @returns {Promise<boolean>}
   */
  async deleteMetrics(metricsId, patientUserId) {
    const query = `
      DELETE FROM patient_metrics 
      WHERE id = $1 AND patient_user_id = $2
    `;
    
    const result = await pool.query(query, [metricsId, patientUserId]);
    return result.rowCount > 0;
  }

  /**
   * Lấy tất cả patient profiles (Admin)
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<Array>}
   */
  async getAllProfiles(limit = 20, offset = 0) {
    const query = `
      SELECT 
        pp.*,
        u.email,
        u.is_active,
        u.created_at as user_created_at
      FROM patient_profiles pp
      JOIN users u ON pp.user_id = u.id
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  /**
   * Đếm tổng số patient profiles
   * @returns {Promise<number>}
   */
  async countProfiles() {
    const query = 'SELECT COUNT(*) FROM patient_profiles';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }
}

module.exports = new PatientRepository();
