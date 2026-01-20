/**
 * Zod validation schemas for forms
 * Validates: Requirements 5.1, 5.2, 17.1-17.8
 */
import { z } from 'zod';
import { INCOTERMS } from '@/domain/value-objects/Incoterm';
import { QUANTITY_UNITS } from '@/domain/value-objects/Quantity';

// =============================================================================
// Base Schemas
// =============================================================================

/**
 * Email validation schema
 * Validates: Requirements 5.1, 17.1
 */
export const emailSchema = z.string().min(1, 'Email requis').email('Email invalide');

/**
 * Phone validation schema
 * Accepts international formats: +237 123 456 789, 237-123-456-789, etc.
 * Validates: Requirements 5.1, 17.1
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[0-9\s-]{8,20}$/, 'Numéro de téléphone invalide (8-20 chiffres)');

/**
 * Incoterm validation schema (ICC 2020)
 * Validates: Requirements 17.4
 */
export const incotermSchema = z.enum(INCOTERMS, {
  message: 'Incoterm invalide',
});

/**
 * Quantity unit validation schema
 * Validates: Requirements 17.3
 */
export const quantityUnitSchema = z.enum(QUANTITY_UNITS, {
  message: 'Unité invalide',
});

/**
 * Packaging preference values - Export specific
 */
export const PACKAGING_OPTIONS = ['jute-pe', 'bigbags', 'cartons', 'bulk'] as const;
export type PackagingPreference = (typeof PACKAGING_OPTIONS)[number];

/**
 * Order frequency values
 */
export const ORDER_FREQUENCIES = ['spot', 'monthly', 'quarterly', 'contract'] as const;
export type OrderFrequency = (typeof ORDER_FREQUENCIES)[number];

/**
 * Container size options
 */
export const CONTAINER_SIZES = ['20ft', '40ft'] as const;
export type ContainerSize = (typeof CONTAINER_SIZES)[number];

/**
 * Cocoa specific options
 */
export const COCOA_TYPES = ['beans', 'butter', 'paste', 'powder'] as const;
export const COCOA_CERTIFICATIONS = ['bio', 'fairtrade', 'utz', 'none'] as const;
export type CocoaType = (typeof COCOA_TYPES)[number];
export type CocoaCertification = (typeof COCOA_CERTIFICATIONS)[number];

/**
 * Packaging preference schema
 * Validates: Requirements 17.6
 */
export const packagingSchema = z.enum(PACKAGING_OPTIONS, {
  message: "Option d'emballage invalide",
});

/**
 * Inquiry type values for contact form - B2B export focused (4 clear options)
 */
export const INQUIRY_TYPES = ['quote', 'sample', 'datasheet', 'partnership'] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];

/**
 * Subject options for simplified contact form
 */
export const CONTACT_SUBJECTS = [
  'products',
  'certifications',
  'logistics',
  'availability',
  'other',
] as const;
export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

/**
 * Product options for contact form
 */
export const CONTACT_PRODUCTS = [
  'cacao',
  'cafe',
  'cajou',
  'sesame',
  'soja',
  'bois',
  'mais',
  'hevea',
  'other',
] as const;
export type ContactProduct = (typeof CONTACT_PRODUCTS)[number];

/**
 * Volume ranges for contact form - B2B typical ranges
 */
export const VOLUME_RANGES = ['1-5t', '6-25t', '26-50t', '50t+', 'sample'] as const;
export type VolumeRange = (typeof VOLUME_RANGES)[number];

/**
 * Inquiry type for contact form
 * Validates: Requirements 5.1
 */
export const inquiryTypeSchema = z.enum(INQUIRY_TYPES, {
  message: 'Type de demande invalide',
});

/**
 * Subject schema for simplified contact form
 */
export const contactSubjectSchema = z.enum(CONTACT_SUBJECTS, {
  message: 'Sujet invalide',
});

// =============================================================================
// Contact Form Schema
// =============================================================================

/**
 * Contact form validation schema - Simplified for info/questions
 * Validates: Requirements 5.1, 5.2
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Nom requis (min 2 caractères)')
    .max(100, 'Nom trop long (max 100 caractères)'),
  email: emailSchema,
  company: z.string().max(200, 'Nom de société trop long').optional().or(z.literal('')),
  subject: contactSubjectSchema,
  message: z
    .string()
    .min(10, 'Message requis (min 10 caractères)')
    .max(5000, 'Message trop long (max 5000 caractères)'),
  privacyConsent: z.literal(true, {
    error: 'Vous devez accepter la politique de confidentialité',
  }),
});

// =============================================================================
// RFQ Form Schema
// =============================================================================

/**
 * RFQ (Request for Quote) form validation schema - B2B Export optimized
 * Validates: Requirements 17.1-17.8
 */
