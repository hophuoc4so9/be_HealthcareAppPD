const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticateToken, authorize } = require('../middleware/auth');

/**
 * Patient Profile API Routes
 * Base path: /api/patients
 */

// Middleware: Tất cả routes yêu cầu authentication
router.use(authenticateToken);

// ========== PROFILE ROUTES ==========

// POST /api/patients/profile - Tạo profile (Patient only)
router.post('/profile',
  authorize('patient'),
  patientController.validateProfile(),
  patientController.createProfile
);

// GET /api/patients/profile - Lấy profile của mình (Patient only)
router.get('/profile',
  authorize('patient'),
  patientController.getMyProfile
);

// PUT /api/patients/profile - Cập nhật profile của mình (Patient only)
router.put('/profile',
  authorize('patient'),
  patientController.validateProfile(),
  patientController.updateMyProfile
);

// ========== VITALS ROUTES ==========

// POST /api/patients/vitals - Thêm vitals (Patient only)
router.post('/vitals',
  authorize('patient'),
  patientController.validateVitals(),
  patientController.addVitals
);

// GET /api/patients/vitals - Lấy vitals history (Patient only)
router.get('/vitals',
  authorize('patient'),
  patientController.getVitalsHistory
);

// GET /api/patients/vitals/latest - Lấy vitals mới nhất (Patient only)
router.get('/vitals/latest',
  authorize('patient'),
  patientController.getLatestVitals
);

// DELETE /api/patients/vitals/:id - Xóa vitals (Patient only)
router.delete('/vitals/:id',
  authorize('patient'),
  patientController.deleteVitals
);

// ========== METRICS ROUTES ==========

// POST /api/patients/metrics - Thêm metrics (Patient only)
router.post('/metrics',
  authorize('patient'),
  patientController.validateMetrics(),
  patientController.addMetrics
);

// GET /api/patients/metrics - Lấy metrics (Patient only)
router.get('/metrics',
  authorize('patient'),
  patientController.getMetrics
);

// GET /api/patients/metrics/summary - Lấy metrics summary (Patient only)
router.get('/metrics/summary',
  authorize('patient'),
  patientController.getMetricsSummary
);

// DELETE /api/patients/metrics/:id - Xóa metrics (Patient only)
router.delete('/metrics/:id',
  authorize('patient'),
  patientController.deleteMetrics
);

// ========== ADMIN ROUTES ==========

// GET /api/patients - Lấy tất cả patient profiles (Admin only)
router.get('/',
  authorize('admin'),
  patientController.getAllProfiles
);

// GET /api/patients/:id/profile - Lấy profile theo ID (Admin, Doctor)
router.get('/:id/profile',
  authorize('admin', 'doctor'),
  patientController.getProfileById
);

module.exports = router;
