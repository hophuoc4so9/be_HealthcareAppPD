const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import middleware
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

// Import routes
const facilityRoutes = require("./routes/facilities");
const debugRoutes = require("./routes/debug");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Test route
app.get("/", (req, res) => {
  res.json({ 
    message: "Healthcare API is running...",
    version: "1.0.0",
    endpoints: {
      facilities: "/api/facilities",
      search: "/api/facilities/search"
    }
  });
});

// API Routes
app.use("/api/facilities", facilityRoutes);
app.use("/api/debug", debugRoutes);

// Legacy routes (for backward compatibility)
app.use("/facilities", facilityRoutes);

// Error handler middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 API Documentation: http://localhost:${PORT}`);
});
