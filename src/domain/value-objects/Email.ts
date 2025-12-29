import { Result, ValidationError } from './Result';

/**
 * Email value object with validation
 * Validates: Requirements 5.1, 5.2, 17.1
 */
export class Email {
  private readonly value: string;

  private constructor(email: string) {
    this.value = email;
  }

  /**
   * Creates an Email value object with validation
   * @param email - The email string to validate
   * @returns Result with Email on success, ValidationError on failure
   */
  static create(email: string): Result<Email, ValidationError> {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      return Result.fail(new ValidationError('Email is required'));
    }

    // RFC 5322 simplified regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return Result.fail(new ValidationError('Invalid email format'));
    }

    return Result.ok(new Email(trimmed));
  }

  /**
   * Returns the email string value
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Checks equality with another Email
   */
  equals(other: Email): boolean {
    return this.value === other.value;
  }

  /**
   * Returns string representation
   */
  toString(): string {
    return this.value;
  }
}
