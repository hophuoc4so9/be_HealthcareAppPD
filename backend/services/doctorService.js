const doctorRepository = require('../repositories/doctorRepository');
const authRepository = require('../repositories/authRepository');

class DoctorService {
  async createProfile(userId, profileData) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new Error('User not found');
    if (user.role !== 'doctor') throw new Error('User must have doctor role');

    const exists = await doctorRepository.profileExists(userId);
    if (exists) throw new Error('Doctor profile already exists');

    const profile = await doctorRepository.createProfile({
      userId,
      ...profileData
    });

    return {
      success: true,
      message: 'Doctor profile created successfully. Awaiting admin verification.',
      data: profile
    };
  }

  async getProfile(userId) {
    const profile = await doctorRepository.getProfileByUserId(userId);
    if (!profile) throw new Error('Doctor profile not found');

    return { success: true, data: profile };
  }

  async updateProfile(userId, updates) {
    const exists = await doctorRepository.profileExists(userId);
    if (!exists) throw new Error('Doctor profile not found');

    const profile = await doctorRepository.updateProfile(userId, updates);

    return {
      success: true,
      message: 'Doctor profile updated successfully',
      data: profile
    };
  }

  async updateVerificationStatus(userId, status, adminNotes) {
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new Error('Invalid status');
    }

    const profile = await doctorRepository.updateVerificationStatus(userId, status, adminNotes);

    return {
      success: true,
      message: `Doctor verification ${status}`,
      data: profile
    };
  }

  async getAllDoctors(options = {}) {
    const { page = 1, limit = 20, status } = options;
    const offset = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      doctorRepository.getAllDoctors(limit, offset, status),
      doctorRepository.countDoctors(status)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        doctors,
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

  async searchBySpecialization(specialization, limit = 20) {
    const doctors = await doctorRepository.searchBySpecialization(specialization, limit);

    return {
      success: true,
      data: { doctors, count: doctors.length }
    };
  }

  async deleteProfile(userId) {
    const exists = await doctorRepository.profileExists(userId);
    if (!exists) throw new Error('Doctor profile not found');

    await doctorRepository.deleteProfile(userId);

    return {
      success: true,
      message: 'Doctor profile deleted'
    };
  }

  async getDashboardStats(userId) {
    const stats = await doctorRepository.getDashboardStats(userId);
    return {
      success: true,
      data: stats
    };
  }

  async getMyPatients(userId, limit = 20) {
    const patients = await doctorRepository.getMyPatients(userId, limit);
    return {
      success: true,
      data: patients
    };
  }
}

module.exports = new DoctorService();
