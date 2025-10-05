import { 
  HEALTHCARE_TYPES, 
  AMENITY_TYPES, 
  BUILDING_TYPES, 
  OSM_TYPES,
  type HealthcareType,
  type AmenityType,
  type BuildingType,
  type OSMType,
  type CreateFacilityInput 
} from '../types';

// Type guards
export const isValidHealthcareType = (value: string): value is HealthcareType => {
  return HEALTHCARE_TYPES.includes(value as HealthcareType);
};

export const isValidAmenityType = (value: string): value is AmenityType => {
  return AMENITY_TYPES.includes(value as AmenityType);
};

export const isValidBuildingType = (value: string): value is BuildingType => {
  return BUILDING_TYPES.includes(value as BuildingType);
};

export const isValidOSMType = (value: string): value is OSMType => {
  return OSM_TYPES.includes(value as OSMType);
};

// Get all possible values
export const getAllHealthcareTypes = (): readonly string[] => HEALTHCARE_TYPES;
export const getAllAmenityTypes = (): readonly string[] => AMENITY_TYPES;
export const getAllBuildingTypes = (): readonly string[] => BUILDING_TYPES;
export const getAllOSMTypes = (): readonly string[] => OSM_TYPES;

// Validation function
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateFacilityData = (data: Partial<CreateFacilityInput>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for at least one name field
  if (!data.name && !data.name_vi && !data.name_en) {
    errors.push('At least one name field (name, name_vi, or name_en) is required');
  }

  // Validate capacity
  if (data.capacity_p !== undefined && data.capacity_p !== null && data.capacity_p < 0) {
    errors.push('Capacity must be a non-negative number');
  }

  // Check for non-standard values (warnings, not errors)
  if (data.healthcare && !isValidHealthcareType(data.healthcare)) {
    warnings.push(`Custom healthcare type: "${data.healthcare}" (not in predefined list)`);
  }

  if (data.amenity && !isValidAmenityType(data.amenity)) {
    warnings.push(`Custom amenity type: "${data.amenity}" (not in predefined list)`);
  }

  if (data.building && !isValidBuildingType(data.building)) {
    warnings.push(`Custom building type: "${data.building}" (not in predefined list)`);
  }

  if (data.osm_type && !isValidOSMType(data.osm_type)) {
    warnings.push(`Custom OSM type: "${data.osm_type}" (not in predefined list)`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Helper functions for form dropdowns
export const getHealthcareTypeOptions = () => {
  return HEALTHCARE_TYPES.map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')
  }));
};

export const getAmenityTypeOptions = () => {
  return AMENITY_TYPES.map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1)
  }));
};

export const getBuildingTypeOptions = () => {
  return BUILDING_TYPES.map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1)
  }));
};

// Format display values
export const formatHealthcareType = (type: string | null): string => {
  if (!type) return 'N/A';
  return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
};

export const formatFacilityName = (facility: { name?: string | null; name_vi?: string | null; name_en?: string | null }): string => {
  return facility.name_vi || facility.name || facility.name_en || 'Unnamed Facility';
};