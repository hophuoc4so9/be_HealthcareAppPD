const pool = require('../db');
const { convertKeysToCamel, normalizeToSnake } = require('../utils/fieldConverter');

class ChatRepository {
  async createConversation(patientUserId, doctorUserId) {
    const query = `
      INSERT INTO chat_conversations (patient_user_id, doctor_user_id)
      VALUES ($1, $2)
      ON CONFLICT (patient_user_id, doctor_user_id) DO UPDATE
      SET patient_user_id = EXCLUDED.patient_user_id
      RETURNING *
    `;
    
    const result = await pool.query(query, [patientUserId, doctorUserId]);
    return convertKeysToCamel(result.rows[0]);
  }

  async getConversationsByUserId(userId, role) {
    const query = `
      SELECT 
        cc.*,
        u_patient.email as patient_email,
        u_doctor.email as doctor_email,
        pp.full_name as patient_name,
        dp.full_name as doctor_name
      FROM chat_conversations cc
      JOIN users u_patient ON cc.patient_user_id = u_patient.id
      JOIN users u_doctor ON cc.doctor_user_id = u_doctor.id
      LEFT JOIN patient_profiles pp ON cc.patient_user_id = pp.user_id
      LEFT JOIN doctor_profiles dp ON cc.doctor_user_id = dp.user_id
      WHERE ${role === 'patient' ? 'cc.patient_user_id' : 'cc.doctor_user_id'} = $1
      ORDER BY cc.id DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => convertKeysToCamel(row));
  }

  async getMessagesByConversationId(conversationId, limit = 50) {
    const query = `
      SELECT 
        cm.*,
        u.email as sender_email,
        u.role as sender_role
      FROM chat_messages cm
      JOIN users u ON cm.sender_user_id = u.id
      WHERE cm.conversation_id = $1
      ORDER BY cm.sent_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [conversationId, limit]);
    return result.rows.reverse().map(row => convertKeysToCamel(row));
  }

  async sendMessage(conversationId, senderUserId, messageContent) {
    const query = `
      INSERT INTO chat_messages (conversation_id, sender_user_id, message_content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [conversationId, senderUserId, messageContent]);
    return convertKeysToCamel(result.rows[0]);
  }

  async markAsRead(messageId) {
    const query = `
      UPDATE chat_messages
      SET read_at = NOW()
      WHERE id = $1 AND read_at IS NULL
      RETURNING *
    `;
    
    const result = await pool.query(query, [messageId]);
    return convertKeysToCamel(result.rows[0]);
  }
}

module.exports = new ChatRepository();
