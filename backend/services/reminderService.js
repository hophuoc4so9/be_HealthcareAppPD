const reminderRepository = require('../repositories/reminderRepository');

class ReminderService {
  async createReminder(userId, reminderData) {
    const validTypes = ['medication', 'sleep', 'appointment', 'general'];
    // Check both camelCase and snake_case
    const reminderType = reminderData.reminderType || reminderData.reminder_type;
    if (!validTypes.includes(reminderType)) {
      throw new Error('Invalid reminder type');
    }

    const reminder = await reminderRepository.createReminder({
      patientUserId: userId,
      ...reminderData
    });

    return {
      success: true,
      message: 'Reminder created successfully',
      data: reminder
    };
  }

  async getMyReminders(userId) {
    const reminders = await reminderRepository.getRemindersByUserId(userId);

    return {
      success: true,
      data: { reminders, count: reminders.length }
    };
  }

  async updateReminder(id, userId, updates) {
    const reminder = await reminderRepository.getReminderById(id);
    if (!reminder) throw new Error('Reminder not found');
    // Now reminder is in camelCase, so check patientUserId instead of patient_user_id
    if (reminder.patientUserId !== userId) throw new Error('Unauthorized');

    const updated = await reminderRepository.updateReminder(id, updates);

    return {
      success: true,
      message: 'Reminder updated successfully',
      data: updated
    };
  }

  async toggleActive(id, userId, isActive) {
    const reminder = await reminderRepository.getReminderById(id);
    if (!reminder) throw new Error('Reminder not found');
    // Now reminder is in camelCase, so check patientUserId instead of patient_user_id
    if (reminder.patientUserId !== userId) throw new Error('Unauthorized');

    const updated = await reminderRepository.toggleActive(id, isActive);

    return {
      success: true,
      message: `Reminder ${isActive ? 'activated' : 'deactivated'}`,
      data: updated
    };
  }

  async deleteReminder(id, userId) {
    const reminder = await reminderRepository.getReminderById(id);
    if (!reminder) throw new Error('Reminder not found');
    // Now reminder is in camelCase, so check patientUserId instead of patient_user_id
    if (reminder.patientUserId !== userId) throw new Error('Unauthorized');

    await reminderRepository.deleteReminder(id);

    return {
      success: true,
      message: 'Reminder deleted successfully'
    };
  }
}

module.exports = new ReminderService();
