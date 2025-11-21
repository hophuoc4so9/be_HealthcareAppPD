const pool = require('../db');
const { convertKeysToCamel, normalizeToSnake } = require('../utils/fieldConverter');

class ReminderRepository {
  async createReminder(reminderData) {
    // Normalize input to snake_case (accepts both camelCase and snake_case)
    const normalized = normalizeToSnake(reminderData);
    const { patient_user_id, title, description, reminder_type, cron_expression, one_time_at, timezone_name } = normalized;
    
    const query = `
      INSERT INTO reminders 
        (patient_user_id, title, description, reminder_type, cron_expression, one_time_at, timezone_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      patient_user_id, title, description, reminder_type, cron_expression, one_time_at, timezone_name
    ]);
    
    return convertKeysToCamel(result.rows[0]);
  }

  async getRemindersByUserId(userId) {
    const query = `
      SELECT * FROM reminders
      WHERE patient_user_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  async getReminderById(id) {
    const query = 'SELECT * FROM reminders WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? convertKeysToCamel(result.rows[0]) : null;
  }

  async updateReminder(id, updates) {
    // Normalize input to snake_case (accepts both camelCase and snake_case)
    const normalized = normalizeToSnake(updates);
    
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(normalized).forEach(key => {
      fields.push(`${key} = $${paramCount++}`);
      values.push(normalized[key]);
    });

    values.push(id);

    const query = `
      UPDATE reminders
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return convertKeysToCamel(result.rows[0]);
  }

  async toggleActive(id, isActive) {
    const query = `
      UPDATE reminders
      SET is_active = $1
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [isActive, id]);
    return convertKeysToCamel(result.rows[0]);
  }

  async deleteReminder(id) {
    const query = 'DELETE FROM reminders WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }
}

module.exports = new ReminderRepository();
