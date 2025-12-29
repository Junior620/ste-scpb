import { Result, ValidationError } from './Result';

/**
 * Phone value object with regex validation
 * Validates: Requirements 5.1, 17.1
 * Supports international formats with optional + prefix
 */
export class Phone {
  private readonly value: string;

  private constructor(phone: string) {
    this.value = phone;
  }

  /**
   * Creates a Phone value object with validation
   * Accepts formats: +237 123 456 789, 237-123-456-789, 123456789, etc.
   * @param phone - The phone string to validate
   * @returns Result with Phone on success, ValidationError on failure
   */
  static create(phone: string): Result<Phone, ValidationError> {
    const trimmed = phone.trim();

    if (!trimmed) {
      return Result.fail(new ValidationError('Phone number is required'));
    }

    // Regex: optional +, then 8-20 digits with optional spaces/dashes
    const phoneRegex = /^\+?[0-9\s-]{8,20}$/;
    if (!phoneRegex.test(trimmed)) {
      return Result.fail(
        new ValidationError('Invalid phone number format (8-20 digits, optional + prefix)')
      );
    }

    // Normalize: remove spaces and dashes for storage
    const normalized = trimmed.replace(/[\s-]/g, '');

    return Result.ok(new Phone(normalized));
  }

  /**
   * Returns the normalized phone string value
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Returns formatted phone for display
   */
  getFormatted(): string {
    // Simple formatting: add spaces every 3 digits after country code
    if (this.value.startsWith('+')) {
      const countryCode = this.value.slice(0, 4);
      const rest = this.value.slice(4);
      return `${countryCode} ${rest.match(/.{1,3}/g)?.join(' ') || rest}`;
    }
    return this.value.match(/.{1,3}/g)?.join(' ') || this.value;
  }

  /**
   * Checks equality with another Phone
   */
  equals(other: Phone): boolean {
    return this.value === other.value;
  }

  /**
   * Returns string representation
   */
  toString(): string {
    return this.value;
  }
}
