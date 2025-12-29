import { Result, ValidationError } from './Result';

/**
 * Quantity units for B2B commodity trading
 * Validates: Requirements 17.3
 */
export const QUANTITY_UNITS = ['kg', 'tonnes', 'containers'] as const;
export type QuantityUnit = (typeof QUANTITY_UNITS)[number];

/**
 * Conversion factors to kilograms (base unit)
 */
const CONVERSION_TO_KG: Record<QuantityUnit, number> = {
  kg: 1,
  tonnes: 1000,
  containers: 20000, // Standard 20ft container ~20 tonnes
};

/**
 * Quantity value object with unit conversion
 * Validates: Requirements 17.3
 */
export class Quantity {
  private readonly amount: number;
  private readonly unit: QuantityUnit;

  private constructor(amount: number, unit: QuantityUnit) {
    this.amount = amount;
    this.unit = unit;
  }

  /**
   * Creates a Quantity value object with validation
   * @param amount - The numeric amount
   * @param unit - The unit of measurement
   * @returns Result with Quantity on success, ValidationError on failure
   */
  static create(amount: number, unit: QuantityUnit): Result<Quantity, ValidationError> {
    if (!Number.isFinite(amount)) {
      return Result.fail(new ValidationError('Amount must be a valid number'));
    }

    if (amount <= 0) {
      return Result.fail(new ValidationError('Amount must be positive'));
    }

    if (!QUANTITY_UNITS.includes(unit)) {
      return Result.fail(new ValidationError(`Invalid unit. Must be one of: ${QUANTITY_UNITS.join(', ')}`));
    }

    return Result.ok(new Quantity(amount, unit));
  }

  /**
   * Returns the amount
   */
  getAmount(): number {
    return this.amount;
  }

  /**
   * Returns the unit
   */
  getUnit(): QuantityUnit {
    return this.unit;
  }

  /**
   * Converts to kilograms
   */
  toKg(): number {
    return this.amount * CONVERSION_TO_KG[this.unit];
  }

  /**
   * Converts to tonnes
   */
  toTonnes(): number {
    return this.toKg() / CONVERSION_TO_KG.tonnes;
  }

  /**
   * Converts to a different unit
   */
  convertTo(targetUnit: QuantityUnit): Quantity {
    const inKg = this.toKg();
    const converted = inKg / CONVERSION_TO_KG[targetUnit];
    return new Quantity(converted, targetUnit);
  }

  /**
   * Returns formatted string for display
   */
  getFormatted(): string {
    const formatted = this.amount.toLocaleString('fr-FR', {
      maximumFractionDigits: 2,
    });
    return `${formatted} ${this.unit}`;
  }

  /**
   * Checks equality with another Quantity (compares in kg)
   */
  equals(other: Quantity): boolean {
    return Math.abs(this.toKg() - other.toKg()) < 0.001;
  }

  /**
   * Returns string representation
   */
  toString(): string {
    return `${this.amount} ${this.unit}`;
  }
}

/**
 * Validates if a string is a valid quantity unit
 */
export function isValidQuantityUnit(value: string): value is QuantityUnit {
  return QUANTITY_UNITS.includes(value as QuantityUnit);
}
