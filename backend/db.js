const { Pool } = require("pg");
require("dotenv").config();

// Support both individual connection params and DATABASE_URL (for Render)
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        },
        // Force UTF-8 encoding for proper Vietnamese characters
        client_encoding: 'UTF8'
      }
    : {
        user: process.env.DB_USER || "your_username",
        password: process.env.DB_PASSWORD || "your_password",
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || "healthcare_db",
        // Force UTF-8 encoding for proper Vietnamese characters
        client_encoding: 'UTF8'
      }
);

module.exports = pool;