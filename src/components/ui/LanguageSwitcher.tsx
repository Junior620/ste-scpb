'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Locale, SUPPORTED_LOCALES } from '@/domain/value-objects/Locale';
import { localeLabels, localeFlags } from '@/i18n/config';
import { useTransition, useState, useRef, useEffect } from 'react';

interface LanguageSwitcherProps {
  /** Display mode: dropdown or toggle buttons */
  variant?: 'dropdown' | 'toggle';
  /** Additional CSS classes */
  className?: string;
  /** Show flags alongside labels */
  showFlags?: boolean;
  /** Show full labels or just locale codes */
  showLabels?: boolean;
}

/**
 * LanguageSwitcher Component
 * Allows users to switch between supported locales
 * Persists preference via next-intl cookie
 */
export function LanguageSwitcher({
  variant = 'dropdown',
  className = '',
  showFlags = true,
  showLabels = true,
}: LanguageSwitcherProps) {
  const t = useTranslations('accessibility');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
    setIsOpen(false);
  };

  const renderLocaleOption = (loc: Locale, isSelected: boolean) => (
    <>
      {showFlags && <span aria-hidden="true">{localeFlags[loc]}</span>}
      {showLabels && <span>{localeLabels[loc]}</span>}
      {!showLabels && !showFlags && <span>{loc.toUpperCase()}</span>}
      {isSelected && (
        <span className="sr-only">({t('currentLanguage')})</span>
      )}
    </>
  );

  if (variant === 'toggle') {
    return (
      <div
        className={`inline-flex rounded-lg border border-zinc-700 p-1 ${className}`}
        role="group"
        aria-label={t('switchLanguage')}
      >
        {SUPPORTED_LOCALES.map((loc) => (
          <button
            key={loc}
            onClick={() => handleLocaleChange(loc)}
            disabled={isPending}
            aria-pressed={locale === loc}
            className={`
              flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium
              transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900
              ${
                locale === loc
                  ? 'bg-amber-500 text-black'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }
              ${isPending ? 'opacity-50 cursor-wait' : ''}
            `}
          >
            {renderLocaleOption(loc, locale === loc)}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('switchLanguage')}
        className={`
          flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-medium
          text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-800
          focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-zinc-900
          ${isPending ? 'opacity-50 cursor-wait' : ''}
        `}
      >
        {renderLocaleOption(locale, true)}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul
          role="listbox"
          aria-label={t('switchLanguage')}
          className="absolute right-0 z-50 mt-2 w-40 origin-top-right rounded-lg border border-zinc-700 bg-zinc-900 py-1 shadow-lg"
        >
          {SUPPORTED_LOCALES.map((loc) => (
            <li key={loc} role="option" aria-selected={locale === loc}>
              <button
                onClick={() => handleLocaleChange(loc)}
                disabled={isPending}
                className={`
                  flex w-full items-center gap-2 px-4 py-2 text-sm
                  transition-colors focus:outline-none focus:bg-zinc-800
                  ${
                    locale === loc
                      ? 'bg-zinc-800 text-amber-500'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                  }
                `}
              >
                {renderLocaleOption(loc, locale === loc)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LanguageSwitcher;
