const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.use(authenticateToken);

// Doctor routes
router.post('/profile', authorize('doctor'), doctorController.validateProfile(), doctorController.createProfile);
router.get('/profile', authorize('doctor'), doctorController.getMyProfile);
router.put('/profile', authorize('doctor'), doctorController.validateProfile(), doctorController.updateMyProfile);
router.get('/dashboard/stats', authorize('doctor'), doctorController.getDashboardStats);
router.get('/patients', authorize('doctor'), doctorController.getMyPatients);
router.get('/patients/:patientId', authorize('doctor'), doctorController.getPatientDetail);
router.get('/patients/:patientId/appointments', authorize('doctor'), doctorController.getPatientAppointments);
router.get('/patients/:patientId/health-metrics', authorize('doctor'), doctorController.getPatientHealthMetrics);

// Public/Admin routes
router.get('/', doctorController.getAllDoctors);
router.get('/search', doctorController.searchBySpecialization);
router.get('/:id/profile', doctorController.getProfileById);

// Admin only
router.patch('/:id/verification', authorize('admin'), doctorController.validateVerification(), doctorController.updateVerification);

module.exports = router;
