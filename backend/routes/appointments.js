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

module.exports = router;
