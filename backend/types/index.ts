// Export all types from different modules
export * from './healthFacility';
export * from './common';

// Re-export commonly used types with aliases for convenience
export type {
  HealthFacilityDB as Facility,
  HealthFacilityResponse as FacilityResponse,
  CreateHealthFacilityInput as CreateFacility,
  UpdateHealthFacilityInput as UpdateFacility,
  SearchFacilityParams as SearchParams
} from './healthFacility';

export type {
  ApiResponseType as ApiResponse,
  SuccessResponse,
  ErrorResponse
} from './common';