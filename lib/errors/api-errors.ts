export class ApiError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'AuthorizationError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ExternalServiceError extends ApiError {
  constructor(message: string, public service: string) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR');
    this.name = 'ExternalServiceError';
  }
}

export class LlamaCloudConnectionError extends ExternalServiceError {
  constructor(message: string = 'LlamaCloud connection failed') {
    super(message, 'LlamaCloud');
    this.name = 'LlamaCloudConnectionError';
  }
}

/**
 * Error thrown when AI service operations fail
 */
export class AIServiceError extends ApiError {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode, 'AI_SERVICE_ERROR');
  }
}

/**
 * Error thrown when database operations fail
 */
export class DatabaseError extends ApiError {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode, 'DATABASE_ERROR');
  }
}

/**
 * Configuration-related errors
 */
export class ConfigurationError extends ApiError {
  constructor(message: string) {
    super(message, 500, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
} 