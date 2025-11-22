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

  /**
   * Lấy thống kê dashboard cho doctor
   */
  async getDashboardStats(userId) {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM appointments WHERE doctor_user_id = $1) as total_appointments,
        (SELECT COUNT(*) FROM appointments WHERE doctor_user_id = $1 AND status = 'scheduled') as scheduled_appointments,
        (SELECT COUNT(*) FROM appointments WHERE doctor_user_id = $1 AND status = 'completed') as completed_appointments,
        (SELECT COUNT(*) FROM appointments WHERE doctor_user_id = $1 AND status = 'cancelled') as cancelled_appointments,
        (SELECT COUNT(DISTINCT patient_user_id) FROM appointments WHERE doctor_user_id = $1) as total_patients,
        (SELECT COUNT(*) FROM appointments WHERE doctor_user_id = $1 AND appointment_date >= CURRENT_DATE) as upcoming_appointments,
        (SELECT COUNT(*) FROM appointments WHERE doctor_user_id = $1 AND appointment_date = CURRENT_DATE) as today_appointments
    `;
    
    const result = await pool.query(query, [userId]);
    return convertKeysToCamel(result.rows[0]);
  }

  /**
   * Lấy danh sách patients của doctor
   */
  async getMyPatients(userId, limit = 20) {
    const query = `
      SELECT DISTINCT
        u.id,
        u.email,
        pp.full_name,
        pp.date_of_birth,
        pp.phone_number,
        pp.gender,
        COUNT(a.id) as total_appointments,
        MAX(a.appointment_date) as last_appointment_date
      FROM users u
      INNER JOIN patient_profiles pp ON u.id = pp.user_id
      INNER JOIN appointments a ON u.id = a.patient_user_id
      WHERE a.doctor_user_id = $1
      GROUP BY u.id, u.email, pp.full_name, pp.date_of_birth, pp.phone_number, pp.gender
      ORDER BY MAX(a.appointment_date) DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [userId, limit]);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  /**
   * Lấy chi tiết bệnh nhân
   */
  async getPatientDetail(doctorUserId, patientUserId) {
    const query = `
      SELECT 
        u.id,
        u.email,
        u.created_at,
        pp.*,
        COUNT(DISTINCT a.id) as total_appointments,
        MAX(a.appointment_date) as last_appointment_date,
        COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_appointments,
        COUNT(DISTINCT CASE WHEN a.status = 'scheduled' THEN a.id END) as upcoming_appointments
      FROM users u
      INNER JOIN patient_profiles pp ON u.id = pp.user_id
      LEFT JOIN appointments a ON u.id = a.patient_user_id AND a.doctor_user_id = $1
      WHERE u.id = $2
      GROUP BY u.id, u.email, u.created_at, pp.id, pp.user_id, pp.full_name, pp.date_of_birth, 
               pp.phone_number, pp.gender, pp.address, pp.emergency_contact, pp.blood_type, 
               pp.allergies, pp.current_medications, pp.medical_history, pp.created_at, pp.updated_at
      HAVING COUNT(a.id) > 0
    `;
    
    const result = await pool.query(query, [doctorUserId, patientUserId]);
    return result.rows[0] ? convertKeysToCamel(result.rows[0]) : null;
  }

  /**
   * Lấy lịch sử appointments của bệnh nhân với doctor
   */
  async getPatientAppointments(doctorUserId, patientUserId) {
    const query = `
      SELECT 
        a.*,
        s.start_time as slot_start_time,
        s.end_time as slot_end_time
      FROM appointments a
      LEFT JOIN appointment_slots s ON a.availability_slot_id = s.id
      WHERE a.doctor_user_id = $1 AND a.patient_user_id = $2
      ORDER BY a.appointment_date DESC, s.start_time DESC
    `;
    
    const result = await pool.query(query, [doctorUserId, patientUserId]);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  /**
   * Lấy chỉ số sức khỏe của bệnh nhân (placeholder - cần table health_metrics)
   */
  async getPatientHealthMetrics(doctorUserId, patientUserId) {
    // Check if patient belongs to this doctor
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM appointments
      WHERE doctor_user_id = $1 AND patient_user_id = $2
    `;
    
    const checkResult = await pool.query(checkQuery, [doctorUserId, patientUserId]);
    if (parseInt(checkResult.rows[0].count) === 0) {
      return [];
    }

    // TODO: Implement when health_metrics table exists
    // For now, return empty array or mock data
    return [];
  }
}

module.exports = new DoctorRepository();
