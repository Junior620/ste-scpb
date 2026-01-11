'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import {
  Building2,
  Package,
  Truck,
  Calendar,
  FileText,
  CheckCircle,
  Ship,
  FileCheck,
  Clock,
  HelpCircle,
} from 'lucide-react';
import {
  rfqFormSchema,
  type RFQFormData,
  PACKAGING_OPTIONS,
  ORDER_FREQUENCIES,
  COCOA_TYPES,
  COCOA_CERTIFICATIONS,
} from '@/lib/validation';
import { QUANTITY_UNITS } from '@/domain/value-objects/Quantity';
import { getCountryOptions } from '@/lib/countries';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useLocale } from 'next-intl';

/**
 * RFQForm Component - B2B Export Optimized
 * Request for Quote form with progress stepper and conditional fields
 * Validates: Requirements 17.1-17.9, 15.2
 */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const PRODUCT_CATEGORIES = [
  'cacao', 'cafe', 'cajou', 'sesame', 'soja', 'bois', 'mais', 'hevea',
] as const;

// Limited incoterms for clarity
const MAIN_INCOTERMS = ['FOB', 'CIF', 'DAP', 'EXW'] as const;

export interface RFQFormProps {
  onSuccess?: () => void;
  className?: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

// Progress steps
const STEPS = ['company', 'products', 'logistics', 'delivery'] as const;
type Step = (typeof STEPS)[number];

export function RFQForm({ onSuccess, className = '' }: RFQFormProps) {
  const t = useTranslations('rfq');
  const tProducts = useTranslations('products');
  const tCommon = useTranslations('common');
  const locale = useLocale() as 'fr' | 'en';
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('company');
  const { trackQuoteRequest } = useAnalytics();
  const containerRef = useRef<HTMLDivElement>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];


  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RFQFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(rfqFormSchema) as any,
    defaultValues: {
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      country: '',
      products: [],
      cocoaType: undefined,
      cocoaCertification: undefined,
      quantity: undefined,
      unit: 'tonnes',
      orderFrequency: 'spot',
      incoterm: 'FOB',
      destinationPort: '',
      packaging: 'jute-pe',
      deliveryStart: undefined,
      deliveryEnd: undefined,
      specialRequirements: '',
      privacyConsent: false as unknown as true,
    },
  });

  const deliveryStart = watch('deliveryStart');
  const selectedProducts = watch('products');
  const hasCocoa = selectedProducts?.includes('cacao');

  // Calculate progress
  const stepIndex = STEPS.indexOf(currentStep);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

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

  // Scroll to success message when form is submitted successfully
  useEffect(() => {
    if (status === 'success' && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [status]);

  const getRecaptchaToken = useCallback(async (): Promise<string | null> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey || !window.grecaptcha) return null;
    try {
      return await window.grecaptcha.execute(siteKey, { action: 'rfq_submit' });
    } catch {
      return null;
    }
  }, []);

  const onSubmit = async (data: RFQFormData) => {
    setStatus('submitting');
    setErrorMessage('');
    try {
      const recaptchaToken = await getRecaptchaToken();
      const response = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, recaptchaToken }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t('error.description'));
      trackQuoteRequest(data.products);
      setStatus('success');
      reset();
      onSuccess?.();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : t('error.description'));
    }
  };

  // Options
  const unitOptions = QUANTITY_UNITS.map((unit) => ({
    value: unit,
    label: t(`form.units.${unit}`),
  }));

  const incotermOptions = MAIN_INCOTERMS.map((incoterm) => ({
    value: incoterm,
    label: incoterm,
  }));

  const packagingOptions = PACKAGING_OPTIONS.map((option) => ({
    value: option,
    label: t(`form.packagingOptions.${option}`),
  }));

  const frequencyOptions = ORDER_FREQUENCIES.map((freq) => ({
    value: freq,
    label: t(`form.frequencies.${freq}`),
  }));

  const cocoaTypeOptions = COCOA_TYPES.map((type) => ({
    value: type,
    label: t(`form.cocoaTypes.${type}`),
  }));

  const cocoaCertOptions = COCOA_CERTIFICATIONS.map((cert) => ({
    value: cert,
    label: t(`form.cocoaCertifications.${cert}`),
  }));

  const productOptions = PRODUCT_CATEGORIES.map((category) => ({
    value: category,
    label: tProducts(`categories.${category}`),
  }));

  if (status === 'success') {
    return (
      <div 
        ref={containerRef}
        className={`bg-success/10 border border-success rounded-lg p-8 text-center ${className}`}
      >
        <Confetti active={status === 'success'} />
        <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
        <h3 className="text-2xl font-semibold text-foreground mb-2">{t('success.title')}</h3>
        <p className="text-foreground-muted mb-4">{t('success.description')}</p>
        <div className="flex flex-wrap justify-center gap-2 text-xs text-foreground-muted mb-6">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t('success.response')}</span>
          <span>•</span>
          <span className="flex items-center gap-1"><FileCheck className="w-3 h-3" /> {t('success.proforma')}</span>
        </div>
        <Button variant="outline" onClick={() => setStatus('idle')}>{tCommon('back')}</Button>
      </div>
    );
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`} noValidate>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-foreground-muted mb-2">
          {STEPS.map((step, idx) => (
            <span
              key={step}
              className={`${idx <= stepIndex ? 'text-primary font-medium' : ''}`}
            >
              {t(`form.steps.${step}`)}
            </span>
          ))}
        </div>
        <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-foreground-muted text-center mt-2">
          {Math.round(progress)}% {t('form.completed')}
        </p>
      </div>

      {/* Error Banner */}
      {status === 'error' && (
        <div className="bg-error/10 border border-error rounded-lg p-4" role="alert">
          <p className="text-error font-medium">{t('error.title')}</p>
          <p className="text-error/80 text-sm mt-1">{errorMessage}</p>
        </div>
      )}

      {/* Section 1: Company Information */}
      <fieldset className="space-y-4" onFocus={() => setCurrentStep('company')}>
        <legend className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-accent" />
          {t('form.sections.company')}
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...register('companyName')}
            label={t('form.companyName')}
            placeholder={t('form.companyNamePlaceholder')}
            error={errors.companyName?.message}
            required
            fullWidth
          />
          <Input
            {...register('contactPerson')}
            label={t('form.contactPerson')}
            placeholder={t('form.contactPersonPlaceholder')}
            error={errors.contactPerson?.message}
            required
            fullWidth
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...register('email')}
            type="email"
            label={t('form.email')}
            placeholder={t('form.emailPlaceholder')}
            error={errors.email?.message}
            required
            fullWidth
          />
          <Input
            {...register('phone')}
            type="tel"
            label={t('form.phone')}
            placeholder={t('form.phonePlaceholder')}
            error={errors.phone?.message}
            required
            fullWidth
          />
        </div>

        <Select
          {...register('country')}
          label={t('form.country')}
          options={[
            { value: '', label: t('form.countryPlaceholder') },
            ...getCountryOptions(locale),
          ]}
          error={errors.country?.message}
          required
          fullWidth
        />
      </fieldset>

      {/* Section 2: Products */}
      <fieldset className="space-y-4" onFocus={() => setCurrentStep('products')}>
        <legend className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2 flex items-center gap-2">
          <Package className="w-5 h-5 text-accent" />
          {t('form.sections.products')}
        </legend>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {t('form.products')} <span className="text-error">*</span>
          </label>
          <Controller
            name="products"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {productOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors
                      ${field.value.includes(option.value)
                        ? 'bg-accent/20 border-accent text-foreground font-medium'
                        : 'bg-background-secondary border-border text-foreground-muted hover:border-accent/50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      value={option.value}
                      checked={field.value.includes(option.value)}
                      onChange={(e) => {
                        const newValue = e.target.checked
                          ? [...field.value, option.value]
                          : field.value.filter((v) => v !== option.value);
                        field.onChange(newValue);
                      }}
                      className="sr-only"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
          />
          {errors.products && (
            <p className="mt-1.5 text-sm text-error">{errors.products.message}</p>
          )}
        </div>

        {/* Cocoa specific options - conditional */}
        {hasCocoa && (
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 space-y-4">
            <p className="text-sm font-medium text-primary flex items-center gap-2">
              <Package className="w-4 h-4" />
              {t('form.cocoaOptions')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                {...register('cocoaType')}
                label={t('form.cocoaType')}
                options={[{ value: '', label: t('form.selectOption') }, ...cocoaTypeOptions]}
                fullWidth
              />
              <Select
                {...register('cocoaCertification')}
                label={t('form.cocoaCertification')}
                options={[{ value: '', label: t('form.selectOption') }, ...cocoaCertOptions]}
                fullWidth
              />
            </div>
          </div>
        )}

        {/* Quantity & Frequency */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            {...register('quantity', { valueAsNumber: true })}
            type="number"
            label={t('form.quantity')}
            placeholder={t('form.quantityPlaceholder')}
            error={errors.quantity?.message}
            required
            fullWidth
            min={1}
          />
          <Select
            {...register('unit')}
            label={t('form.unit')}
            options={unitOptions}
            required
            fullWidth
          />
          <Select
            {...register('orderFrequency')}
            label={t('form.frequency')}
            options={frequencyOptions}
            fullWidth
          />
          <div className="flex items-end">
            <p className="text-xs text-foreground-muted pb-3">
              {t('form.moqNote')}
            </p>
          </div>
        </div>
      </fieldset>


      {/* Section 3: Logistics */}
      <fieldset className="space-y-4" onFocus={() => setCurrentStep('logistics')}>
        <legend className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2 flex items-center gap-2">
          <Truck className="w-5 h-5 text-accent" />
          {t('form.sections.logistics')}
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Select
              {...register('incoterm')}
              label={
                <span className="flex items-center gap-1">
                  {t('form.incoterm')}
                  <span className="group relative">
                    <HelpCircle className="w-3.5 h-3.5 text-foreground-muted cursor-help" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-background-secondary border border-border rounded-lg text-xs text-foreground-muted w-64 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {t('form.incotermHelp')}
                    </span>
                  </span>
                </span>
              }
              options={incotermOptions}
              required
              fullWidth
            />
          </div>
          <Input
            {...register('destinationPort')}
            label={t('form.destinationPort')}
            placeholder={t('form.destinationPortPlaceholder')}
            error={errors.destinationPort?.message}
            required
            fullWidth
          />
        </div>

        <Select
          {...register('packaging')}
          label={t('form.packaging')}
          options={packagingOptions}
          required
          fullWidth
        />
      </fieldset>

      {/* Section 4: Delivery */}
      <fieldset className="space-y-4" onFocus={() => setCurrentStep('delivery')}>
        <legend className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent" />
          {t('form.sections.delivery')}
        </legend>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...register('deliveryStart')}
            type="date"
            label={t('form.deliveryStart')}
            error={errors.deliveryStart?.message}
            required
            fullWidth
            min={minDate}
          />
          <Input
            {...register('deliveryEnd')}
            type="date"
            label={t('form.deliveryEnd')}
            error={errors.deliveryEnd?.message}
            required
            fullWidth
            min={deliveryStart ? new Date(deliveryStart).toISOString().split('T')[0] : minDate}
          />
        </div>
      </fieldset>

      {/* Section 5: Special Requirements */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent" />
          {t('form.sections.requirements')}
        </legend>

        <div>
          <label htmlFor="specialRequirements" className="block text-sm font-medium text-foreground mb-1.5">
            {t('form.specialRequirements')}
            <span className="text-foreground-muted ml-1">({tCommon('optional')})</span>
          </label>
          <textarea
            {...register('specialRequirements')}
            id="specialRequirements"
            rows={4}
            placeholder={t('form.specialRequirementsPlaceholder')}
            className="w-full rounded-lg border border-border bg-background-secondary text-foreground placeholder:text-foreground-muted px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent resize-y min-h-[100px]"
          />
        </div>
      </fieldset>

      {/* Privacy Consent */}
      <div className="flex items-start gap-3">
        <input
          {...register('privacyConsent')}
          type="checkbox"
          id="rfqPrivacyConsent"
          className="mt-1 h-4 w-4 rounded border-border bg-background-secondary text-accent focus:ring-accent"
        />
        <div>
          <label htmlFor="rfqPrivacyConsent" className="text-sm text-foreground cursor-pointer">
            {t('form.privacyConsent')} <span className="text-error">*</span>
          </label>
          {errors.privacyConsent && (
            <p className="mt-1 text-sm text-error">{errors.privacyConsent.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isSubmitting || status === 'submitting'}
        disabled={!recaptchaLoaded && !!process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
      >
        {isSubmitting || status === 'submitting' ? t('form.submitting') : t('form.submit')}
      </Button>

      {/* Reassurance badges */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-foreground-muted pt-2">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-primary" />
          {t('form.badges.response')}
        </span>
        <span className="flex items-center gap-1">
          <FileCheck className="w-3 h-3 text-primary" />
          {t('form.badges.proforma')}
        </span>
        <span className="flex items-center gap-1">
          <Ship className="w-3 h-3 text-primary" />
          {t('form.badges.docs')}
        </span>
      </div>

      {/* reCAPTCHA Notice */}
      <p className="text-xs text-foreground-muted text-center">
        This site is protected by reCAPTCHA and the Google{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          Privacy Policy
        </a>{' '}
        and{' '}
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
          Terms of Service
        </a>{' '}
        apply.
      </p>
    </form>
  );
}

export default RFQForm;
