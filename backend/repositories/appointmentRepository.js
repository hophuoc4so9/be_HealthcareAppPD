const pool = require('../db');

class AppointmentRepository {
  // Doctor availability
  async createAvailability(doctorUserId, startTime, endTime) {
    const query = `
      INSERT INTO doctor_availability (doctor_user_id, start_time, end_time)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [doctorUserId, startTime, endTime]);
    return result.rows[0];
  }

  async getAvailabilityByDoctorId(doctorUserId) {
    const query = `
      SELECT * FROM doctor_availability
      WHERE doctor_user_id = $1 AND is_booked = false
      ORDER BY start_time
    `;
    
    const result = await pool.query(query, [doctorUserId]);
    return result.rows;
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
    const { patientUserId, doctorUserId, availabilitySlotId, patientNotes } = appointmentData;
    
    const query = `
      INSERT INTO appointments (patient_user_id, doctor_user_id, availability_slot_id, patient_notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [patientUserId, doctorUserId, availabilitySlotId, patientNotes]);
    return result.rows[0];
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
    return result.rows[0] || null;
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
    return result.rows;
  }

  async getAppointmentsByDoctor(doctorUserId, status = null) {
    let query = `
      SELECT 
        a.*,
        pp.full_name as patient_name,
        da.start_time,
        da.end_time
      FROM appointments a
      JOIN patient_profiles pp ON a.patient_user_id = pp.user_id
      JOIN doctor_availability da ON a.availability_slot_id = da.id
      WHERE a.doctor_user_id = $1
    `;
    
    const params = [doctorUserId];
    
    if (status) {
      query += ` AND a.status = $2`;
      params.push(status);
    }
    
    query += ` ORDER BY da.start_time DESC`;
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  async updateAppointmentStatus(id, status) {
    const query = `
      UPDATE appointments
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
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
      return updateAppt.rows[0];
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
    return result.rows[0];
  }
}

module.exports = new AppointmentRepository();
