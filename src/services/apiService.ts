const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://be-healthcareapppd.onrender.com/api';

interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
      is_active: boolean;
    };
    token: string;
  };
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw { response: { data: error } };
    }

    return response.json();
  }

  async post(endpoint: string, data: any): Promise<any> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw { response: { data: error } };
    }

    return response.json();
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Facility endpoints
  async getAllFacilities(params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const queryString = searchParams.toString();
    return this.request(`/facilities${queryString ? `?${queryString}` : ''}`);
  }

  async getFacilityById(id: string | number) {
    return this.request(`/facilities/${id}`);
  }

  async createFacility(facilityData: any) {
    return this.request('/facilities', {
      method: 'POST',
      body: JSON.stringify(facilityData),
    });
  }

  async updateFacility(id: string | number, facilityData: any) {
    return this.request(`/facilities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(facilityData),
    });
  }

  async deleteFacility(id: string | number) {
    return this.request(`/facilities/${id}`, {
      method: 'DELETE',
    });
  }

  async searchFacilities(params: { 
    name?: string; 
    healthcare?: string; 
    city?: string;
    amenity?: string;
    building?: string;
    operator?: string;
    source?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value.toString());
    });
    
    const queryString = searchParams.toString();
    return this.request(`/facilities/search${queryString ? `?${queryString}` : ''}`);
  }

  // New geographic-based endpoints
  async getNearestFacilities(params: {
    lat: number;
    lng: number;
    radius?: number;
    limit?: number;
    type?: 'pharmacy' | 'hospital' | 'clinic' | 'dentist' | 'doctor';
  }) {
    const searchParams = new URLSearchParams();
    searchParams.append('lat', params.lat.toString());
    searchParams.append('lng', params.lng.toString());
    if (params.radius) searchParams.append('radius', params.radius.toString());
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.type) searchParams.append('type', params.type);
    
    return this.request(`/facilities/nearest?${searchParams.toString()}`);
  }

  async getFacilitiesByType(
    type: 'pharmacy' | 'hospital' | 'clinic' | 'dentist' | 'doctor',
    params?: {
      page?: number;
      limit?: number;
      city?: string;
      operator?: string;
    }
  ) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.city) searchParams.append('city', params.city);
    if (params?.operator) searchParams.append('operator', params.operator);
    
    const queryString = searchParams.toString();
    return this.request(`/facilities/type/${type}${queryString ? `?${queryString}` : ''}`);
  }

  async getFacilitiesInArea(params: {
    polygon: [number, number][]; // Array of [lng, lat] coordinates
    type?: 'pharmacy' | 'hospital' | 'clinic' | 'dentist' | 'doctor';
    limit?: number;
  }) {
    return this.request('/facilities/in-area', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getFacilityStats(city?: string) {
    const searchParams = new URLSearchParams();
    if (city) searchParams.append('city', city);
    
    const queryString = searchParams.toString();
    return this.request(`/facilities/stats${queryString ? `?${queryString}` : ''}`);
  }

  // Utility methods for location-based services
  async getUserLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  // Find nearest pharmacies (convenience method)
  async findNearestPharmacies(lat: number, lng: number, radius = 2000, limit = 5) {
    return this.getNearestFacilities({
      lat,
      lng,
      radius,
      limit,
      type: 'pharmacy',
    });
  }

  // Find nearest hospitals (convenience method)
  async findNearestHospitals(lat: number, lng: number, radius = 10000, limit = 3) {
    return this.getNearestFacilities({
      lat,
      lng,
      radius,
      limit,
      type: 'hospital',
    });
  }

  // Doctor endpoints
  async getDoctorProfile(token: string) {
    return this.request('/doctors/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async updateDoctorProfile(token: string, profileData: any) {
    return this.request('/doctors/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  }

  async getDoctorDashboardStats(token: string) {
    return this.request('/doctors/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getDoctorPatients(token: string, limit = 20) {
    return this.request(`/doctors/patients?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getPatientDetail(token: string, patientId: string) {
    return this.request(`/doctors/patients/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getPatientAppointments(token: string, patientId: string) {
    return this.request(`/doctors/patients/${patientId}/appointments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getPatientHealthMetrics(token: string, patientId: string) {
    return this.request(`/doctors/patients/${patientId}/health-metrics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getDoctorAppointments(token: string, status?: string) {
    const queryString = status ? `?status=${status}` : '';
    return this.request(`/appointments${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getAllDoctors(params?: { page?: number; limit?: number; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    
    const queryString = searchParams.toString();
    return this.request(`/doctors${queryString ? `?${queryString}` : ''}`);
  }

  async searchDoctorsBySpecialization(specialization: string, limit = 20) {
    return this.request(`/doctors/search?q=${encodeURIComponent(specialization)}&limit=${limit}`);
  }

  // Appointment endpoints
  async getAppointmentDetails(token: string, appointmentId: string) {
    return this.request(`/appointments/${appointmentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async updateAppointmentStatus(token: string, appointmentId: string, status: string) {
    return this.request(`/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
  }

  async cancelAppointment(token: string, appointmentId: string) {
    return this.request(`/appointments/${appointmentId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Doctor availability endpoints
  async createAvailability(token: string, availabilityData: { startTime: string; endTime: string }) {
    return this.request('/appointments/availability', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(availabilityData),
    });
  }

  async getDoctorAvailability(token: string) {
    return this.request('/appointments/availability', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async deleteAvailability(token: string, availabilityId: string) {
    return this.request(`/appointments/availability/${availabilityId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async generateDailySlots(token: string, date: string) {
    return this.request('/appointments/availability/generate-daily', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ date }),
    });
  }

  async getAvailabilityByDate(token: string, date: string) {
    return this.request(`/appointments/availability/by-date?date=${date}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async toggleDateAvailability(token: string, date: string, enable: boolean) {
    return this.request('/appointments/availability/toggle-date', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ date, enable }),
    });
  }

  async getCalendarOverview(token: string, startDate: string, endDate: string) {
    return this.request(`/appointments/availability/calendar?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getDoctorAvailableSlots(doctorUserId: string, date?: string) {
    const queryString = date ? `?date=${date}` : '';
    return this.request(`/appointments/doctors/${doctorUserId}/available-slots${queryString}`);
  }

  async getDoctorAvailableSlotsByDateRange(doctorUserId: string, startDate: string, endDate: string) {
    return this.request(`/appointments/doctors/${doctorUserId}/available-slots/range?startDate=${startDate}&endDate=${endDate}`);
  }

  // Chat endpoints
  async getMyConversations(token: string) {
    return this.request('/chat/conversations', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getConversationDetails(token: string, conversationId: string) {
    return this.request(`/chat/conversations/${conversationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async getConversationMessages(token: string, conversationId: string) {
    return this.request(`/chat/conversations/${conversationId}/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async sendMessage(token: string, conversationId: string, messageContent: string) {
    return this.request(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ messageContent }),
    });
  }

  async createConversation(token: string, withUserId: string) {
    return this.request('/chat/conversations/start', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ withUserId }),
    });
  }

  async markMessageAsRead(token: string, messageId: string) {
    return this.request(`/chat/messages/${messageId}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Reminders endpoints
  async getPatientReminders(token: string, patientId: string) {
    return this.request(`/reminders/patient/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async createReminderForPatient(token: string, patientId: string, reminderData: any) {
    return this.request(`/reminders/patient/${patientId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reminderData),
    });
  }

  async updateReminder(token: string, reminderId: string, reminderData: any) {
    return this.request(`/reminders/${reminderId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reminderData),
    });
  }

  async deleteReminder(token: string, reminderId: string) {
    return this.request(`/reminders/${reminderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Health metrics/vitals endpoints
  async getPatientVitals(token: string, patientId: string) {
    return this.request(`/patients/${patientId}/vitals`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  async addPatientVital(token: string, patientId: string, vitalData: any) {
    return this.request(`/patients/${patientId}/vitals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(vitalData),
    });
  }

  async getPatientMetrics(token: string, patientId: string, metricType?: string) {
    const query = metricType ? `?type=${metricType}` : '';
    return this.request(`/patients/${patientId}/metrics${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

export const apiService = new ApiService();
export default apiService;