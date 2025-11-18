const databaseRepository = require('../repositories/databaseRepository');

/**
 * Service layer cho database management operations
 */
class DatabaseService {
  /**
   * Kiểm tra và trả về trạng thái của database schema
   * @returns {Promise<Object>}
   */
  async checkSchemaStatus() {
    try {
      const status = await databaseRepository.getSchemaStatus();
      
      return {
        success: true,
        data: status,
        message: status.schema_complete 
          ? 'Database schema is complete and ready' 
          : 'Database schema is incomplete'
      };
    } catch (error) {
      throw new Error(`Failed to check schema status: ${error.message}`);
    }
  }

  /**
   * Khởi tạo database schema (tạo tất cả bảng, extensions, enums)
   * @param {boolean} force - Có force drop tất cả bảng trước không
   * @returns {Promise<Object>}
   */
  async initializeSchema(force = false) {
    try {
      // Nếu force = true, xóa tất cả bảng trước
      if (force) {
        await databaseRepository.dropAllTables();
      }

      // Kiểm tra trạng thái trước khi tạo
      const statusBefore = await databaseRepository.getSchemaStatus();
      
      if (statusBefore.schema_complete && !force) {
        return {
          success: true,
          message: 'Database schema already complete. No changes needed.',
          data: statusBefore
        };
      }

      // Thực thi schema.sql
      await databaseRepository.initializeSchema();

      // Kiểm tra trạng thái sau khi tạo
      const statusAfter = await databaseRepository.getSchemaStatus();

      return {
        success: true,
        message: 'Database schema initialized successfully',
        data: {
          before: statusBefore,
          after: statusAfter,
          created: {
            tables: statusAfter.tables.existing.filter(
              t => !statusBefore.tables.existing.includes(t)
            ),
            extensions: statusAfter.extensions.existing.filter(
              e => !statusBefore.extensions.existing.includes(e)
            ),
            enums: statusAfter.enums.existing.filter(
              e => !statusBefore.enums.existing.includes(e)
            )
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to initialize schema: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin chi tiết về tất cả các bảng
   * @returns {Promise<Object>}
   */
  async getAllTablesInfo() {
    try {
      const tables = await databaseRepository.getAllTables();
      
      return {
        success: true,
        data: {
          total_tables: tables.length,
          tables: tables
        }
      };
    } catch (error) {
      throw new Error(`Failed to get tables info: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin chi tiết về một bảng cụ thể
   * @param {string} tableName - Tên bảng
   * @returns {Promise<Object>}
   */
  async getTableDetails(tableName) {
    try {
      // Kiểm tra bảng có tồn tại không
      const exists = await databaseRepository.tableExists(tableName);
      
      if (!exists) {
        return {
          success: false,
          message: `Table '${tableName}' does not exist`,
          data: null
        };
      }

      const tableInfo = await databaseRepository.getTableInfo(tableName);
      
      return {
        success: true,
        data: tableInfo
      };
    } catch (error) {
      throw new Error(`Failed to get table details: ${error.message}`);
    }
  }

  /**
   * Kiểm tra kết nối database
   * @returns {Promise<Object>}
   */
  async checkConnection() {
    try {
      const connectionInfo = await databaseRepository.checkConnection();
      
      return {
        success: connectionInfo.connected,
        data: connectionInfo,
        message: connectionInfo.connected 
          ? 'Database connection successful' 
          : 'Database connection failed'
      };
    } catch (error) {
      return {
        success: false,
        message: `Database connection failed: ${error.message}`,
        data: { connected: false, error: error.message }
      };
    }
  }

  /**
   * Lấy thống kê tổng quan về database
   * @returns {Promise<Object>}
   */
  async getDatabaseStatistics() {
    try {
      const [stats, extensions, enums, tables] = await Promise.all([
        databaseRepository.getDatabaseStats(),
        databaseRepository.getAllExtensions(),
        databaseRepository.getAllEnumTypes(),
        databaseRepository.getAllTables()
      ]);

      return {
        success: true,
        data: {
          overview: stats,
          extensions: extensions,
          enums: enums,
          tables: tables
        }
      };
    } catch (error) {
      throw new Error(`Failed to get database statistics: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách tất cả ENUM types
   * @returns {Promise<Object>}
   */
  async getAllEnumTypes() {
    try {
      const enums = await databaseRepository.getAllEnumTypes();
      
      return {
        success: true,
        data: {
          total_enums: enums.length,
          enums: enums
        }
      };
    } catch (error) {
      throw new Error(`Failed to get enum types: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách tất cả extensions
   * @returns {Promise<Object>}
   */
  async getAllExtensions() {
    try {
      const extensions = await databaseRepository.getAllExtensions();
      
      return {
        success: true,
        data: {
          total_extensions: extensions.length,
          extensions: extensions
        }
      };
    } catch (error) {
      throw new Error(`Failed to get extensions: ${error.message}`);
    }
  }

  /**
   * Xóa tất cả các bảng (CHÚ Ý: Nguy hiểm!)
   * Chỉ nên dùng trong môi trường development
   * @returns {Promise<Object>}
   */
  async resetDatabase() {
    try {
      // Xóa tất cả bảng
      await databaseRepository.dropAllTables();
      
      // Tạo lại schema
      const result = await this.initializeSchema(false);
      
      return {
        success: true,
        message: 'Database reset successfully',
        data: result.data
      };
    } catch (error) {
      throw new Error(`Failed to reset database: ${error.message}`);
    }
  }
}

module.exports = new DatabaseService();
