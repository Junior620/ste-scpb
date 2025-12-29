'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { newsletterSchema, type NewsletterFormData } from '@/lib/validation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAnalytics } from '@/hooks/useAnalytics';

/**
 * NewsletterForm Component
 * Newsletter subscription form with RGPD consent and double opt-in
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5
 */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export interface NewsletterFormProps {
  /** Callback when form is successfully submitted */
  onSuccess?: () => void;
  /** Compact mode for footer/sidebar placement */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error' | 'already_subscribed';

export function NewsletterForm({ onSuccess, compact = false, className = '' }: NewsletterFormProps) {
  const t = useTranslations('newsletter');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const { trackNewsletterSignup } = useAnalytics();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(newsletterSchema) as any,
    defaultValues: {
      email: '',
      consent: false as unknown as true,
    },
  });


  // Load reCAPTCHA script
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
      console.warn('reCAPTCHA site key not configured');
      setRecaptchaLoaded(true);
      return;
    }

    if (window.grecaptcha) {
      setRecaptchaLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.onload = () => {
      window.grecaptcha?.ready(() => {
        setRecaptchaLoaded(true);
      });
    };
    document.head.appendChild(script);
  }, []);

  const getRecaptchaToken = useCallback(async (): Promise<string | null> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey || !window.grecaptcha) {
      return null;
    }

    try {
      return await window.grecaptcha.execute(siteKey, { action: 'newsletter_subscribe' });
    } catch (error) {
      console.error('reCAPTCHA error:', error);
      return null;
    }
  }, []);

  const onSubmit = async (data: NewsletterFormData) => {
    setStatus('submitting');
    setErrorMessage('');

    try {
      const recaptchaToken = await getRecaptchaToken();

      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          recaptchaToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === 'ALREADY_SUBSCRIBED') {
          setStatus('already_subscribed');
          return;
        }
        throw new Error(result.error || t('error.description'));
      }

      // Track conversion event (Validates: Requirements 15.2)
      trackNewsletterSignup();

      setStatus('success');
      reset();
      onSuccess?.();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : t('error.description'));
    }
  };

  // Success state
  if (status === 'success') {
    return (
      <div className={`bg-success/10 border border-success rounded-lg p-4 text-center ${className}`}>
        <div className="text-success text-2xl mb-2">✓</div>
        <h3 className="text-lg font-semibold text-foreground mb-1">{t('success.title')}</h3>
        <p className="text-sm text-foreground-muted">{t('success.description')}</p>
      </div>
    );
  }

  // Already subscribed state
  if (status === 'already_subscribed') {
    return (
      <div className={`bg-warning/10 border border-warning rounded-lg p-4 text-center ${className}`}>
        <p className="text-sm text-foreground">{t('error.alreadySubscribed')}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => setStatus('idle')}
        >
          {t('form.submit')}
        </Button>
      </div>
    );
  }


  // Compact layout for footer/sidebar
  if (compact) {
    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`space-y-3 ${className}`}
        noValidate
      >
        {/* Error Banner */}
        {status === 'error' && (
          <div className="bg-error/10 border border-error rounded-lg p-2 text-sm" role="alert">
            <p className="text-error">{errorMessage}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Input
            {...register('email')}
            type="email"
            placeholder={t('form.emailPlaceholder')}
            error={errors.email?.message}
            fullWidth
            size="sm"
            autoComplete="email"
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting || status === 'submitting'}
            disabled={!recaptchaLoaded && !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
          >
            {isSubmitting || status === 'submitting' ? '...' : t('form.submit')}
          </Button>
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start gap-2">
          <input
            {...register('consent')}
            type="checkbox"
            id="newsletterConsentCompact"
            className="mt-0.5 h-3 w-3 rounded border-border bg-background-secondary text-accent focus:ring-accent focus:ring-offset-background"
            aria-invalid={!!errors.consent}
          />
          <label htmlFor="newsletterConsentCompact" className="text-xs text-foreground-muted cursor-pointer">
            {t('form.consent')}
          </label>
        </div>
        {errors.consent && (
          <p className="text-xs text-error" role="alert">
            {errors.consent.message}
          </p>
        )}
      </form>
    );
  }

  // Full layout
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-4 ${className}`}
      noValidate
    >
      {/* Error Banner */}
      {status === 'error' && (
        <div className="bg-error/10 border border-error rounded-lg p-4" role="alert">
          <p className="text-error font-medium">{t('error.title')}</p>
          <p className="text-error/80 text-sm mt-1">{errorMessage}</p>
        </div>
      )}

      {/* Email Field */}
      <Input
        {...register('email')}
        type="email"
        label={t('form.email')}
        placeholder={t('form.emailPlaceholder')}
        error={errors.email?.message}
        required
        fullWidth
        autoComplete="email"
      />

      {/* Consent Checkbox */}
      <div className="flex items-start gap-3">
        <input
          {...register('consent')}
          type="checkbox"
          id="newsletterConsent"
          className="mt-1 h-4 w-4 rounded border-border bg-background-secondary text-accent focus:ring-accent focus:ring-offset-background"
          aria-invalid={!!errors.consent}
          aria-describedby={errors.consent ? 'newsletter-consent-error' : undefined}
        />
        <div>
          <label htmlFor="newsletterConsent" className="text-sm text-foreground cursor-pointer">
            {t('form.consent')}{' '}
            <span className="text-error" aria-hidden="true">*</span>
          </label>
          {errors.consent && (
            <p id="newsletter-consent-error" className="mt-1 text-sm text-error" role="alert">
              {errors.consent.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        isLoading={isSubmitting || status === 'submitting'}
        disabled={!recaptchaLoaded && !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
      >
        {isSubmitting || status === 'submitting' ? t('form.submitting') : t('form.submit')}
      </Button>

      {/* Privacy Notice */}
      <p className="text-xs text-foreground-muted text-center">
        En vous inscrivant, vous acceptez notre{' '}
        <Link href="/politique-confidentialite" className="text-accent hover:underline">
          politique de confidentialité
        </Link>
        .
      </p>
    </form>
  );
}

export default NewsletterForm;
