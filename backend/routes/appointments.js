const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.use(authenticateToken);

// Doctor availability
router.post('/availability', 
  authorize('doctor'), 
  appointmentController.validateAvailability(), 
  appointmentController.createAvailability
);
router.get('/availability', authorize('doctor'), appointmentController.getMyAvailability);
router.delete('/availability/:id', authorize('doctor'), appointmentController.deleteAvailability);

// New endpoints for managing daily schedules
router.post('/availability/generate-daily', authorize('doctor'), appointmentController.generateDailySlots);
router.get('/availability/by-date', authorize('doctor'), appointmentController.getAvailabilityByDate);
router.post('/availability/toggle-date', authorize('doctor'), appointmentController.toggleDateAvailability);
router.get('/availability/calendar', authorize('doctor'), appointmentController.getCalendarOverview);

// Appointments
router.post('/', 
  authorize('patient'), 
  appointmentController.validateAppointment(), 
  appointmentController.bookAppointment
);
router.get('/', appointmentController.getMyAppointments);
router.get('/:id', appointmentController.getAppointmentDetails);
router.patch('/:id/status', authorize('doctor'), appointmentController.updateStatus);
router.patch('/:id/cancel', appointmentController.cancelAppointment);

// Public endpoints for patients to view doctor availability
router.get('/doctors/:doctorUserId/available-slots', appointmentController.getDoctorAvailableSlots);
router.get('/doctors/:doctorUserId/available-slots/range', appointmentController.getDoctorAvailableSlotsByDateRange);

module.exports = router;
