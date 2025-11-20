const patientRepository = require('../repositories/patientRepository');
const authRepository = require('../repositories/authRepository');

/**
 * Service layer for patient profile management
 */
class PatientService {
  /**
   * Tạo patient profile
   * @param {string} userId
   * @param {Object} profileData
   * @returns {Promise<Object>}
   */
  async createProfile(userId, profileData) {
    // Kiểm tra user tồn tại và là patient
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role !== 'patient') {
      throw new Error('User must have patient role to create patient profile');
    }

    // Kiểm tra profile đã tồn tại chưa
    const exists = await patientRepository.profileExists(userId);
    if (exists) {
      throw new Error('Patient profile already exists');
    }

    // Validate sex
    if (profileData.sex && !['male', 'female', 'other', 'prefer_not_to_say'].includes(profileData.sex)) {
      throw new Error('Invalid sex value');
    }

    const profile = await patientRepository.createProfile({
      userId,
      ...profileData
    });

    return {
      success: true,
      message: 'Patient profile created successfully',
      data: profile
    };
  }

  /**
   * Lấy patient profile (tạo tự động nếu chưa tồn tại)
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getProfile(userId) {
    let profile = await patientRepository.getProfileByUserId(userId);

    // Auto-create profile if it doesn't exist
    if (!profile) {
      const user = await authRepository.findUserById(userId);
      if (!user || user.role !== 'patient') {
        throw new Error('Patient profile not found or user is not a patient');
      }

      // Create profile with default name
      profile = await patientRepository.createProfile({
        userId,
        fullName: `Patient_${userId.substring(0, 8)}`
      });
    }

    return {
      success: true,
      data: profile
    };
  }

  /**
   * Cập nhật patient profile
   * @param {string} userId
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateProfile(userId, updates) {
    // Kiểm tra profile tồn tại
    const exists = await patientRepository.profileExists(userId);
    if (!exists) {
      throw new Error('Patient profile not found');
    }

    // Validate sex
    if (updates.sex && !['male', 'female', 'other', 'prefer_not_to_say'].includes(updates.sex)) {
      throw new Error('Invalid sex value');
    }

    const profile = await patientRepository.updateProfile(userId, updates);

    return {
      success: true,
      message: 'Patient profile updated successfully',
      data: profile
    };
  }

  /**
   * Xóa patient profile
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async deleteProfile(userId) {
    const exists = await patientRepository.profileExists(userId);
    if (!exists) {
      throw new Error('Patient profile not found');
    }

    await patientRepository.deleteProfile(userId);

    return {
      success: true,
      message: 'Patient profile deleted successfully'
    };
  }

  // ========== VITALS ==========

  /**
   * Thêm vitals
   * @param {string} patientUserId
   * @param {Object} vitalsData
   * @returns {Promise<Object>}
   */
  async addVitals(patientUserId, vitalsData) {
    const { heightCm, weightKg } = vitalsData;

    // Validate
    if (!heightCm || !weightKg) {
      throw new Error('Height and weight are required');
    }

    if (heightCm <= 0 || weightKg <= 0) {
      throw new Error('Height and weight must be positive numbers');
    }

    // Calculate BMI
    const heightM = heightCm / 100;
    const bmi = (weightKg / (heightM * heightM)).toFixed(2);

    const vitals = await patientRepository.addVitals({
      patientUserId,
      heightCm,
      weightKg,
      bmi: parseFloat(bmi)
    });

    return {
      success: true,
      message: 'Vitals added successfully',
      data: vitals
    };
  }

  /**
   * Lấy vitals history
   * @param {string} patientUserId
   * @param {number} limit
   * @returns {Promise<Object>}
   */
  async getVitalsHistory(patientUserId, limit = 10) {
    const history = await patientRepository.getVitalsHistory(patientUserId, limit);

    return {
      success: true,
      data: {
        history,
        count: history.length
      }
    };
  }

  /**
   * Lấy vitals mới nhất
   * @param {string} patientUserId
   * @returns {Promise<Object>}
   */
  async getLatestVitals(patientUserId) {
    const vitals = await patientRepository.getLatestVitals(patientUserId);

    return {
      success: true,
      data: vitals
    };
  }

  /**
   * Xóa vitals
   * @param {number} vitalsId
   * @param {string} patientUserId
   * @returns {Promise<Object>}
   */
  async deleteVitals(vitalsId, patientUserId) {
    const deleted = await patientRepository.deleteVitals(vitalsId, patientUserId);

    if (!deleted) {
      throw new Error('Vitals record not found or unauthorized');
    }

    return {
      success: true,
      message: 'Vitals deleted successfully'
    };
  }

  // ========== METRICS ==========

  /**
   * Thêm metrics
   * @param {string} patientUserId
   * @param {Object} metricsData
   * @returns {Promise<Object>}
   */
  async addMetrics(patientUserId, metricsData) {
    const { metricType, value, startTime, endTime, source, metadata } = metricsData;

    // Validate metric type
    const validTypes = ['steps', 'sleep_duration_minutes', 'distance_meters', 'active_calories'];
    if (!validTypes.includes(metricType)) {
      throw new Error(`Invalid metric type. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate value
    if (value < 0) {
      throw new Error('Metric value must be non-negative');
    }

    // Validate time range
    if (new Date(startTime) > new Date(endTime)) {
      throw new Error('Start time must be before end time');
    }

    const metrics = await patientRepository.addMetrics({
      patientUserId,
      metricType,
      value,
      startTime,
      endTime,
      source: source || 'manual',
      metadata: metadata || null
    });

    return {
      success: true,
      message: 'Metrics added successfully',
      data: metrics
    };
  }

  /**
   * Lấy metrics
   * @param {string} patientUserId
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async getMetrics(patientUserId, options = {}) {
    const {
      metricType,
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDate = new Date()
    } = options;

    if (!metricType) {
      throw new Error('Metric type is required');
    }

    const metrics = await patientRepository.getMetrics(
      patientUserId,
      metricType,
      startDate,
      endDate
    );

    return {
      success: true,
      data: {
        metrics,
        count: metrics.length
      }
    };
  }

  /**
   * Lấy metrics summary
   * @param {string} patientUserId
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async getMetricsSummary(patientUserId, options = {}) {
    const {
      metricType,
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate = new Date()
    } = options;

    if (!metricType) {
      throw new Error('Metric type is required');
    }

    const summary = await patientRepository.getMetricsSummary(
      patientUserId,
      metricType,
      startDate,
      endDate
    );

    return {
      success: true,
      data: summary
    };
  }

  /**
   * Xóa metrics
   * @param {number} metricsId
   * @param {string} patientUserId
   * @returns {Promise<Object>}
   */
  async deleteMetrics(metricsId, patientUserId) {
    const deleted = await patientRepository.deleteMetrics(metricsId, patientUserId);

    if (!deleted) {
      throw new Error('Metrics record not found or unauthorized');
    }

    return {
      success: true,
      message: 'Metrics deleted successfully'
    };
  }

  /**
   * Lấy tất cả patient profiles (Admin)
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async getAllProfiles(options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const [profiles, total] = await Promise.all([
      patientRepository.getAllProfiles(limit, offset),
      patientRepository.countProfiles()
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        profiles,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    };
  }
}

module.exports = new PatientService();
