// Health Facility Database Interface
export interface HealthFacilityDB {
  ogc_fid: number;              // Primary key
  geom?: string | null;         // Geometry data (MULTIPOLYGON)
  name?: string | null;         // Facility name
  name_en?: string | null;      // English name
  name_vi?: string | null;      // Vietnamese name
  amenity?: string | null;      // Type of amenity (can be from AmenityType enum or other values)
  building?: string | null;     // Building type (can be from BuildingType enum or other values)
  healthcare?: string | null;   // Healthcare type (can be from HealthcareType enum or other values)
  healthca_1?: string | null;   // Additional healthcare info
  operator_t?: string | null;   // Operator type
  capacity_p?: number | null;   // Capacity
  addr_full?: string | null;    // Full address
  addr_city?: string | null;    // City
  source?: string | null;       // Data source
  osm_id?: string | null;       // OpenStreetMap ID
  osm_type?: string | null;     // OSM type (can be from OSMType enum or other values)
}

// Coordinate interface for geometry
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Response format for API
export interface HealthFacilityResponse {
  id: number;                   // ogc_fid as id
  name?: string | null;
  name_vi?: string | null;
  name_en?: string | null;
  amenity?: string | null;      // Can be from AmenityType enum or other values
  healthcare?: string | null;   // Can be from HealthcareType enum or other values
  building?: string | null;     // Can be from BuildingType enum or other values
  addr_city?: string | null;
  addr_full?: string | null;
  operator?: string | null;     // operator_t as operator
  capacity?: number | null;     // capacity_p as capacity
  source?: string | null;
  osm_id?: string | null;
  osm_type?: string | null;     // Can be from OSMType enum or other values
  coordinates?: Coordinates | null;    // Extracted from geom
  geom?: string | null;         // Raw geometry data if needed
}

// For creating new facility (without auto-generated fields)
export interface CreateHealthFacilityInput {
  geom?: string | null;
  name?: string | null;
  name_en?: string | null;
  name_vi?: string | null;
  amenity?: string | null;      // Can be from AmenityType enum or other values
  building?: string | null;     // Can be from BuildingType enum or other values
  healthcare?: string | null;   // Can be from HealthcareType enum or other values
  healthca_1?: string | null;
  operator_t?: string | null;
  capacity_p?: number | null;
  addr_full?: string | null;
  addr_city?: string | null;
  source?: string | null;
  osm_id?: string | null;
  osm_type?: string | null;     // Can be from OSMType enum or other values
}

// For updating facility (all fields optional except id)
export interface UpdateHealthFacilityInput {
  ogc_fid: number;              // Required for update
  geom?: string | null;
  name?: string | null;
  name_en?: string | null;
  name_vi?: string | null;
  amenity?: string | null;      // Can be from AmenityType enum or other values
  building?: string | null;     // Can be from BuildingType enum or other values
  healthcare?: string | null;   // Can be from HealthcareType enum or other values
  healthca_1?: string | null;
  operator_t?: string | null;
  capacity_p?: number | null;
  addr_full?: string | null;
  addr_city?: string | null;
  source?: string | null;
  osm_id?: string | null;
  osm_type?: string | null;     // Can be from OSMType enum or other values
}

// Search parameters
export interface SearchFacilityParams {
  name?: string;
  healthcare?: string;
  city?: string;
  amenity?: string;
  building?: string;
  operator?: string;
  source?: string;
  limit?: number;
  offset?: number;
}

// Pagination interface
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Database query result interface
export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
  command: string;
}

// Enum for healthcare types (based on actual database values)
export enum HealthcareType {
  ALTERNATIVE = 'alternative',
  CENTRE = 'centre',
  CLINIC = 'clinic',
  DENTIST = 'dentist',
  DOCTOR = 'doctor',
  HOSPITAL = 'hospital',
  LABORATORY = 'laboratory',
  PHARMACY = 'pharmacy',
  VACCINATION_CENTRE = 'vaccination_centre',
  YES = 'yes'
}

// Enum for amenity types (based on actual database values)
export enum AmenityType {
  CLINIC = 'clinic',
  DENTIST = 'dentist',
  DOCTORS = 'doctors',
  HOSPITAL = 'hospital',
  PHARMACY = 'pharmacy',
  VETERINARY = 'veterinary'
}

// Enum for building types (based on actual database values)
export enum BuildingType {
  CLINIC = 'clinic',
  HOSPITAL = 'hospital',
  HOUSE = 'house',
  RETAIL = 'retail',
  UNIVERSITY = 'university',
  YES = 'yes'
}

// Enum for OSM types
export enum OSMType {
  WAYS_POLY = 'ways_poly',
  NODE = 'node',
  RELATION = 'relation'
}

// Utility functions for enum validation
export const isValidHealthcareType = (value: string): value is HealthcareType => {
  return Object.values(HealthcareType).includes(value as HealthcareType);
};

export const isValidAmenityType = (value: string): value is AmenityType => {
  return Object.values(AmenityType).includes(value as AmenityType);
};

export const isValidBuildingType = (value: string): value is BuildingType => {
  return Object.values(BuildingType).includes(value as BuildingType);
};

export const isValidOSMType = (value: string): value is OSMType => {
  return Object.values(OSMType).includes(value as OSMType);
};

// Get all possible values for each field (including enums and custom values)
export const getAllHealthcareTypes = (): string[] => {
  return Object.values(HealthcareType);
};

export const getAllAmenityTypes = (): string[] => {
  return Object.values(AmenityType);
};

export const getAllBuildingTypes = (): string[] => {
  return Object.values(BuildingType);
};

export const getAllOSMTypes = (): string[] => {
  return Object.values(OSMType);
};

// Validation helper for facility data
export const validateFacilityData = (data: Partial<CreateHealthFacilityInput>): string[] => {
  const errors: string[] = [];

  // Validate healthcare type if provided
  if (data.healthcare && !isValidHealthcareType(data.healthcare)) {
    // Not an error, just a note that it's a custom value
    console.log(`Custom healthcare type: ${data.healthcare}`);
  }

  // Validate amenity type if provided
  if (data.amenity && !isValidAmenityType(data.amenity)) {
    console.log(`Custom amenity type: ${data.amenity}`);
  }

  // Validate building type if provided
  if (data.building && !isValidBuildingType(data.building)) {
    console.log(`Custom building type: ${data.building}`);
  }

  // Validate capacity if provided
  if (data.capacity_p !== undefined && data.capacity_p !== null && data.capacity_p < 0) {
    errors.push('Capacity must be a non-negative number');
  }

  // Validate required fields for creation (if this is a create operation)
  if (!data.name && !data.name_vi && !data.name_en) {
    errors.push('At least one name field (name, name_vi, or name_en) is required');
  }

  return errors;
};