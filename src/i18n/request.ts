/**
 * next-intl request configuration
 * Provides locale and messages for server components
 */
import { getRequestConfig } from 'next-intl/server';
import { isValidLocale, DEFAULT_LOCALE } from '@/domain/value-objects/Locale';

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the locale from the request
  let locale = await requestLocale;

  // Validate and fallback to default if invalid
  if (!locale || !isValidLocale(locale)) {
    locale = DEFAULT_LOCALE;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
