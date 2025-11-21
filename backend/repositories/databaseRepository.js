const pool = require('../db');
const fs = require('fs').promises;
const path = require('path');
const { convertKeysToCamel } = require('../utils/fieldConverter');

/**
 * Repository for database schema management operations
 */
class DatabaseRepository {
  /**
   * Kiểm tra xem một bảng có tồn tại hay không
   * @param {string} tableName - Tên bảng cần kiểm tra
   * @returns {Promise<boolean>}
   */
  async tableExists(tableName) {
    const query = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `;
    
    const result = await pool.query(query, [tableName]);
    return result.rows[0].exists;
  }

  /**
   * Kiểm tra xem một extension có được kích hoạt hay không
   * @param {string} extensionName - Tên extension cần kiểm tra
   * @returns {Promise<boolean>}
   */
  async extensionExists(extensionName) {
    const query = `
      SELECT EXISTS (
        SELECT FROM pg_extension 
        WHERE extname = $1
      );
    `;
    
    const result = await pool.query(query, [extensionName]);
    return result.rows[0].exists;
  }

  /**
   * Kiểm tra xem một ENUM type có tồn tại hay không
   * @param {string} typeName - Tên ENUM type cần kiểm tra
   * @returns {Promise<boolean>}
   */
  async enumTypeExists(typeName) {
    const query = `
      SELECT EXISTS (
        SELECT FROM pg_type 
        WHERE typname = $1 
        AND typtype = 'e'
      );
    `;
    
    const result = await pool.query(query, [typeName]);
    return result.rows[0].exists;
  }

  /**
   * Lấy danh sách tất cả các bảng trong schema public
   * @returns {Promise<Array>}
   */
  async getAllTables() {
    const query = `
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns 
         WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Lấy thông tin chi tiết về một bảng
   * @param {string} tableName - Tên bảng
   * @returns {Promise<Object>}
   */
  async getTableInfo(tableName) {
    const columnsQuery = `
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position;
    `;

    const constraintsQuery = `
      SELECT
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = 'public'
      AND tc.table_name = $1;
    `;

    const indexesQuery = `
      SELECT
        indexname as index_name,
        indexdef as index_definition
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename = $1;
    `;

    const [columns, constraints, indexes] = await Promise.all([
      pool.query(columnsQuery, [tableName]),
      pool.query(constraintsQuery, [tableName]),
      pool.query(indexesQuery, [tableName])
    ]);

    return {
      table_name: tableName,
      columns: columns.rows,
      constraints: constraints.rows,
      indexes: indexes.rows
    };
  }

  /**
   * Lấy danh sách tất cả các ENUM types
   * @returns {Promise<Array>}
   */
  async getAllEnumTypes() {
    const query = `
      SELECT 
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid  
      WHERE t.typtype = 'e'
      GROUP BY t.typname
      ORDER BY t.typname;
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Lấy danh sách các extensions đã cài đặt
   * @returns {Promise<Array>}
   */
  async getAllExtensions() {
    const query = `
      SELECT 
        extname as extension_name,
        extversion as version
      FROM pg_extension
      ORDER BY extname;
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Thực thi SQL script từ file
   * @param {string} filePath - Đường dẫn đến file SQL
   * @returns {Promise<Object>}
   */
  async executeSqlFile(filePath) {
    try {
      const sql = await fs.readFile(filePath, 'utf8');
      const result = await pool.query(sql);
      return {
        success: true,
        message: 'SQL file executed successfully',
        result
      };
    } catch (error) {
      throw new Error(`Failed to execute SQL file: ${error.message}`);
    }
  }

  /**
   * Thực thi schema.sql để tạo tất cả các bảng
   * @returns {Promise<Object>}
   */
  async initializeSchema() {
    const schemaPath = path.join(__dirname, '../config/schema.sql');
    
    try {
      const sql = await fs.readFile(schemaPath, 'utf8');
      
      // Tách SQL thành các statements riêng biệt
      // Xử lý DO blocks và multi-line statements
      const statements = this.parseSqlStatements(sql);
      
      const results = [];
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await pool.query(statement);
            results.push({ success: true, statement: statement.substring(0, 100) });
          } catch (error) {
            // Bỏ qua lỗi "already exists"
            if (error.message.includes('already exists') || 
                error.message.includes('duplicate')) {
              results.push({ success: true, skipped: true, statement: statement.substring(0, 100) });
            } else {
              throw error;
            }
          }
        }
      }
      
      return {
        success: true,
        message: 'SQL schema executed successfully',
        statements_executed: results.length
      };
    } catch (error) {
      throw new Error(`Failed to execute SQL schema: ${error.message}`);
    }
  }

  /**
   * Parse SQL file thành các statements riêng biệt
   * @param {string} sql - SQL content
   * @returns {Array<string>}
   */
  parseSqlStatements(sql) {
    const statements = [];
    let currentStatement = '';
    let inDoBlock = false;
    let dollarQuoteTag = null;
    
    const lines = sql.split('\n');
    
    for (let line of lines) {
      const trimmedLine = line.trim();
      
      // Bỏ qua comments
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }
      
      // Kiểm tra DO block
      if (trimmedLine.match(/^DO\s+\$\$/i)) {
        inDoBlock = true;
        dollarQuoteTag = '$$';
      }
      
      currentStatement += line + '\n';
      
      // Kết thúc DO block
      if (inDoBlock && trimmedLine === 'END $$;') {
        statements.push(currentStatement.trim());
        currentStatement = '';
        inDoBlock = false;
        dollarQuoteTag = null;
        continue;
      }
      
      // Kết thúc statement thông thường
      if (!inDoBlock && trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // Thêm statement cuối nếu có
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    return statements;
  }

  /**
   * Kiểm tra trạng thái database schema
   * @returns {Promise<Object>}
   */
  async getSchemaStatus() {
    const expectedTables = [
      'users',
      'patient_profiles',
      'doctor_profiles',
      'patient_vitals',
      'patient_metrics',
      'reminders',
      'doctor_availability',
      'appointments',
      'chat_conversations',
      'chat_messages',
      'doctor_patients',
      'articles'
    ];

    const expectedExtensions = ['uuid-ossp', 'postgis'];

    const expectedEnums = [
      'user_role',
      'user_sex',
      'verification_status',
      'metric_type',
      'reminder_type',
      'appointment_status',
      'article_status'
    ];

    // Kiểm tra tất cả các thành phần
    const [tables, extensions, enums] = await Promise.all([
      this.getAllTables(),
      this.getAllExtensions(),
      this.getAllEnumTypes()
    ]);

    const existingTableNames = tables.map(t => t.table_name);
    const existingExtensionNames = extensions.map(e => e.extension_name);
    const existingEnumNames = enums.map(e => e.enum_name);

    const missingTables = expectedTables.filter(t => !existingTableNames.includes(t));
    const missingExtensions = expectedExtensions.filter(e => !existingExtensionNames.includes(e));
    const missingEnums = expectedEnums.filter(e => !existingEnumNames.includes(e));

    return {
      tables: {
        total: tables.length,
        expected: expectedTables.length,
        existing: existingTableNames,
        missing: missingTables,
        complete: missingTables.length === 0
      },
      extensions: {
        total: extensions.length,
        expected: expectedExtensions.length,
        existing: existingExtensionNames,
        missing: missingExtensions,
        complete: missingExtensions.length === 0
      },
      enums: {
        total: enums.length,
        expected: expectedEnums.length,
        existing: existingEnumNames,
        missing: missingEnums,
        complete: missingEnums.length === 0
      },
      schema_complete: missingTables.length === 0 && 
                      missingExtensions.length === 0 && 
                      missingEnums.length === 0
    };
  }

  /**
   * Xóa tất cả các bảng (CHÚ Ý: Nguy hiểm!)
   * @returns {Promise<Object>}
   */
  async dropAllTables() {
    const query = `
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `;
    
    await pool.query(query);
    return { success: true, message: 'All tables dropped successfully' };
  }

  /**
   * Kiểm tra kết nối database
   * @returns {Promise<Object>}
   */
  async checkConnection() {
    try {
      const result = await pool.query('SELECT NOW() as current_time, version() as postgres_version');
      return {
        connected: true,
        timestamp: result.rows[0].current_time,
        version: result.rows[0].postgres_version
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy thống kê database
   * @returns {Promise<Object>}
   */
  async getDatabaseStats() {
    const query = `
      SELECT 
        current_database() as database_name,
        pg_size_pretty(pg_database_size(current_database())) as database_size,
        (SELECT count(*) FROM information_schema.tables 
         WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as table_count,
        (SELECT count(*) FROM pg_type WHERE typtype = 'e') as enum_count,
        (SELECT count(*) FROM pg_extension) as extension_count;
    `;
    
    const result = await pool.query(query);
    return convertKeysToCamel(result.rows[0]);
  }
}

module.exports = new DatabaseRepository();
