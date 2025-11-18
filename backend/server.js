const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import middleware
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

// Import routes
const facilityRoutes = require("./routes/facilities");
const debugRoutes = require("./routes/debug");
const databaseRoutes = require("./routes/database");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const patientsRoutes = require("./routes/patients");
const doctorsRoutes = require("./routes/doctors");
const remindersRoutes = require("./routes/reminders");
const chatRoutes = require("./routes/chat");
const articlesRoutes = require("./routes/articles");
const appointmentsRoutes = require("./routes/appointments");
const adminRoutes = require("./routes/admin");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Test route
app.get("/", (req, res) => {
  res.json({ 
    message: "Healthcare API is running...",
    version: "3.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      patients: "/api/patients",
      doctors: "/api/doctors",
      appointments: "/api/appointments",
      reminders: "/api/reminders",
      chat: "/api/chat",
      articles: "/api/articles",
      admin: "/api/admin",
      facilities: "/api/facilities",
      database: "/api/database",
      debug: "/api/debug"
    }
  });
});

// API Routes
app.use("/api/facilities", facilityRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/database", databaseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/patients", patientsRoutes);
app.use("/api/doctors", doctorsRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/reminders", remindersRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/articles", articlesRoutes);
app.use("/api/admin", adminRoutes);

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
