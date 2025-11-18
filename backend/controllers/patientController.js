const { body, validationResult } = require('express-validator');
const patientService = require('../services/patientService');

/**
 * Controller for patient profile management
 */
class PatientController {
  /**
   * Validation rules cho create/update profile
   */
  validateProfile() {
    return [
      body('fullName')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Full name must be at least 2 characters'),
      body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format'),
      body('sex')
        .optional()
        .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
        .withMessage('Invalid sex value'),
      body('phoneNumber')
        .optional()
        .isMobilePhone()
        .withMessage('Invalid phone number')
    ];
  }

  /**
   * Validation rules cho vitals
   */
  validateVitals() {
    return [
      body('heightCm')
        .isFloat({ min: 50, max: 300 })
        .withMessage('Height must be between 50 and 300 cm'),
      body('weightKg')
        .isFloat({ min: 10, max: 500 })
        .withMessage('Weight must be between 10 and 500 kg')
    ];
  }

  /**
   * Validation rules cho metrics
   */
  validateMetrics() {
    return [
      body('metricType')
        .isIn(['steps', 'sleep_duration_minutes', 'distance_meters', 'active_calories'])
        .withMessage('Invalid metric type'),
      body('value')
        .isFloat({ min: 0 })
        .withMessage('Value must be non-negative'),
      body('startTime')
        .isISO8601()
        .withMessage('Invalid start time format'),
      body('endTime')
        .isISO8601()
        .withMessage('Invalid end time format')
    ];
  }

  /**
   * POST /api/patients/profile
   * Tạo patient profile cho user đang login
   */
  async createProfile(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const result = await patientService.createProfile(userId, req.body);
      
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/patients/profile
   * Lấy profile của patient đang login
   */
  async getMyProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await patientService.getProfile(userId);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/patients/profile
   * Cập nhật profile của patient đang login
   */
  async updateMyProfile(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const result = await patientService.updateProfile(userId, req.body);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/patients/:id/profile
   * Lấy profile của patient (Admin hoặc Doctor)
   */
  async getProfileById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await patientService.getProfile(id);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ========== VITALS ==========

  /**
   * POST /api/patients/vitals
   * Thêm vitals record
   */
  async addVitals(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const result = await patientService.addVitals(userId, req.body);
      
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/patients/vitals
   * Lấy vitals history
   */
  async getVitalsHistory(req, res, next) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await patientService.getVitalsHistory(userId, limit);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/patients/vitals/latest
   * Lấy vitals mới nhất
   */
  async getLatestVitals(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await patientService.getLatestVitals(userId);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/patients/vitals/:id
   * Xóa vitals record
   */
  async deleteVitals(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const result = await patientService.deleteVitals(id, userId);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // ========== METRICS ==========

  /**
   * POST /api/patients/metrics
   * Thêm metrics record
   */
  async addMetrics(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      const result = await patientService.addMetrics(userId, req.body);
      
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/patients/metrics
   * Lấy metrics
   */
  async getMetrics(req, res, next) {
    try {
      const userId = req.user.id;
      const { metricType, startDate, endDate } = req.query;
      
      const result = await patientService.getMetrics(userId, {
        metricType,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/patients/metrics/summary
   * Lấy metrics summary
   */
  async getMetricsSummary(req, res, next) {
    try {
      const userId = req.user.id;
      const { metricType, startDate, endDate } = req.query;
      
      const result = await patientService.getMetricsSummary(userId, {
        metricType,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/patients/metrics/:id
   * Xóa metrics record
   */
  async deleteMetrics(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      const result = await patientService.deleteMetrics(id, userId);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/patients
   * Lấy tất cả patient profiles (Admin only)
   */
  async getAllProfiles(req, res, next) {
    try {
      const { page, limit } = req.query;
      
      const result = await patientService.getAllProfiles({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PatientController();