export const rfqFormSchema = z
  .object({
    // Company information (17.1)
    companyName: z
      .string()
      .min(2, 'Nom de société requis (min 2 caractères)')
      .max(200, 'Nom de société trop long'),
    contactPerson: z
      .string()
      .min(2, 'Nom du contact requis (min 2 caractères)')
      .max(100, 'Nom du contact trop long'),
    email: emailSchema,
    phone: phoneSchema,
    country: z.string().min(2, 'Pays requis').max(100, 'Nom de pays trop long'),

    // Product selection (17.2)
    products: z.array(z.string().min(1)).min(1, 'Sélectionnez au moins un produit'),

    // Cocoa specific options (conditional)
    cocoaType: z.enum(COCOA_TYPES).optional(),
    cocoaCertification: z.enum(COCOA_CERTIFICATIONS).optional(),

    // Quantity with unit (17.3)
    quantity: z
      .number({ message: 'Quantité doit être un nombre' })
      .positive('Quantité doit être positive'),
    unit: quantityUnitSchema,

    // Order frequency
    orderFrequency: z.enum(ORDER_FREQUENCIES).optional(),

    // Incoterm (17.4) - Limited to main options
    incoterm: incotermSchema,

    // Destination (17.5)
    destinationPort: z
      .string()
      .min(2, 'Port/Pays de destination requis')
      .max(200, 'Destination trop longue'),

    // Packaging (17.6)
    packaging: packagingSchema,

    // Container size
    containerSize: z.enum(CONTAINER_SIZES, {
      message: 'Taille de conteneur invalide',
    }),

    // Delivery period (17.7)
    deliveryStart: z.coerce.date({
      message: 'Date de début invalide',
    }),
    deliveryEnd: z.coerce.date({
      message: 'Date de fin invalide',
    }),

    // Optional message (17.8)
    specialRequirements: z
      .string()
      .max(5000, 'Message trop long (max 5000 caractères)')
      .optional()
      .or(z.literal('')),

    // Privacy consent
    privacyConsent: z.literal(true, {
      error: 'Vous devez accepter la politique de confidentialité',
    }),
  })
  .refine((data) => data.deliveryEnd > data.deliveryStart, {
    message: 'La date de fin doit être après la date de début',
    path: ['deliveryEnd'],
  });

// =============================================================================
// Newsletter Schema
// =============================================================================

/**
 * Newsletter subscription validation schema
 * Validates: Requirements 8.1, 8.3
 */
export const newsletterSchema = z.object({
  email: emailSchema,
  consent: z.literal(true, {
    error: 'Vous devez accepter de recevoir la newsletter',
  }),
});

// =============================================================================
// Sample Request Schema
// =============================================================================

/**
 * Sample request form validation schema - For cocoa and beans
 * Free samples up to 2kg
 */
export const sampleRequestSchema = z.object({
  // Contact information
  name: z
    .string()
    .min(2, 'Nom requis (min 2 caractères)')
    .max(100, 'Nom trop long (max 100 caractères)'),
  email: emailSchema,
  phone: phoneSchema,
  company: z
    .string()
    .min(2, 'Nom de société requis (min 2 caractères)')
    .max(200, 'Nom de société trop long'),

  // Product selection
  product: z.string().min(1, 'Produit requis'),

  // Sample details
  sampleWeight: z
    .number({ message: 'Poids doit être un nombre' })
    .positive('Poids doit être positif')
    .max(2, 'Échantillon gratuit limité à 2kg maximum'),

  // Shipping address
  addressLine1: z
    .string()
    .min(5, 'Adresse requise (min 5 caractères)')
    .max(200, 'Adresse trop longue'),
  addressLine2: z.string().max(200, 'Adresse trop longue').optional().or(z.literal('')),
  city: z.string().min(2, 'Ville requise').max(100, 'Nom de ville trop long'),
  postalCode: z.string().min(2, 'Code postal requis').max(20, 'Code postal trop long'),
  country: z.string().min(2, 'Pays requis').max(100, 'Nom de pays trop long'),

  // Purpose
  purpose: z
    .string()
    .min(10, "Veuillez décrire l'utilisation prévue (min 10 caractères)")
    .max(1000, 'Description trop longue (max 1000 caractères)'),

  // Privacy consent
  privacyConsent: z.literal(true, {
    error: 'Vous devez accepter la politique de confidentialité',
  }),
});

// =============================================================================
// Type Exports
// =============================================================================

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type RFQFormData = z.infer<typeof rfqFormSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type SampleRequestFormData = z.infer<typeof sampleRequestSchema>;
