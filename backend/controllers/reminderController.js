const { body, validationResult } = require('express-validator');
const reminderService = require('../services/reminderService');

class ReminderController {
  validateReminder() {
    return [
      body('title').trim().notEmpty().withMessage('Title required'),
      body('reminderType').isIn(['medication', 'sleep', 'appointment', 'general']).withMessage('Invalid type')
    ];
  }

  async createReminder(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const result = await reminderService.createReminder(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMyReminders(req, res, next) {
    try {
      const result = await reminderService.getMyReminders(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateReminder(req, res, next) {
    try {
      const result = await reminderService.updateReminder(req.params.id, req.user.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req, res, next) {
    try {
      const { isActive } = req.body;
      const result = await reminderService.toggleActive(req.params.id, req.user.id, isActive);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteReminder(req, res, next) {
    try {
      const result = await reminderService.deleteReminder(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReminderController();
