const { body, validationResult } = require('express-validator');
const doctorService = require('../services/doctorService');

class DoctorController {
  validateProfile() {
    return [
      body('fullName').trim().isLength({ min: 2 }).withMessage('Full name required'),
      body('specialization').trim().notEmpty().withMessage('Specialization required')
    ];
  }

  validateVerification() {
    return [
      body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status')
    ];
  }

  async createProfile(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const result = await doctorService.createProfile(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMyProfile(req, res, next) {
    try {
      const result = await doctorService.getProfile(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateMyProfile(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const result = await doctorService.updateProfile(req.user.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProfileById(req, res, next) {
    try {
      const result = await doctorService.getProfile(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateVerification(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { status, adminNotes } = req.body;
      const result = await doctorService.updateVerificationStatus(req.params.id, status, adminNotes);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAllDoctors(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const result = await doctorService.getAllDoctors({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async searchBySpecialization(req, res, next) {
    try {
      const { q, limit } = req.query;
      if (!q) {
        return res.status(400).json({ success: false, message: 'Query parameter "q" required' });
      }

      const result = await doctorService.searchBySpecialization(q, parseInt(limit) || 20);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DoctorController();
