const express = require('express');
const router = express.Router();
const databaseController = require('../controllers/databaseController');

/**
 * Database Management API Routes
 * Base path: /api/database
 */

// GET /api/database/connection - Kiểm tra kết nối database
router.get('/connection', databaseController.checkConnection);

// GET /api/database/status - Kiểm tra trạng thái schema
router.get('/status', databaseController.getSchemaStatus);

// GET /api/database/stats - Lấy thống kê database
router.get('/stats', databaseController.getDatabaseStats);

// GET /api/database/tables - Lấy danh sách tất cả bảng
router.get('/tables', databaseController.getAllTables);

// GET /api/database/tables/:tableName - Lấy thông tin chi tiết bảng
router.get('/tables/:tableName', databaseController.getTableDetails);

// GET /api/database/enums - Lấy danh sách ENUM types
router.get('/enums', databaseController.getAllEnums);

// GET /api/database/extensions - Lấy danh sách extensions
router.get('/extensions', databaseController.getAllExtensions);

// POST /api/database/initialize - Khởi tạo schema
// Query params: ?force=true (xóa bảng cũ trước)
router.post('/initialize', databaseController.initializeSchema);

// POST /api/database/reset - Reset database (development only)
// Body: { "confirm": "RESET_DATABASE" }
router.post('/reset', databaseController.resetDatabase);

module.exports = router;
