import type { Email } from '../value-objects/Email';
import type { Phone } from '../value-objects/Phone';

/**
 * Inquiry types for contact form
 * Validates: Requirements 5.1
 */
export const INQUIRY_TYPES = ['purchase', 'partnership', 'recruitment', 'other'] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number];

/**
 * Contact submission status
 */
export const CONTACT_STATUSES = ['pending', 'processed', 'archived'] as const;

export type ContactStatus = (typeof CONTACT_STATUSES)[number];

/**
 * Contact entity for contact form submissions
 * Validates: Requirements 5.1, 5.2
 */
export interface Contact {
  id: string;
  name: string;
  email: Email;
  phone?: Phone;
  company?: string;
  inquiryType: InquiryType;
  message: string;
  privacyConsent: boolean;
  submittedAt: Date;
  status: ContactStatus;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Contact form input data (before validation)
 */
export interface ContactFormInput {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  inquiryType: InquiryType;
  message: string;
  privacyConsent: boolean;
}

/**
 * Validates if a string is a valid inquiry type
 */
export function isValidInquiryType(value: string): value is InquiryType {
  return INQUIRY_TYPES.includes(value as InquiryType);
}

/**
 * Validates if a string is a valid contact status
 */
export function isValidContactStatus(value: string): value is ContactStatus {
  return CONTACT_STATUSES.includes(value as ContactStatus);
}
