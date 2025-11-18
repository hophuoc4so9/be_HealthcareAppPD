const databaseService = require('../services/databaseService');

/**
 * Controller cho database management API endpoints
 */
class DatabaseController {
  /**
   * GET /api/database/status
   * Kiểm tra trạng thái database schema
   */
  async getSchemaStatus(req, res, next) {
    try {
      const result = await databaseService.checkSchemaStatus();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/database/initialize
   * Khởi tạo database schema (tạo bảng, extensions, enums)
   * Query params:
   *   - force=true : Xóa tất cả bảng trước khi tạo mới
   */
  async initializeSchema(req, res, next) {
    try {
      const force = req.query.force === 'true';
      
      if (force) {
        console.warn('⚠️  WARNING: Force initialization - All existing tables will be dropped!');
      }
      
      const result = await databaseService.initializeSchema(force);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/database/connection
   * Kiểm tra kết nối database
   */
  async checkConnection(req, res, next) {
    try {
      const result = await databaseService.checkConnection();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/database/tables
   * Lấy danh sách tất cả các bảng
   */
  async getAllTables(req, res, next) {
    try {
      const result = await databaseService.getAllTablesInfo();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/database/tables/:tableName
   * Lấy thông tin chi tiết về một bảng
   */
  async getTableDetails(req, res, next) {
    try {
      const { tableName } = req.params;
      const result = await databaseService.getTableDetails(tableName);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/database/enums
   * Lấy danh sách tất cả ENUM types
   */
  async getAllEnums(req, res, next) {
    try {
      const result = await databaseService.getAllEnumTypes();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/database/extensions
   * Lấy danh sách tất cả extensions
   */
  async getAllExtensions(req, res, next) {
    try {
      const result = await databaseService.getAllExtensions();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/database/stats
   * Lấy thống kê tổng quan về database
   */
  async getDatabaseStats(req, res, next) {
    try {
      const result = await databaseService.getDatabaseStatistics();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/database/reset
   * Reset database (xóa tất cả bảng và tạo lại)
   * CHÚ Ý: Chỉ nên dùng trong môi trường development!
   */
  async resetDatabase(req, res, next) {
    try {
      const { confirm } = req.body;
      
      if (confirm !== 'RESET_DATABASE') {
        return res.status(400).json({
          success: false,
          message: 'Please confirm database reset by sending { "confirm": "RESET_DATABASE" }'
        });
      }

      // Kiểm tra môi trường
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({
          success: false,
          message: 'Database reset is not allowed in production environment'
        });
      }

      const result = await databaseService.resetDatabase();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DatabaseController();
