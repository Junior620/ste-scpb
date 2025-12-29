import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  contactFormSchema,
  rfqFormSchema,
  newsletterSchema,
  emailSchema,
  phoneSchema,
  INQUIRY_TYPES,
  PACKAGING_OPTIONS,
} from './validation';
import { INCOTERMS } from '@/domain/value-objects/Incoterm';
import { QUANTITY_UNITS } from '@/domain/value-objects/Quantity';

/**
 * Property-Based Tests for Form Validation Schemas
 * **Feature: ste-scpb-refonte, Property 2: Form Validation Rejects Invalid Inputs**
 * **Validates: Requirements 5.2, 17.9**
 */
describe('Form Validation - Property Tests', () => {
  // ==========================================================================
  // Arbitraries for valid data generation
  // ==========================================================================

  // Valid email arbitrary
  const validEmailArb = fc
    .tuple(
      fc.stringMatching(/^[a-z0-9]+$/),
      fc.stringMatching(/^[a-z0-9]+$/),
      fc.stringMatching(/^[a-z]{2,6}$/)
    )
    .filter(([local, domain, tld]) => local.length > 0 && domain.length > 0 && tld.length >= 2)
    .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

  // Valid phone arbitrary (8-20 digits with optional + prefix)
  const validPhoneArb = fc
    .tuple(
      fc.boolean(), // has + prefix
      fc.stringMatching(/^[0-9]{8,20}$/)
    )
    .map(([hasPlus, digits]) => (hasPlus ? `+${digits}` : digits));

  // Valid name arbitrary (2-100 chars)
  const validNameArb = fc.string({ minLength: 2, maxLength: 100 }).filter((s) => s.trim().length >= 2);

  // Valid message arbitrary (10-5000 chars)
  const validMessageArb = fc.string({ minLength: 10, maxLength: 500 }).filter((s) => s.trim().length >= 10);

  // Valid company name arbitrary
  const validCompanyArb = fc.string({ minLength: 2, maxLength: 200 }).filter((s) => s.trim().length >= 2);

  // Valid country arbitrary
  const validCountryArb = fc.string({ minLength: 2, maxLength: 100 }).filter((s) => s.trim().length >= 2);

  // Valid port arbitrary
  const validPortArb = fc.string({ minLength: 2, maxLength: 200 }).filter((s) => s.trim().length >= 2);

  // Valid inquiry type arbitrary
  const validInquiryTypeArb = fc.constantFrom(...INQUIRY_TYPES);

  // Valid incoterm arbitrary
  const validIncotermArb = fc.constantFrom(...INCOTERMS);

  // Valid quantity unit arbitrary
  const validUnitArb = fc.constantFrom(...QUANTITY_UNITS);

  // Valid packaging arbitrary
  const validPackagingArb = fc.constantFrom(...PACKAGING_OPTIONS);

  // Valid positive quantity arbitrary
  const validQuantityArb = fc.float({ min: Math.fround(0.01), max: Math.fround(1000000), noNaN: true });

  // Valid date range arbitrary (deliveryEnd > deliveryStart)
  const validDateRangeArb = fc
    .tuple(
      fc.date({ min: new Date('2024-01-01'), max: new Date('2030-12-31') }),
      fc.integer({ min: 1, max: 365 }) // days to add
    )
    .filter(([start]) => !isNaN(start.getTime())) // Filter out invalid dates
    .map(([start, daysToAdd]) => ({
      deliveryStart: start,
      deliveryEnd: new Date(start.getTime() + daysToAdd * 24 * 60 * 60 * 1000),
    }))
    .filter((dates) => !isNaN(dates.deliveryEnd.getTime())); // Ensure end date is valid

  // ==========================================================================
  // Property 2: Form Validation Rejects Invalid Inputs
  // ==========================================================================

  describe('Property 2: Form Validation Rejects Invalid Inputs', () => {
    /**
     * Property: Invalid emails are rejected by all forms
     * For any string that doesn't match email format, validation should fail
     */
    it('should reject invalid email formats in contact form', () => {
      // Strings without @ symbol or invalid format
      const invalidEmailArb = fc.oneof(
        fc.stringMatching(/^[a-z0-9.]+$/).filter((s) => s.length > 0 && !s.includes('@')),
        fc.constant(''),
        fc.constant('   '),
        fc.constant('invalid@'),
        fc.constant('@invalid.com'),
        fc.constant('no-domain@.com')
      );

      fc.assert(
        fc.property(invalidEmailArb, (invalidEmail) => {
          const result = emailSchema.safeParse(invalidEmail);
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Invalid phone numbers are rejected
     * Phone numbers must be 8-20 digits with optional + prefix
     */
    it('should reject invalid phone formats', () => {
      const invalidPhoneArb = fc.oneof(
        fc.stringMatching(/^[0-9]{1,7}$/), // too short
        fc.stringMatching(/^[0-9]{21,30}$/), // too long
        fc.stringMatching(/^[a-z]+$/), // letters only
        fc.constant(''),
        fc.constant('abc-def-ghij')
      );

      fc.assert(
        fc.property(invalidPhoneArb, (invalidPhone) => {
          const result = phoneSchema.safeParse(invalidPhone);
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Contact form rejects empty/short names
     * Names must be at least 2 characters
     */
    it('should reject contact form with invalid name', () => {
      const invalidNameArb = fc.oneof(fc.constant(''), fc.constant('A'), fc.constant(' '));

      fc.assert(
        fc.property(invalidNameArb, validEmailArb, validInquiryTypeArb, validMessageArb, (name, email, inquiryType, message) => {
          const result = contactFormSchema.safeParse({
            name,
            email,
            inquiryType,
            message,
            privacyConsent: true,
          });
          expect(result.success).toBe(false);
        }),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Contact form rejects short messages
     * Messages must be at least 10 characters
     */
    it('should reject contact form with short message', () => {
      const shortMessageArb = fc.string({ minLength: 0, maxLength: 9 });

      fc.assert(
        fc.property(validNameArb, validEmailArb, validInquiryTypeArb, shortMessageArb, (name, email, inquiryType, message) => {
          const result = contactFormSchema.safeParse({
            name,
            email,
            inquiryType,
            message,
            privacyConsent: true,
          });
          expect(result.success).toBe(false);
        }),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Contact form rejects without privacy consent
     */
    it('should reject contact form without privacy consent', () => {
      fc.assert(
        fc.property(validNameArb, validEmailArb, validInquiryTypeArb, validMessageArb, (name, email, inquiryType, message) => {
          const result = contactFormSchema.safeParse({
            name,
            email,
            inquiryType,
            message,
            privacyConsent: false,
          });
          expect(result.success).toBe(false);
        }),
        { numRuns: 50 }
      );
    });

    /**
     * Property: RFQ form rejects empty product selection
     * At least one product must be selected
     */
    it('should reject RFQ form with empty products array', () => {
      fc.assert(
        fc.property(
          validCompanyArb,
          validNameArb,
          validEmailArb,
          validPhoneArb,
          validCountryArb,
          validQuantityArb,
          validUnitArb,
          validIncotermArb,
          validPortArb,
          validPackagingArb,
          validDateRangeArb,
          (company, contact, email, phone, country, quantity, unit, incoterm, port, packaging, dates) => {
            const result = rfqFormSchema.safeParse({
              companyName: company,
              contactPerson: contact,
              email,
              phone,
              country,
              products: [], // Empty products array
              quantity,
              unit,
              incoterm,
              destinationPort: port,
              packaging,
              deliveryStart: dates.deliveryStart,
              deliveryEnd: dates.deliveryEnd,
              privacyConsent: true,
            });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: RFQ form rejects non-positive quantities
     * Quantity must be positive
     */
    it('should reject RFQ form with non-positive quantity', () => {
      const nonPositiveQuantityArb = fc.oneof(fc.constant(0), fc.constant(-1), fc.constant(-100));

      fc.assert(
        fc.property(
          validCompanyArb,
          validNameArb,
          validEmailArb,
          validPhoneArb,
          validCountryArb,
          nonPositiveQuantityArb,
          validUnitArb,
          validIncotermArb,
          validPortArb,
          validPackagingArb,
          validDateRangeArb,
          (company, contact, email, phone, country, quantity, unit, incoterm, port, packaging, dates) => {
            const result = rfqFormSchema.safeParse({
              companyName: company,
              contactPerson: contact,
              email,
              phone,
              country,
              products: ['cacao'],
              quantity,
              unit,
              incoterm,
              destinationPort: port,
              packaging,
              deliveryStart: dates.deliveryStart,
              deliveryEnd: dates.deliveryEnd,
              privacyConsent: true,
            });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Newsletter form rejects invalid emails
     */
    it('should reject newsletter form with invalid email', () => {
      const invalidEmailArb = fc.oneof(
        fc.constant(''),
        fc.constant('invalid'),
        fc.constant('no@domain'),
        fc.constant('@missing-local.com')
      );

      fc.assert(
        fc.property(invalidEmailArb, (email) => {
          const result = newsletterSchema.safeParse({
            email,
            consent: true,
          });
          expect(result.success).toBe(false);
        }),
        { numRuns: 50 }
      );
    });

    /**
     * Property: Newsletter form rejects without consent
     */
    it('should reject newsletter form without consent', () => {
      fc.assert(
        fc.property(validEmailArb, (email) => {
          const result = newsletterSchema.safeParse({
            email,
            consent: false,
          });
          expect(result.success).toBe(false);
        }),
        { numRuns: 50 }
      );
    });
  });

  // ==========================================================================
  // Valid input acceptance tests
  // ==========================================================================

  describe('Valid Input Acceptance', () => {
    /**
     * Property: Valid contact form data is accepted
     */
    it('should accept valid contact form data', () => {
      fc.assert(
        fc.property(validNameArb, validEmailArb, validInquiryTypeArb, validMessageArb, (name, email, inquiryType, message) => {
          const result = contactFormSchema.safeParse({
            name,
            email,
            inquiryType,
            message,
            privacyConsent: true,
          });
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Valid RFQ form data is accepted
     */
    it('should accept valid RFQ form data', () => {
      fc.assert(
        fc.property(
          validCompanyArb,
          validNameArb,
          validEmailArb,
          validPhoneArb,
          validCountryArb,
          validQuantityArb,
          validUnitArb,
          validIncotermArb,
          validPortArb,
          validPackagingArb,
          validDateRangeArb,
          (company, contact, email, phone, country, quantity, unit, incoterm, port, packaging, dates) => {
            const result = rfqFormSchema.safeParse({
              companyName: company,
              contactPerson: contact,
              email,
              phone,
              country,
              products: ['cacao', 'cafe'],
              quantity,
              unit,
              incoterm,
              destinationPort: port,
              packaging,
              deliveryStart: dates.deliveryStart,
              deliveryEnd: dates.deliveryEnd,
              privacyConsent: true,
            });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: Valid newsletter data is accepted
     */
    it('should accept valid newsletter data', () => {
      fc.assert(
        fc.property(validEmailArb, (email) => {
          const result = newsletterSchema.safeParse({
            email,
            consent: true,
          });
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  // ==========================================================================
  // Property 23: RFQ Form Delivery Period Validation
  // **Feature: ste-scpb-refonte, Property 23: RFQ Form Delivery Period Validation**
  // **Validates: Requirements 17.7**
  // ==========================================================================

  describe('Property 23: RFQ Form Delivery Period Validation', () => {
    /**
     * Property: RFQ form rejects when deliveryEnd is before or equal to deliveryStart
     * For any date range where end <= start, validation should fail
     */
    it('should reject RFQ form when deliveryEnd is before deliveryStart', () => {
      // Generate invalid date ranges where end is before start
      const invalidDateRangeArb = fc
        .tuple(
          fc.date({ min: new Date('2024-01-01'), max: new Date('2030-12-31') }),
          fc.integer({ min: 1, max: 365 }) // days to subtract
        )
        .map(([end, daysToSubtract]) => ({
          deliveryStart: new Date(end.getTime() + daysToSubtract * 24 * 60 * 60 * 1000),
          deliveryEnd: end,
        }));

      fc.assert(
        fc.property(
          validCompanyArb,
          validNameArb,
          validEmailArb,
          validPhoneArb,
          validCountryArb,
          validQuantityArb,
          validUnitArb,
          validIncotermArb,
          validPortArb,
          validPackagingArb,
          invalidDateRangeArb,
          (company, contact, email, phone, country, quantity, unit, incoterm, port, packaging, dates) => {
            const result = rfqFormSchema.safeParse({
              companyName: company,
              contactPerson: contact,
              email,
              phone,
              country,
              products: ['cacao'],
              quantity,
              unit,
              incoterm,
              destinationPort: port,
              packaging,
              deliveryStart: dates.deliveryStart,
              deliveryEnd: dates.deliveryEnd,
              privacyConsent: true,
            });
            expect(result.success).toBe(false);
            if (!result.success) {
              // Verify the error is specifically about the delivery period
              const deliveryEndError = result.error.issues.find((issue) => issue.path.includes('deliveryEnd'));
              expect(deliveryEndError).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: RFQ form rejects when deliveryEnd equals deliveryStart
     * Same day delivery is not allowed
     */
    it('should reject RFQ form when deliveryEnd equals deliveryStart', () => {
      const sameDateArb = fc.date({ min: new Date('2024-01-01'), max: new Date('2030-12-31') });

      fc.assert(
        fc.property(
          validCompanyArb,
          validNameArb,
          validEmailArb,
          validPhoneArb,
          validCountryArb,
          validQuantityArb,
          validUnitArb,
          validIncotermArb,
          validPortArb,
          validPackagingArb,
          sameDateArb,
          (company, contact, email, phone, country, quantity, unit, incoterm, port, packaging, sameDate) => {
            const result = rfqFormSchema.safeParse({
              companyName: company,
              contactPerson: contact,
              email,
              phone,
              country,
              products: ['cacao'],
              quantity,
              unit,
              incoterm,
              destinationPort: port,
              packaging,
              deliveryStart: sameDate,
              deliveryEnd: sameDate, // Same date
              privacyConsent: true,
            });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property: RFQ form accepts when deliveryEnd is after deliveryStart
     * For any valid date range where end > start, validation should pass
     */
    it('should accept RFQ form when deliveryEnd is after deliveryStart', () => {
      fc.assert(
        fc.property(
          validCompanyArb,
          validNameArb,
          validEmailArb,
          validPhoneArb,
          validCountryArb,
          validQuantityArb,
          validUnitArb,
          validIncotermArb,
          validPortArb,
          validPackagingArb,
          validDateRangeArb,
          (company, contact, email, phone, country, quantity, unit, incoterm, port, packaging, dates) => {
            // Ensure deliveryEnd > deliveryStart
            expect(dates.deliveryEnd.getTime()).toBeGreaterThan(dates.deliveryStart.getTime());

            const result = rfqFormSchema.safeParse({
              companyName: company,
              contactPerson: contact,
              email,
              phone,
              country,
              products: ['cacao'],
              quantity,
              unit,
              incoterm,
              destinationPort: port,
              packaging,
              deliveryStart: dates.deliveryStart,
              deliveryEnd: dates.deliveryEnd,
              privacyConsent: true,
            });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
