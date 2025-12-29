/**
 * Result type for handling success/failure without exceptions
 * Used by value objects for validation results
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export type Result<T, E = ValidationError> =
  | { success: true; value: T }
  | { success: false; error: E };

export const Result = {
  ok<T>(value: T): Result<T, never> {
    return { success: true, value };
  },
  fail<E>(error: E): Result<never, E> {
    return { success: false, error };
  },
};
