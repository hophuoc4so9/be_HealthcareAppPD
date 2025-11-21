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
}

export const apiService = new ApiService();
export default apiService;