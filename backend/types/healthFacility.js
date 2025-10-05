// Health Facility Database Interface
export interface HealthFacilityDB {
  ogc_fid: number;              // Primary key
  geom?: string;                // Geometry data (MULTIPOLYGON)
  name?: string;                // Facility name
  name_en?: string;             // English name
  name_vi?: string;             // Vietnamese name
  amenity?: string;             // Type of amenity
  building?: string;            // Building type
  healthcare?: string;          // Healthcare type (hospital, clinic, etc.)
  healthca_1?: string;          // Additional healthcare info
  operator_t?: string;          // Operator type
  capacity_p?: number;          // Capacity
  addr_full?: string;           // Full address
  addr_city?: string;           // City
  source?: string;              // Data source
  osm_id?: string;              // OpenStreetMap ID
  osm_type?: string;            // OSM type (ways_poly, etc.)
}

// Response format for API
export interface HealthFacilityResponse {
  id: number;                   // ogc_fid as id
  name?: string;
  name_vi?: string;
  name_en?: string;
  amenity?: string;
  healthcare?: string;
  building?: string;
  addr_city?: string;
  addr_full?: string;
  operator?: string;            // operator_t as operator
  capacity?: number;            // capacity_p as capacity
  source?: string;
  osm_id?: string;
  osm_type?: string;
}

// For creating new facility (without auto-generated fields)
export interface CreateHealthFacilityInput {
  geom?: string;
  name?: string;
  name_en?: string;
  name_vi?: string;
  amenity?: string;
  building?: string;
  healthcare?: string;
  healthca_1?: string;
  operator_t?: string;
  capacity_p?: number;
  addr_full?: string;
  addr_city?: string;
  source?: string;
  osm_id?: string;
  osm_type?: string;
}

// For updating facility (all fields optional except id)
export interface UpdateHealthFacilityInput {
  ogc_fid: number;              // Required for update
  geom?: string;
  name?: string;
  name_en?: string;
  name_vi?: string;
  amenity?: string;
  building?: string;
  healthcare?: string;
  healthca_1?: string;
  operator_t?: string;
  capacity_p?: number;
  addr_full?: string;
  addr_city?: string;
  source?: string;
  osm_id?: string;
  osm_type?: string;
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

// Enum for healthcare types (based on sample data)
export enum HealthcareType {
  HOSPITAL = 'hospital',
  CLINIC = 'clinic',
  PHARMACY = 'pharmacy',
  DENTIST = 'dentist',
  DOCTOR = 'doctor'
}

// Enum for amenity types
export enum AmenityType {
  HOSPITAL = 'hospital',
  CLINIC = 'clinic',
  PHARMACY = 'pharmacy',
  DENTIST = 'dentist',
  DOCTORS = 'doctors'
}

// Enum for OSM types
export enum OSMType {
  WAYS_POLY = 'ways_poly',
  NODE = 'node',
  RELATION = 'relation'
}