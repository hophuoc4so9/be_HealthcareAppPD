const { body, validationResult } = require('express-validator');
const authService = require('../services/authService');

/**
 * Controller for authentication endpoints
 */
class AuthController {
  /**
   * Validation rules cho register
   */
  validateRegister() {
    return [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
      body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
      body('role')
        .optional()
        .isIn(['patient', 'doctor', 'admin'])
        .withMessage('Role must be: patient, doctor, or admin')
    ];
  }

  /**
   * Validation rules cho login
   */
  validateLogin() {
    return [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
      body('password')
        .notEmpty()
        .withMessage('Password is required')
    ];
  }

  /**
   * Validation rules cho change password
   */
  validateChangePassword() {
    return [
      body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
      body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
    ];
  }

  /**
   * POST /api/auth/register
   * Đăng ký user mới
   */
  async register(req, res, next) {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password, role } = req.body;
      const result = await authService.register({ email, password, role });
      
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Đăng nhập
   */
  async login(req, res, next) {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;
      const result = await authService.login(email, password);

      // Nếu là patient, tự động tạo profile nếu chưa có
      if (result.success && result.data && result.data.user && result.data.user.role === 'patient') {
        const patientService = require('../services/patientService');
        const userId = result.data.user.id;
        // Tạo fullName từ email (bỏ phần @ và sau đó)
        const fullName = email.split('@')[0];
        // Gọi createProfile, không cần chờ kết quả
        patientService.createProfile(userId, {
          fullName,
          dateOfBirth: null,
          sex: null,
          phoneNumber: null
        }).catch(() => {}); // Không làm gì nếu lỗi
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/change-password
   * Đổi password (yêu cầu authentication)
   */
  async changePassword(req, res, next) {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id; // Từ JWT middleware

      const result = await authService.changePassword(userId, currentPassword, newPassword);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/profile
   * Lấy thông tin profile của user đang login
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id; // Từ JWT middleware
      const result = await authService.getProfile(userId);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/verify-token
   * Verify JWT token
   */
  async verifyToken(req, res, next) {
    try {
      const { token } = req.body;
      
      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token is required'
        });
      }

      const decoded = authService.verifyToken(token);
      
      res.json({
        success: true,
        message: 'Token is valid',
        data: decoded
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/register-doctor
   * Đăng ký bác sĩ mới với thông tin đầy đủ
   */
  async registerDoctor(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { 
        email, password, fullName, phoneNumber, 
        specialization, medicalLicenseId, clinicAddress, bio 
      } = req.body;

      // Register user with doctor role
      const userResult = await authService.register({ 
        email, 
        password, 
        role: 'doctor' 
      });

      // Create doctor profile
      const doctorService = require('../services/doctorService');
      await doctorService.createProfile(userResult.data.user.id, {
        fullName,
        phoneNumber,
        specialization,
        medicalLicenseId,
        clinicAddress,
        bio
      });

      res.status(201).json({
        success: true,
        message: 'Doctor registered successfully',
        data: userResult.data
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
