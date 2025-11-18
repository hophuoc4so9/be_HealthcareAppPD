const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/authRepository');
const { jwtSecret, jwtExpiration, saltRounds } = require('../config/jwt');

/**
 * Service layer for authentication operations
 */
class AuthService {
  /**
   * Đăng ký user mới
   * @param {Object} userData - {email, password, role}
   * @returns {Promise<Object>}
   */
  async register({ email, password, role = 'patient' }) {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!['patient', 'doctor', 'admin'].includes(role)) {
      throw new Error('Invalid role. Must be: patient, doctor, or admin');
    }

    // Kiểm tra email đã tồn tại chưa
    const emailExists = await authRepository.emailExists(email);
    if (emailExists) {
      throw new Error('Email already registered');
    }

    // Validate password strength
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Tạo user
    const user = await authRepository.createUser({
      email,
      hashedPassword,
      role
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          is_active: user.is_active
        },
        token
      }
    };
  }

  /**
   * Đăng nhập
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>}
   */
  async login(email, password) {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Tìm user
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Kiểm tra account bị banned
    if (user.is_banned) {
      throw new Error('Account has been banned. Please contact support');
    }

    // Kiểm tra account active
    if (!user.is_active) {
      throw new Error('Account is not active. Please verify your email');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.hashed_password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          is_active: user.is_active
        },
        token
      }
    };
  }

  /**
   * Đổi password
   * @param {string} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<Object>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Validate input
    if (!currentPassword || !newPassword) {
      throw new Error('Current password and new password are required');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    // Tìm user
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Lấy password cũ từ DB
    const userWithPassword = await authRepository.findUserByEmail(user.email);
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, userWithPassword.hashed_password);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await authRepository.updatePassword(userId, hashedPassword);

    return {
      success: true,
      message: 'Password changed successfully'
    };
  }

  /**
   * Verify token
   * @param {string} token
   * @returns {Object}
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, jwtSecret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate JWT token
   * @param {Object} user
   * @returns {string}
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, jwtSecret, {
      expiresIn: jwtExpiration
    });
  }

  /**
   * Get user profile
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getProfile(userId) {
    const user = await authRepository.findUserById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        is_banned: user.is_banned,
        created_at: user.created_at
      }
    };
  }
}

module.exports = new AuthService();
