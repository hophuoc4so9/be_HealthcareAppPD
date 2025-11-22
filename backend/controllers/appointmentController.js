const { body, validationResult } = require('express-validator');
const appointmentService = require('../services/appointmentService');

class AppointmentController {
  validateAvailability() {
    return [
      body('startTime').isISO8601().withMessage('Invalid start time'),
      body('endTime').isISO8601().withMessage('Invalid end time')
    ];
  }

  validateAppointment() {
    return [
      body('doctorUserId').isUUID().withMessage('Invalid doctor ID'),
      body('availabilitySlotId').isUUID().withMessage('Invalid availability slot ID'),
      body('patientNotes').optional().trim()
    ];
  }

  // Availability
  async createAvailability(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { startTime, endTime } = req.body;
      const result = await appointmentService.createAvailability(req.user.id, startTime, endTime);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMyAvailability(req, res, next) {
    try {
      const result = await appointmentService.getMyAvailability(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteAvailability(req, res, next) {
    try {
      const result = await appointmentService.deleteAvailability(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async generateDailySlots(req, res, next) {
    try {
      const { date } = req.body;
      if (!date) {
        return res.status(400).json({ success: false, message: 'Date is required' });
      }
      const result = await appointmentService.generateDailySlots(req.user.id, date);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAvailabilityByDate(req, res, next) {
    try {
      const { date } = req.query;
      if (!date) {
        return res.status(400).json({ success: false, message: 'Date is required' });
      }
      const result = await appointmentService.getAvailabilityByDate(req.user.id, date);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async toggleDateAvailability(req, res, next) {
    try {
      const { date, enable } = req.body;
      if (!date || enable === undefined) {
        return res.status(400).json({ success: false, message: 'Date and enable flag are required' });
      }
      const result = await appointmentService.toggleDateAvailability(req.user.id, date, enable);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getCalendarOverview(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ success: false, message: 'Start date and end date are required' });
      }
      const result = await appointmentService.getCalendarOverview(req.user.id, startDate, endDate);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Appointments
  async bookAppointment(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const result = await appointmentService.bookAppointment(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMyAppointments(req, res, next) {
    try {
      const { status } = req.query;
      const result = await appointmentService.getMyAppointments(req.user.id, req.user.role, status);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getAppointmentDetails(req, res, next) {
    try {
      const result = await appointmentService.getAppointmentDetails(req.params.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const result = await appointmentService.updateStatus(req.params.id, status, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async cancelAppointment(req, res, next) {
    try {
      const result = await appointmentService.cancelAppointment(req.params.id, req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // For patients to view doctor's available slots
  async getDoctorAvailableSlots(req, res, next) {
    try {
      const { doctorUserId } = req.params;
      const { date } = req.query;
      
      if (!doctorUserId) {
        return res.status(400).json({ success: false, message: 'Doctor ID is required' });
      }

      const result = await appointmentService.getDoctorAvailableSlots(doctorUserId, date);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getDoctorAvailableSlotsByDateRange(req, res, next) {
    try {
      const { doctorUserId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!doctorUserId || !startDate || !endDate) {
        return res.status(400).json({ 
          success: false, 
          message: 'Doctor ID, start date, and end date are required' 
        });
      }

      const result = await appointmentService.getDoctorAvailableSlotsByDateRange(doctorUserId, startDate, endDate);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AppointmentController();
