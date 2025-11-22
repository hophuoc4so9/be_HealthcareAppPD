const pool = require('../db');
const { convertKeysToCamel, normalizeToSnake } = require('../utils/fieldConverter');

class AppointmentRepository {
  // Doctor availability
  async createAvailability(doctorUserId, startTime, endTime) {
    const query = `
      INSERT INTO doctor_availability (doctor_user_id, start_time, end_time)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [doctorUserId, startTime, endTime]);
    return convertKeysToCamel(result.rows[0]);
  }

  async getAvailabilityByDoctorId(doctorUserId) {
    const query = `
      SELECT * FROM doctor_availability
      WHERE doctor_user_id = $1 AND is_booked = false
      ORDER BY start_time
    `;
    
    const result = await pool.query(query, [doctorUserId]);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  async deleteAvailability(id, doctorUserId) {
    const query = `
      DELETE FROM doctor_availability
      WHERE id = $1 AND doctor_user_id = $2
    `;
    
    const result = await pool.query(query, [id, doctorUserId]);
    return result.rowCount > 0;
  }

  // Appointments
  async createAppointment(appointmentData) {
    // Normalize input to snake_case (accepts both camelCase and snake_case)
    const normalized = normalizeToSnake(appointmentData);
    const { patient_user_id, doctor_user_id, availability_slot_id, patient_notes } = normalized;
    
    const query = `
      INSERT INTO appointments (patient_user_id, doctor_user_id, availability_slot_id, patient_notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [patient_user_id, doctor_user_id, availability_slot_id, patient_notes]);
    return convertKeysToCamel(result.rows[0]);
  }

