/**
 * i18n Configuration
 * Defines supported locales and default locale for the application
 */
import { Locale, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/domain/value-objects/Locale';

export type { Locale };
export { SUPPORTED_LOCALES, DEFAULT_LOCALE };

/**
 * Locale configuration for next-intl
 */
export const localeConfig = {
  locales: SUPPORTED_LOCALES as unknown as string[],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always' as const,
} as const;

/**
 * Locale labels for UI display
 */
export const localeLabels: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  ru: 'Русский',
};

/**
 * Locale flags for UI display (emoji)
 */
export const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
  ru: '🇷🇺',
};
