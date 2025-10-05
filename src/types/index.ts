export interface HealthFacility {
  id: number;                   // ogc_fid
  name?: string | null;
  name_vi?: string | null;
  name_en?: string | null;
  amenity?: string | null;      // Can be from predefined values or custom
  healthcare?: string | null;   // Can be from predefined values or custom
  building?: string | null;     // Can be from predefined values or custom
  addr_city?: string | null;
  addr_full?: string | null;
  operator?: string | null;     // operator_t as operator
  capacity?: number | null;     // capacity_p as capacity
  source?: string | null;
  osm_id?: string | null;
  osm_type?: string | null;     // Can be from predefined values or custom
  geom?: string | null;         // Geometry data
}

export interface SearchParams {
  name?: string;
  healthcare?: string;
  city?: string;
  amenity?: string;
  building?: string;
  operator?: string;
  source?: string;
  page?: number;
  limit?: number;
}

export interface CreateFacilityInput {
  geom?: string | null;
  name?: string | null;
  name_en?: string | null;
  name_vi?: string | null;
  amenity?: string | null;      // Can be from predefined values or custom
  building?: string | null;     // Can be from predefined values or custom
  healthcare?: string | null;   // Can be from predefined values or custom
  healthca_1?: string | null;
  operator_t?: string | null;
  capacity_p?: number | null;
  addr_full?: string | null;
  addr_city?: string | null;
  source?: string | null;
  osm_id?: string | null;
  osm_type?: string | null;     // Can be from predefined values or custom
}

export interface UpdateFacilityInput extends Partial<CreateFacilityInput> {
  id: number;
}

// Predefined values (enums from backend)
export const HEALTHCARE_TYPES = [
  'alternative',
  'centre', 
  'clinic',
  'dentist',
  'doctor',
  'hospital',
  'laboratory',
  'pharmacy',
  'vaccination_centre',
  'yes'
] as const;

export const AMENITY_TYPES = [
  'clinic',
  'dentist', 
  'doctors',
  'hospital',
  'pharmacy',
  'veterinary'
] as const;

export const BUILDING_TYPES = [
  'clinic',
  'hospital',
  'house',
  'retail', 
  'university',
  'yes'
] as const;

export const OSM_TYPES = [
  'ways_poly',
  'node',
  'relation'
] as const;

export type HealthcareType = typeof HEALTHCARE_TYPES[number];
export type AmenityType = typeof AMENITY_TYPES[number];
export type BuildingType = typeof BUILDING_TYPES[number];
export type OSMType = typeof OSM_TYPES[number];

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}