  async getAppointmentById(id) {
    const query = `
      SELECT 
        a.*,
        pp.full_name as patient_name,
        dp.full_name as doctor_name,
        dp.specialization,
        da.start_time,
        da.end_time
      FROM appointments a
      JOIN patient_profiles pp ON a.patient_user_id = pp.user_id
      JOIN doctor_profiles dp ON a.doctor_user_id = dp.user_id
      JOIN doctor_availability da ON a.availability_slot_id = da.id
      WHERE a.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] ? convertKeysToCamel(result.rows[0]) : null;
  }

  async getAppointmentsByPatient(patientUserId, status = null) {
    let query = `
      SELECT 
        a.*,
        dp.full_name as doctor_name,
        dp.specialization,
        da.start_time,
        da.end_time
      FROM appointments a
      JOIN doctor_profiles dp ON a.doctor_user_id = dp.user_id
      JOIN doctor_availability da ON a.availability_slot_id = da.id
      WHERE a.patient_user_id = $1
    `;
    
    const params = [patientUserId];
    
    if (status) {
      query += ` AND a.status = $2`;
      params.push(status);
    }
    
    query += ` ORDER BY da.start_time DESC`;
    
    const result = await pool.query(query, params);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  async getAppointmentsByDoctor(doctorUserId, status = null) {
    let query = `
      SELECT 
        a.*,
        u.email as patient_email,
        pp.full_name as patient_name,
        s.start_time as slot_start_time,
        s.end_time as slot_end_time
      FROM appointments a
      JOIN users u ON a.patient_user_id = u.id
      JOIN patient_profiles pp ON a.patient_user_id = pp.user_id
      LEFT JOIN doctor_availability s ON a.availability_slot_id = s.id
      WHERE a.doctor_user_id = $1
    `;
    
    const params = [doctorUserId];
    
    if (status) {
      query += ` AND a.status = $2`;
      params.push(status);
    }
    
    query += ` ORDER BY s.start_time DESC`;
    
    const result = await pool.query(query, params);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  async updateAppointmentStatus(id, status) {
    const query = `
      UPDATE appointments
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, id]);
    return convertKeysToCamel(result.rows[0]);
  }

  async cancelAppointment(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Get availability slot ID
      const getSlot = await client.query(
        'SELECT availability_slot_id FROM appointments WHERE id = $1',
        [id]
      );
      
      // Update appointment status
      const updateAppt = await client.query(
        `UPDATE appointments SET status = 'cancelled' WHERE id = $1 RETURNING *`,
        [id]
      );
      
      // Mark slot as available again
      if (getSlot.rows[0]) {
        await client.query(
          'UPDATE doctor_availability SET is_booked = false WHERE id = $1',
          [getSlot.rows[0].availability_slot_id]
        );
      }
      
      await client.query('COMMIT');
      return convertKeysToCamel(updateAppt.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async markSlotAsBooked(slotId) {
    const query = `
      UPDATE doctor_availability
      SET is_booked = true
      WHERE id = $1 AND is_booked = false
      RETURNING *
    `;
    
    const result = await pool.query(query, [slotId]);
    return convertKeysToCamel(result.rows[0]);
  }

  // Auto-generate availability slots
  async generateDailySlots(doctorUserId, date) {
    // Default time slots: 8, 9, 10, 11, 13, 14, 15, 16, 19, 20
    const defaultHours = [8, 9, 10, 11, 13, 14, 15, 16, 19, 20];
    const slots = [];

    for (const hour of defaultHours) {
      const startTime = new Date(date);
      startTime.setHours(hour, 0, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(hour + 1, 0, 0, 0);

      const query = `
        INSERT INTO doctor_availability (doctor_user_id, start_time, end_time, is_booked)
        VALUES ($1, $2, $3, false)
        ON CONFLICT DO NOTHING
        RETURNING *
      `;
      
      const result = await pool.query(query, [doctorUserId, startTime, endTime]);
      if (result.rows[0]) {
        slots.push(convertKeysToCamel(result.rows[0]));
      }
    }

    return slots;
  }

  async getAvailabilityByDate(doctorUserId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = `
      SELECT * FROM doctor_availability
      WHERE doctor_user_id = $1 
        AND start_time >= $2 
        AND start_time < $3
      ORDER BY start_time
    `;
    
    const result = await pool.query(query, [doctorUserId, startOfDay, endOfDay]);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  async deleteSlotsByDate(doctorUserId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = `
      DELETE FROM doctor_availability
      WHERE doctor_user_id = $1 
        AND start_time >= $2 
        AND start_time < $3
        AND is_booked = false
      RETURNING *
    `;
    
    const result = await pool.query(query, [doctorUserId, startOfDay, endOfDay]);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  async getAvailabilityByDateRange(doctorUserId, startDate, endDate) {
    const query = `
      SELECT 
        DATE(start_time) as date,
        COUNT(*) as total_slots,
        COUNT(*) FILTER (WHERE is_booked = false) as available_slots,
        COUNT(*) FILTER (WHERE is_booked = true) as booked_slots
      FROM doctor_availability
      WHERE doctor_user_id = $1 
        AND start_time >= $2 
        AND start_time < $3
      GROUP BY DATE(start_time)
      ORDER BY date
    `;
    
    const result = await pool.query(query, [doctorUserId, startDate, endDate]);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  // For patients to view available slots
  async getAvailableSlotsByDoctor(doctorUserId, date = null) {
    let query = `
      SELECT da.* 
      FROM doctor_availability da
      WHERE da.doctor_user_id = $1 
        AND da.is_booked = false
        AND da.start_time > NOW()
    `;
    
    const params = [doctorUserId];

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query += ` AND da.start_time >= $2 AND da.start_time < $3`;
      params.push(startOfDay, endOfDay);
    }

    query += ` ORDER BY da.start_time ASC`;
    
    const result = await pool.query(query, params);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  async getAvailableSlotsByDateRange(doctorUserId, startDate, endDate) {
    const query = `
      SELECT da.*
      FROM doctor_availability da
      WHERE da.doctor_user_id = $1 
        AND da.is_booked = false
        AND da.start_time >= $2 
        AND da.start_time < $3
        AND da.start_time > NOW()
      ORDER BY da.start_time ASC
    `;
    
    const result = await pool.query(query, [doctorUserId, startDate, endDate]);
    return result.rows.map(row => convertKeysToCamel(row));
  }
}

module.exports = new AppointmentRepository();
