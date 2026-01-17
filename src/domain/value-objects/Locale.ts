/**
 * Locale value object
 * Supported languages: French (default), English, and Russian
 */
export type Locale = 'fr' | 'en' | 'ru';

export const SUPPORTED_LOCALES: readonly Locale[] = ['fr', 'en', 'ru'] as const;
export const DEFAULT_LOCALE: Locale = 'fr';

export function isValidLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

/**
 * Type for i18n content fields
 * Maps each locale to its translated content
 */
export type LocalizedContent = Record<Locale, string>;
