// Common types for the backend

// Database connection configuration
export interface DatabaseConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
}

// Environment variables interface
export interface EnvironmentConfig {
  PORT: number;
  NODE_ENV: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  JWT_SECRET?: string;
}

// Request with pagination
export interface PaginatedRequest {
  page?: string;
  limit?: string;
  offset?: string;
}

// Standard error response
export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
  details?: any;
}

// Success response
export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

// Response type union
export type ApiResponseType<T = any> = SuccessResponse<T> | ErrorResponse;

// HTTP Status Codes enum
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503
}

// Request methods
export enum RequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// Validation error interface
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Bulk operation result
export interface BulkOperationResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    index: number;
    error: string;
  }>;
}