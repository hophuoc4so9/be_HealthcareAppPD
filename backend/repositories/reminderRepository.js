const pool = require('../db');

class ReminderRepository {
  async createReminder(reminderData) {
    const { patientUserId, title, description, reminderType, cronExpression, oneTimeAt, timezoneName } = reminderData;
    
    const query = `
      INSERT INTO reminders 
        (patient_user_id, title, description, reminder_type, cron_expression, one_time_at, timezone_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      patientUserId, title, description, reminderType, cronExpression, oneTimeAt, timezoneName
    ]);
    
    return result.rows[0];
  }

  async getRemindersByUserId(userId) {
    const query = `
      SELECT * FROM reminders
      WHERE patient_user_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async getReminderById(id) {
    const query = 'SELECT * FROM reminders WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async updateReminder(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      fields.push(`${key} = $${paramCount++}`);
      values.push(updates[key]);
    });

    values.push(id);

    const query = `
      UPDATE reminders
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async toggleActive(id, isActive) {
    const query = `
      UPDATE reminders
      SET is_active = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [isActive, id]);
    return result.rows[0];
  }

  async deleteReminder(id) {
    const query = 'DELETE FROM reminders WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }
}

module.exports = new ReminderRepository();
