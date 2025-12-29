import type { Email } from '../value-objects/Email';
import type { Phone } from '../value-objects/Phone';
import type { Incoterm } from '../value-objects/Incoterm';
import type { Quantity } from '../value-objects/Quantity';
import type { ProductSelection, PackagingOption } from './Product';

/**
 * RFQ (Request for Quote) status
 * Validates: Requirements 17.1-17.10
 */
export const RFQ_STATUSES = ['pending', 'reviewed', 'quoted', 'accepted', 'rejected', 'expired'] as const;

export type RFQStatus = (typeof RFQ_STATUSES)[number];

/**
 * Date range for delivery period
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * RFQ Request entity for B2B quote requests
 * Validates: Requirements 17.1-17.8
 */
export interface RFQRequest {
  id: string;
  companyName: string;
  contactPerson: string;
  email: Email;
  phone: Phone;
  country: string;
  products: ProductSelection[];
  quantity: Quantity;
  incoterm: Incoterm;
  destinationPort: string;
  packaging: PackagingOption;
  deliveryPeriod: DateRange;
  specialRequirements?: string;
  privacyConsent: boolean;
  submittedAt: Date;
  status: RFQStatus;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * RFQ form input data (before validation)
 * Validates: Requirements 17.1-17.8
 */
export interface RFQFormInput {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  country: string;
  products: string[];
  quantity: number;
  unit: 'kg' | 'tonnes' | 'containers';
  incoterm: string;
  destinationPort: string;
  packaging: string;
  deliveryStart: Date;
  deliveryEnd: Date;
  specialRequirements?: string;
  privacyConsent: boolean;
}

/**
 * Validates if a string is a valid RFQ status
 */
export function isValidRFQStatus(value: string): value is RFQStatus {
  return RFQ_STATUSES.includes(value as RFQStatus);
}

/**
 * Validates that delivery period end is after start
 * Validates: Requirements 17.7
 */
export function isValidDeliveryPeriod(period: DateRange): boolean {
  return period.end > period.start;
}

/**
 * Creates a DateRange from start and end dates
 */
export function createDateRange(start: Date, end: Date): DateRange | null {
  if (end <= start) {
    return null;
  }
  return { start, end };
}
