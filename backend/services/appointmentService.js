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
}

module.exports = new AppointmentService();
