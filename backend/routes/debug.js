const express = require("express");
const router = express.Router();
const pool = require("../db");

// Test database connection
router.get("/test-connection", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      message: "Database connected successfully",
      timestamp: result.rows[0].now
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: "Database connection failed",
      details: err.message
    });
  }
});

// Get table structure
router.get("/table-info", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'health_facilities_points'
      ORDER BY ordinal_position;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: "Failed to get table info",
      details: err.message
    });
  }
});

// Get sample data
router.get("/sample-data", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM health_facilities_points LIMIT 1"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      error: "Failed to get sample data",
      details: err.message
    });
  }
});

module.exports = router;