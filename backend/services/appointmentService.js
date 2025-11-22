const appointmentRepository = require('../repositories/appointmentRepository');

class AppointmentService {
  // Doctor availability
  async createAvailability(doctorUserId, startTime, endTime) {
    const availability = await appointmentRepository.createAvailability(doctorUserId, startTime, endTime);

    return {
      success: true,
      message: 'Availability slot created',
      data: availability
    };
  }

  // Generate default slots for a date
  async generateDailySlots(doctorUserId, date) {
    const slots = await appointmentRepository.generateDailySlots(doctorUserId, date);

    return {
      success: true,
      message: `Generated ${slots.length} time slots`,
      data: { slots, count: slots.length }
    };
  }

  // Get availability by date
  async getAvailabilityByDate(doctorUserId, date) {
    const slots = await appointmentRepository.getAvailabilityByDate(doctorUserId, date);

    return {
      success: true,
      data: { slots, count: slots.length }
    };
  }

  // Toggle availability for a specific date (enable/disable)
  async toggleDateAvailability(doctorUserId, date, enable) {
    if (enable) {
      // Enable: generate default slots
      const slots = await appointmentRepository.generateDailySlots(doctorUserId, date);
      return {
        success: true,
        message: 'Availability enabled for this date',
        data: { slots, count: slots.length }
      };
    } else {
      // Disable: delete all unbooked slots
      const deleted = await appointmentRepository.deleteSlotsByDate(doctorUserId, date);
      return {
        success: true,
        message: 'Availability disabled for this date',
        data: { deletedSlots: deleted.length }
      };
    }
  }

  // Get calendar overview
  async getCalendarOverview(doctorUserId, startDate, endDate) {
    const overview = await appointmentRepository.getAvailabilityByDateRange(doctorUserId, startDate, endDate);

    return {
      success: true,
      data: { dates: overview, count: overview.length }
    };
  }

  async getMyAvailability(doctorUserId) {
    const slots = await appointmentRepository.getAvailabilityByDoctorId(doctorUserId);

    return {
      success: true,
      data: { slots, count: slots.length }
    };
  }

  async deleteAvailability(id, doctorUserId) {
    const deleted = await appointmentRepository.deleteAvailability(id, doctorUserId);
    if (!deleted) throw new Error('Availability slot not found');

    return {
      success: true,
      message: 'Availability slot deleted'
    };
  }

  // Appointments
  async bookAppointment(patientUserId, appointmentData) {
    // Mark slot as booked
    const slot = await appointmentRepository.markSlotAsBooked(appointmentData.availabilitySlotId);
    if (!slot) throw new Error('Availability slot not found or already booked');

    const appointment = await appointmentRepository.createAppointment({
      patientUserId,
      ...appointmentData
    });

    return {
      success: true,
      message: 'Appointment booked successfully',
      data: appointment
    };
  }

  async getMyAppointments(userId, role, status) {
    let appointments;
    
    if (role === 'patient') {
      appointments = await appointmentRepository.getAppointmentsByPatient(userId, status);
    } else if (role === 'doctor') {
      appointments = await appointmentRepository.getAppointmentsByDoctor(userId, status);
    } else {
      throw new Error('Invalid role');
    }

    return {
      success: true,
      data: { appointments, count: appointments.length }
    };
  }

  async getAppointmentDetails(id) {
    const appointment = await appointmentRepository.getAppointmentById(id);
    if (!appointment) throw new Error('Appointment not found');

    return {
      success: true,
      data: appointment
    };
  }

  async updateStatus(id, status, userId, role) {
    const appointment = await appointmentRepository.getAppointmentById(id);
    if (!appointment) throw new Error('Appointment not found');

    // Only doctor can change status
    if (role !== 'doctor' || appointment.doctorUserId !== userId) {
      throw new Error('Unauthorized');
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const updated = await appointmentRepository.updateAppointmentStatus(id, status);

    return {
      success: true,
      message: 'Appointment status updated',
      data: updated
    };
  }

  async cancelAppointment(id, userId, role) {
    const appointment = await appointmentRepository.getAppointmentById(id);
    if (!appointment) throw new Error('Appointment not found');

    // Patient or doctor can cancel
    const canCancel = (role === 'patient' && appointment.patientUserId === userId) ||
                      (role === 'doctor' && appointment.doctorUserId === userId);

    if (!canCancel) throw new Error('Unauthorized');

    const updated = await appointmentRepository.cancelAppointment(id);

    return {
      success: true,
      message: 'Appointment cancelled',
      data: updated
    };
  }

  // For patients to view doctor's available slots
  async getDoctorAvailableSlots(doctorUserId, date = null) {
    const slots = await appointmentRepository.getAvailableSlotsByDoctor(doctorUserId, date);

    return {
      success: true,
      data: { 
        doctorUserId,
        date: date || 'all upcoming',
        slots, 
        count: slots.length 
      }
    };
  }

  async getDoctorAvailableSlotsByDateRange(doctorUserId, startDate, endDate) {
    const slots = await appointmentRepository.getAvailableSlotsByDateRange(doctorUserId, startDate, endDate);

    return {
      success: true,
      data: { 
        doctorUserId,
        startDate,
        endDate,
        slots, 
        count: slots.length 
      }
    };
  }
}

module.exports = new AppointmentService();
