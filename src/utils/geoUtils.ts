// Geographic utilities for healthcare facilities

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface FacilityWithDistance {
  id: number;
  name: string;
  name_vi?: string;
  amenity?: string;
  healthcare?: string;
  building?: string;
  addr_city?: string;
  addr_full?: string;
  operator?: string;
  distance_meters?: number;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param point1 First coordinate
 * @param point2 Second coordinate
 * @returns Distance in meters
 */
export function calculateDistance(point1: Coordinate, point2: Coordinate): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

/**
 * Get user's current location
 * @returns Promise with coordinates
 */
export function getCurrentLocation(): Promise<Coordinate> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
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

/**
 * Create a polygon from a center point and radius
 * @param center Center coordinate
 * @param radius Radius in meters
 * @param points Number of points to create the polygon (default: 16)
 * @returns Array of coordinates forming a circle polygon
 */
export function createCirclePolygon(
  center: Coordinate,
  radius: number,
  points: number = 16
): [number, number][] {
  const coordinates: [number, number][] = [];
  const earthRadius = 6371000; // Earth's radius in meters

  for (let i = 0; i < points; i++) {
    const angle = (2 * Math.PI * i) / points;
    
    // Calculate the offset in degrees
    const latOffset = (radius / earthRadius) * (180 / Math.PI);
    const lngOffset = (radius / earthRadius) * (180 / Math.PI) / Math.cos(center.lat * Math.PI / 180);
    
    const lat = center.lat + latOffset * Math.cos(angle);
    const lng = center.lng + lngOffset * Math.sin(angle);
    
    coordinates.push([lng, lat]);
  }
  
  return coordinates;
}

/**
 * Check if a point is within a polygon
 * @param point Point to check
 * @param polygon Array of coordinates defining the polygon
 * @returns True if point is inside polygon
 */
export function isPointInPolygon(point: Coordinate, polygon: [number, number][]): boolean {
  const x = point.lng;
  const y = point.lat;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Get facility type in Vietnamese
 * @param amenity Amenity type
 * @param healthcare Healthcare type
 * @returns Vietnamese name
 */
export function getFacilityTypeVi(amenity?: string, healthcare?: string): string {
  const type = amenity?.toLowerCase() || healthcare?.toLowerCase() || '';
  
  switch (type) {
    case 'pharmacy':
      return 'Nhà thuốc';
    case 'hospital':
      return 'Bệnh viện';
    case 'clinic':
      return 'Phòng khám';
    case 'dentist':
      return 'Nha khoa';
    case 'doctors':
    case 'doctor':
      return 'Bác sĩ';
    case 'laboratory':
      return 'Xét nghiệm';
    case 'physiotherapy':
      return 'Vật lý trị liệu';
    case 'ambulance_station':
      return 'Trạm cứu thương';
    default:
      return 'Cơ sở y tế';
  }
}

/**
 * Get facility type icon
 * @param amenity Amenity type
 * @param healthcare Healthcare type
 * @returns Icon name or emoji
 */
export function getFacilityIcon(amenity?: string, healthcare?: string): string {
  const type = amenity?.toLowerCase() || healthcare?.toLowerCase() || '';
  
  switch (type) {
    case 'pharmacy':
      return '💊';
    case 'hospital':
      return '🏥';
    case 'clinic':
      return '🏥';
    case 'dentist':
      return '🦷';
    case 'doctors':
    case 'doctor':
      return '👨‍⚕️';
    case 'laboratory':
      return '🔬';
    case 'physiotherapy':
      return '🤸';
    case 'ambulance_station':
      return '🚑';
    default:
      return '⚕️';
  }
}

/**
 * Sort facilities by distance
 * @param facilities Array of facilities with distance
 * @returns Sorted array
 */
export function sortByDistance(facilities: FacilityWithDistance[]): FacilityWithDistance[] {
  return facilities.sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0));
}

/**
 * Filter facilities by type
 * @param facilities Array of facilities
 * @param type Type to filter by
 * @returns Filtered array
 */
export function filterByType(
  facilities: FacilityWithDistance[],
  type: 'pharmacy' | 'hospital' | 'clinic' | 'dentist' | 'doctor'
): FacilityWithDistance[] {
  return facilities.filter(facility => {
    const amenity = facility.amenity?.toLowerCase();
    const healthcare = facility.healthcare?.toLowerCase();
    
    switch (type) {
      case 'pharmacy':
        return amenity === 'pharmacy' || healthcare === 'pharmacy';
      case 'hospital':
        return amenity === 'hospital' || healthcare === 'hospital';
      case 'clinic':
        return amenity === 'clinic' || healthcare === 'clinic';
      case 'dentist':
        return amenity === 'dentist' || healthcare === 'dentist';
      case 'doctor':
        return amenity === 'doctors' || healthcare === 'doctor';
      default:
        return true;
    }
  });
}

/**
 * Group facilities by city
 * @param facilities Array of facilities
 * @returns Object with cities as keys
 */
export function groupByCity(facilities: FacilityWithDistance[]): Record<string, FacilityWithDistance[]> {
  return facilities.reduce((groups, facility) => {
    const city = facility.addr_city || 'Unknown';
    if (!groups[city]) {
      groups[city] = [];
    }
    groups[city].push(facility);
    return groups;
  }, {} as Record<string, FacilityWithDistance[]>);
}

export default {
  calculateDistance,
  formatDistance,
  getCurrentLocation,
  createCirclePolygon,
  isPointInPolygon,
  getFacilityTypeVi,
  getFacilityIcon,
  sortByDistance,
  filterByType,
  groupByCity,
};