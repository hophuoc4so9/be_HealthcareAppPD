const adminService = require('../services/adminService');

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const result = await adminService.getDashboard();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getRecentAppointments(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const result = await adminService.getRecentAppointments(limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
