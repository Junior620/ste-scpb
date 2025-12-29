/**
 * i18n Module Exports
 * Central export point for all i18n utilities
 */

// Configuration
export { localeConfig, localeLabels, localeFlags } from './config';
export type { Locale } from './config';
export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from './config';

// Routing
export { routing, Link, redirect, usePathname, useRouter, getPathname } from './routing';

// Metadata utilities
export {
  generateAlternateLanguages,
  generateLocalizedMetadata,
  getHreflangLinks,
} from './metadata';
export type { LocalizedMetadataOptions } from './metadata';
