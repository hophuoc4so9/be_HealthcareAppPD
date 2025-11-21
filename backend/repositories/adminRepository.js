const pool = require('../db');
const { convertKeysToCamel } = require('../utils/fieldConverter');

class AdminRepository {
  async getDashboardStats() {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'patient') as total_patients,
        (SELECT COUNT(*) FROM users WHERE role = 'doctor') as total_doctors,
        (SELECT COUNT(*) FROM appointments) as total_appointments,
        (SELECT COUNT(*) FROM appointments WHERE status = 'scheduled') as pending_appointments,
        (SELECT COUNT(*) FROM doctor_profiles WHERE status = 'pending') as pending_verifications,
        (SELECT COUNT(*) FROM articles WHERE status = 'published') as published_articles
    `;
    
    const result = await pool.query(query);
    return convertKeysToCamel(result.rows[0]);
  }

  async getRecentUsers(limit = 10) {
    const query = `
      SELECT id, email, role, is_active, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  async getRecentAppointments(limit = 10) {
    const query = `
      SELECT 
        a.id,
        a.status,
        a.created_at,
        pp.full_name as patient_name,
        dp.full_name as doctor_name,
        da.start_time,
        da.end_time
      FROM appointments a
      JOIN patient_profiles pp ON a.patient_user_id = pp.user_id
      JOIN doctor_profiles dp ON a.doctor_user_id = dp.user_id
      JOIN doctor_availability da ON a.availability_slot_id = da.id
      ORDER BY a.created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  async getPendingDoctorVerifications() {
    const query = `
      SELECT 
        dp.*,
        u.email,
        u.created_at as registered_at
      FROM doctor_profiles dp
      JOIN users u ON dp.user_id = u.id
      WHERE dp.status = 'pending'
      ORDER BY u.created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  async getMonthlyStats() {
    const query = `
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) FILTER (WHERE role = 'patient') as patients,
        COUNT(*) FILTER (WHERE role = 'doctor') as doctors
      FROM users
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `;
    
    const result = await pool.query(query);
    return result.rows.map(row => convertKeysToCamel(row));
  }
}

module.exports = new AdminRepository();
