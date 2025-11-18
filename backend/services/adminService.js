const adminRepository = require('../repositories/adminRepository');

class AdminService {
  async getDashboard() {
    const [stats, recentUsers, recentAppointments, pendingVerifications, monthlyStats] = await Promise.all([
      adminRepository.getDashboardStats(),
      adminRepository.getRecentUsers(10),
      adminRepository.getRecentAppointments(10),
      adminRepository.getPendingDoctorVerifications(),
      adminRepository.getMonthlyStats()
    ]);

    return {
      success: true,
      data: {
        stats,
        recentUsers,
        recentAppointments,
        pendingVerifications,
        monthlyStats
      }
    };
  }

  async getRecentAppointments(limit = 10) {
    const appointments = await adminRepository.getRecentAppointments(limit);
    return {
      success: true,
      data: appointments
    };
  }
}

module.exports = new AdminService();
