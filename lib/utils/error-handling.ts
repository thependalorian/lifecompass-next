// lib/utils/error-handling.ts
// Comprehensive error handling utilities
// Purpose: Centralized error handling patterns for production use

export interface ErrorContext {
  operation: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  timestamp?: Date;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public context?: ErrorContext,
    public isRetryable: boolean = false,
  ) {
    super(message);
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context?: ErrorContext, isRetryable: boolean = true) {
    super(message, "DATABASE_ERROR", 500, context, isRetryable);
    this.name = "DatabaseError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "VALIDATION_ERROR", 400, context, false);
    this.name = "ValidationError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "RATE_LIMIT_ERROR", 429, context, false);
    this.name = "RateLimitError";
  }
}

export class TimeoutError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, "TIMEOUT_ERROR", 504, context, true);
    this.name = "TimeoutError";
  }
}

/**
 * Wrap an async operation with timeout
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  errorMessage: string = "Operation timed out",
): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new TimeoutError(errorMessage)), timeoutMs),
    ),
  ]);
}

/**
 * Safely execute an async operation with comprehensive error handling
 */
export async function safeExecute<T>(
  operation: () => Promise<T>,
  context: ErrorContext,
  fallback?: T,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const appError = normalizeError(error, context);
    console.error(`[${context.operation}] Error:`, {
      message: appError.message,
      code: appError.code,
      context,
      stack: appError.stack,
    });

    if (fallback !== undefined) {
      return fallback;
    }

    throw appError;
  }
}

/**
 * Normalize various error types to AppError
 */
export function normalizeError(error: unknown, context?: ErrorContext): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes("timeout") || error.message.includes("TIMEOUT")) {
      return new TimeoutError(error.message, context);
    }

    if (error.message.includes("rate limit") || error.message.includes("429")) {
      return new RateLimitError(error.message, context);
    }

    if (
      error.message.includes("validation") ||
      error.message.includes("invalid") ||
      error.message.includes("400")
    ) {
      return new ValidationError(error.message, context);
    }

    // Database-related errors
    if (
      error.message.includes("database") ||
      error.message.includes("connection") ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("ENOTFOUND")
    ) {
      return new DatabaseError(error.message, context, true);
    }

    return new AppError(error.message, "UNKNOWN_ERROR", 500, context, false);
  }

  return new AppError(
    String(error),
    "UNKNOWN_ERROR",
    500,
    context,
    false,
  );
}

/**
 * Validate required fields in an object
 */
export function validateRequired<T extends Record<string, unknown>>(
  obj: T,
  fields: Array<keyof T>,
  context?: ErrorContext,
): void {
  const missing = fields.filter((field) => {
    const value = obj[field];
    return value === undefined || value === null || value === "";
  });

  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(", ")}`,
      context,
    );
  }
}

/**
 * Validate string length
 */
export function validateLength(
  value: string,
  min: number,
  max: number,
  fieldName: string = "value",
  context?: ErrorContext,
): void {
  if (value.length < min) {
    throw new ValidationError(
      `${fieldName} must be at least ${min} characters`,
      context,
    );
  }

  if (value.length > max) {
    throw new ValidationError(
      `${fieldName} must be at most ${max} characters`,
      context,
    );
  }
}

/**
 * Validate UUID format
 */
export function validateUUID(
  value: string,
  fieldName: string = "id",
  context?: ErrorContext,
): void {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(value)) {
    throw new ValidationError(`Invalid UUID format for ${fieldName}`, context);
  }
}

/**
 * Sanitize error message for client (remove sensitive info)
 */
export function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    // For known errors, return user-friendly message
    if (error instanceof ValidationError || error instanceof RateLimitError) {
      return error.message;
    }

    // For other errors, return generic message
    return "An error occurred. Please try again.";
  }

  if (error instanceof Error) {
    // Don't expose internal error details
    return "An error occurred. Please try again.";
  }

  return "An unexpected error occurred.";
}

