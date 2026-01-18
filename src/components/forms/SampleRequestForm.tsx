'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Package, MapPin, FileText, CheckCircle } from 'lucide-react';
import { sampleRequestSchema, type SampleRequestFormData } from '@/lib/validation';
import { getCountryOptions } from '@/lib/countries';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useLocale } from 'next-intl';

/**
 * SampleRequestForm Component
 * Form for requesting free samples (up to 2kg) for cocoa and beans
 */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export interface SampleRequestFormProps {
  productName: string;
  productSlug: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function SampleRequestForm({
  productName,
  productSlug,
  onSuccess,
  onCancel,
  className = '',
}: SampleRequestFormProps) {
  const t = useTranslations('sampleRequest');
  const tCommon = useTranslations('common');
  const locale = useLocale() as 'fr' | 'en';
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const { trackConversion } = useAnalytics();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SampleRequestFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(sampleRequestSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      product: productSlug,
      sampleWeight: 1,
      addressLine1: '',
      addressLine2: '',
      city: '',
      postalCode: '',
      country: '',
      purpose: '',
      privacyConsent: false as unknown as true,
    },
  });

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey) {
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
      window.grecaptcha?.ready(() => setRecaptchaLoaded(true));
    };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (status === 'success' && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [status]);

  const onSubmit = async (data: SampleRequestFormData) => {
    setStatus('submitting');
    setErrorMessage('');

    try {
      let recaptchaToken = '';
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

      if (siteKey && window.grecaptcha) {
        try {
          recaptchaToken = await window.grecaptcha.execute(siteKey, {
            action: 'sample_request',
          });
        } catch (error) {
          console.error('reCAPTCHA error:', error);
        }
      }

      const response = await fetch('/api/sample-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          recaptchaToken,
          locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('errors.submitFailed'));
      }

      setStatus('success');
      trackConversion('contact_submission', {
        event_category: 'conversion',
        event_label: `sample_request_${productSlug}`,
        product_slug: productSlug,
        inquiry_type: 'sample_request',
      });

      reset();
      setTimeout(() => {
        onSuccess?.();
      }, 3000);
    } catch (error) {
      console.error('Sample request error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : t('errors.submitFailed'));
    }
  };

  const countryOptions = getCountryOptions(locale);

  if (status === 'success') {
    return (
      <div ref={containerRef} className={`text-center py-12 ${className}`}>
        <Confetti active={true} />
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold mb-2">{t('success.title')}</h3>
        <p className="text-foreground-muted mb-6">{t('success.message')}</p>
        <Button onClick={onCancel} variant="outline">
          {tCommon('close')}
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="text-center pb-4 border-b border-border">
          <p className="text-foreground-muted">
            {t('subtitle')} <span className="font-semibold">{productName}</span>
          </p>
          <p className="text-sm text-primary mt-2">{t('freeUpTo2kg')}</p>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            {t('sections.contact')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label={t('fields.name')}
              {...register('name')}
              error={errors.name?.message}
              required
            />
            <Input
              label={t('fields.company')}
              {...register('company')}
              error={errors.company?.message}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label={t('fields.email')}
              type="email"
              {...register('email')}
              error={errors.email?.message}
              required
            />
            <Input
              label={t('fields.phone')}
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="+237 123 456 789"
              required
            />
          </div>
        </div>

        {/* Sample Details */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            {t('sections.sample')}
          </h3>

          <Input
            label={t('fields.sampleWeight')}
            type="number"
            step="0.1"
            min="0.1"
            max="2"
            {...register('sampleWeight', { valueAsNumber: true })}
            error={errors.sampleWeight?.message}
            helperText={t('fields.sampleWeightHelper')}
            required
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              {t('fields.purpose')} <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('purpose')}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder={t('fields.purposePlaceholder')}
            />
            {errors.purpose && <p className="text-sm text-red-500">{errors.purpose.message}</p>}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            {t('sections.shipping')}
          </h3>

          <Input
            label={t('fields.addressLine1')}
            {...register('addressLine1')}
            error={errors.addressLine1?.message}
            required
          />

          <Input
            label={t('fields.addressLine2')}
            {...register('addressLine2')}
            error={errors.addressLine2?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label={t('fields.city')}
              {...register('city')}
              error={errors.city?.message}
              required
            />
            <Input
              label={t('fields.postalCode')}
              {...register('postalCode')}
              error={errors.postalCode?.message}
              required
            />
            <Select
              label={t('fields.country')}
              {...register('country')}
              error={errors.country?.message}
              options={countryOptions}
              required
            />
          </div>
        </div>

        {/* Privacy Consent */}
        <div className="flex items-start gap-3 p-3 bg-background-secondary rounded-lg">
          <input
            type="checkbox"
            {...register('privacyConsent')}
            className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <label className="text-sm text-foreground-muted">
            {t('fields.privacyConsent')}{' '}
            <a
              href="/politique-confidentialite"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {t('fields.privacyPolicy')}
            </a>
            <span className="text-red-500"> *</span>
          </label>
        </div>
        {errors.privacyConsent && (
          <p className="text-sm text-red-500 -mt-2">{errors.privacyConsent.message}</p>
        )}

        {/* Error Message */}
        {status === 'error' && errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSubmitting || !recaptchaLoaded}
            className="flex-1"
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              {tCommon('cancel')}
            </Button>
          )}
        </div>

        {/* reCAPTCHA Notice */}
        <p className="text-xs text-center text-foreground-muted">{t('recaptchaNotice')}</p>
      </form>
    </div>
  );
}

export default SampleRequestForm;
