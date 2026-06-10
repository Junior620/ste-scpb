'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';

/**
 * Keeps document.documentElement.lang in sync with the active locale.
 */
export function SetHtmlLang() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
