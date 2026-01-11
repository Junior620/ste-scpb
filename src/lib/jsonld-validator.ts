/**
 * JSON-LD Validator for Google Rich Results Test Compliance
 * Validates: Requirements 2.5
 *
 * This module validates JSON-LD structured data against Google's
 * Rich Results Test requirements for Product schema.
 */

import type { ProductSchema } from './schema';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a Product JSON-LD schema against Google Rich Results requirements
 * Based on: https://developers.google.com/search/docs/appearance/structured-data/product
 */
export function validateProductJsonLd(schema: ProductSchema): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required: @context
  if (schema['@context'] !== 'https://schema.org') {
    errors.push('@context must be "https://schema.org"');
  }

  // Required: @type
  if (schema['@type'] !== 'Product') {
    errors.push('@type must be "Product"');
  }

  // Required: name
  if (!schema.name || typeof schema.name !== 'string' || schema.name.trim().length === 0) {
    errors.push('name is required and must be a non-empty string');
  }

  // Recommended: description
  if (!schema.description || typeof schema.description !== 'string') {
    warnings.push('description is recommended for better rich results');
  } else if (schema.description.length < 50) {
    warnings.push('description should be at least 50 characters for better SEO');
  }

  // Recommended: image
  if (!schema.image || (Array.isArray(schema.image) && schema.image.length === 0)) {
    warnings.push('image is recommended for rich results');
  } else if (Array.isArray(schema.image)) {
    schema.image.forEach((url, index) => {
      if (!isValidUrl(url)) {
        errors.push(`image[${index}] must be a valid URL`);
      }
    });
  }

  // Recommended: brand
  if (!schema.brand) {
    warnings.push('brand is recommended for product identification');
  } else {
    if (schema.brand['@type'] !== 'Brand') {
      errors.push('brand @type must be "Brand"');
    }
    if (!schema.brand.name || typeof schema.brand.name !== 'string') {
      errors.push('brand.name is required when brand is present');
    }
  }

  // Recommended: offers
  if (!schema.offers) {
    warnings.push('offers is recommended for product availability information');
  } else {
    if (schema.offers['@type'] !== 'Offer') {
      errors.push('offers @type must be "Offer"');
    }
    if (!schema.offers.availability) {
      warnings.push('offers.availability is recommended');
    } else if (!isValidAvailability(schema.offers.availability)) {
      errors.push('offers.availability must be a valid schema.org availability value');
    }
    if (schema.offers.seller) {
      if (schema.offers.seller['@type'] !== 'Organization') {
        errors.push('offers.seller @type must be "Organization"');
      }
    }
  }

  // Optional: manufacturer
  if (schema.manufacturer) {
    if (schema.manufacturer['@type'] !== 'Organization') {
      errors.push('manufacturer @type must be "Organization"');
    }
  }

  // Optional: category
  if (schema.category && typeof schema.category !== 'string') {
    errors.push('category must be a string');
  }

  // Optional: additionalProperty
  if (schema.additionalProperty) {
    if (!Array.isArray(schema.additionalProperty)) {
      errors.push('additionalProperty must be an array');
    } else {
      schema.additionalProperty.forEach((prop, index) => {
        if (prop['@type'] !== 'PropertyValue') {
          errors.push(`additionalProperty[${index}] @type must be "PropertyValue"`);
        }
        if (!prop.name || typeof prop.name !== 'string') {
          errors.push(`additionalProperty[${index}].name is required`);
        }
        if (!prop.value || typeof prop.value !== 'string') {
          errors.push(`additionalProperty[${index}].value is required`);
        }
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates if a string is a valid URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valid schema.org availability values
 */
const VALID_AVAILABILITY_VALUES = [
  'https://schema.org/InStock',
  'https://schema.org/OutOfStock',
  'https://schema.org/PreOrder',
  'https://schema.org/PreSale',
  'https://schema.org/SoldOut',
  'https://schema.org/OnlineOnly',
  'https://schema.org/LimitedAvailability',
  'https://schema.org/InStoreOnly',
  'https://schema.org/BackOrder',
  'https://schema.org/Discontinued',
];

/**
 * Validates if a string is a valid schema.org availability value
 */
function isValidAvailability(value: string): boolean {
  return VALID_AVAILABILITY_VALUES.includes(value);
}

/**
 * Validates JSON-LD can be properly serialized and parsed
 */
export function validateJsonLdSerialization(schema: ProductSchema): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const jsonString = JSON.stringify(schema);
    const parsed = JSON.parse(jsonString);

    // Verify round-trip integrity
    if (parsed['@context'] !== schema['@context']) {
      errors.push('JSON serialization corrupted @context');
    }
    if (parsed['@type'] !== schema['@type']) {
      errors.push('JSON serialization corrupted @type');
    }
    if (parsed.name !== schema.name) {
      errors.push('JSON serialization corrupted name');
    }
  } catch (e) {
    errors.push(`JSON serialization failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
