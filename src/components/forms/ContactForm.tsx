'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { contactFormSchema, type ContactFormData, CONTACT_SUBJECTS } from '@/lib/validation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/ui/Confetti';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Clock, FileText, Package, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * ContactForm Component - Simplified for info/questions
 * Distinct from RFQ form - for questions, documents, support
 * Validates: Requirements 5.1, 5.2
 */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export interface ContactFormProps {
  onSuccess?: () => void;
  className?: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function ContactForm({ onSuccess, className = '' }: ContactFormProps) {
  const t = useTranslations('contact');
  const tCommon = useTranslations('common');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const { trackContactSubmission } = useAnalytics();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      assistanceCountry: 'cameroon' as 'cameroon' | 'usa',
      subject: 'products',
      message: '',
      privacyConsent: false as unknown as true,
    },
  });

  // Load reCAPTCHA script
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
      window.grecaptcha?.ready(() => {
        setRecaptchaLoaded(true);
      });
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
    if (!siteKey || !window.grecaptcha) {
      return null;
    }

    try {
      return await window.grecaptcha.execute(siteKey, { action: 'contact_submit' });
    } catch (error) {
      console.error('reCAPTCHA error:', error);
      return null;
    }
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    setStatus('submitting');
    setErrorMessage('');

    try {
      const recaptchaToken = await getRecaptchaToken();

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, recaptchaToken }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t('error.description'));
      }

      trackContactSubmission(data.subject);
      setStatus('success');
      reset();
      onSuccess?.();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : t('error.description'));
    }
  };

  const subjectOptions = CONTACT_SUBJECTS.map((subject) => ({
    value: subject,
    label: t(`form.subjects.${subject}`),
  }));

  const assistanceCountryOptions = [
    { value: 'cameroon', label: t('form.assistanceCountries.cameroon') },
    { value: 'usa', label: t('form.assistanceCountries.usa') },
  ];

  const toggleFaq = (key: string) => {
    setExpandedFaq(expandedFaq === key ? null : key);
  };

  if (status === 'success') {
    return (
      <div
        ref={containerRef}
        className={`bg-success/10 border border-success rounded-lg p-6 text-center ${className}`}
      >
        <Confetti active={status === 'success'} />
        <div className="text-success text-4xl mb-4">✓</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">{t('success.title')}</h3>
        <p className="text-foreground-muted">{t('success.description')}</p>
        <Button variant="outline" className="mt-4" onClick={() => setStatus('idle')}>
          {tCommon('back')}
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Triage Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <Link
          href="/devis"
          className="flex flex-col items-center gap-2 p-4 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors text-center group"
        >
          <FileText className="w-6 h-6 text-primary" />
          <span className="font-medium text-foreground">{t('triage.quote')}</span>
          <span className="text-xs text-foreground-muted">{t('triage.quoteDesc')}</span>
          <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        <Link
          href="/devis?type=sample"
          className="flex flex-col items-center gap-2 p-4 bg-background-secondary rounded-lg hover:bg-primary/10 transition-colors text-center border border-border"
        >
          <Package className="w-6 h-6 text-primary" />
          <span className="font-medium text-foreground">{t('triage.sample')}</span>
          <span className="text-xs text-foreground-muted">{t('triage.sampleDesc')}</span>
        </Link>
        <button
          type="button"
          onClick={() =>
            document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })
          }
          className="flex flex-col items-center gap-2 p-4 bg-background-secondary rounded-lg hover:bg-primary/10 transition-colors text-center border border-border"
        >
          <Clock className="w-6 h-6 text-primary" />
          <span className="font-medium text-foreground">{t('triage.info')}</span>
          <span className="text-xs text-foreground-muted">{t('triage.infoDesc')}</span>
        </button>
      </div>

      {/* Simple Contact Form */}
      <form id="contact-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Response time promise */}
        <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-lg px-4 py-2">
          <Clock className="w-4 h-4" />
          <span>{t('form.responseTime')}</span>
        </div>

        {/* Error Banner */}
        {status === 'error' && (
          <div className="bg-error/10 border border-error rounded-lg p-4" role="alert">
            <p className="text-error font-medium">{t('error.title')}</p>
            <p className="text-error/80 text-sm mt-1">{errorMessage}</p>
          </div>
        )}

        {/* Name & Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...register('name')}
            label={t('form.name')}
            placeholder={t('form.namePlaceholder')}
            error={errors.name?.message}
            required
            fullWidth
            autoComplete="name"
          />
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
        </div>

        {/* Company (optional) */}
        <Input
          {...register('company')}
          label={t('form.company')}
          placeholder={t('form.companyPlaceholder')}
          error={errors.company?.message}
          fullWidth
          autoComplete="organization"
        />

        {/* Assistance Country */}
        <Select
          {...register('assistanceCountry')}
          label={t('form.assistanceCountry')}
          options={assistanceCountryOptions}
          error={errors.assistanceCountry?.message}
          required
          fullWidth
        />

        {/* Subject */}
        <Select
          {...register('subject')}
          label={t('form.subject')}
          options={subjectOptions}
          error={errors.subject?.message}
          required
          fullWidth
        />

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
            {t('form.message')}
            <span className="text-error ml-1" aria-hidden="true">
              *
            </span>
          </label>
          <textarea
            {...register('message')}
            id="message"
            rows={4}
            placeholder={t('form.messagePlaceholder')}
            aria-invalid={!!errors.message}
            className={`
              w-full rounded-lg border bg-background-secondary text-foreground
              placeholder:text-foreground-muted px-4 py-3
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
              resize-y min-h-[100px]
              ${
                errors.message
                  ? 'border-error focus:ring-error focus:border-error'
                  : 'border-border focus:ring-accent focus:border-accent'
              }
            `}
          />
          {errors.message && (
            <p className="mt-1.5 text-sm text-error" role="alert">
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Privacy Consent */}
        <div className="flex items-start gap-3">
          <div className="relative flex items-center">
            <input
              {...register('privacyConsent')}
              type="checkbox"
              id="privacyConsent"
              className="peer h-5 w-5 shrink-0 cursor-pointer appearance-none rounded border-2 border-primary/50 bg-background-secondary checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background transition-colors"
            />
            <svg
              className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <label htmlFor="privacyConsent" className="text-sm text-foreground cursor-pointer">
              {t('form.privacyConsent')}{' '}
              <span className="text-error" aria-hidden="true">
                *
              </span>
            </label>
            {errors.privacyConsent && (
              <p className="mt-1 text-sm text-error" role="alert">
                {errors.privacyConsent.message}
              </p>
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

        {/* reCAPTCHA Notice */}
        <p className="text-xs text-foreground-muted text-center">
          This site is protected by reCAPTCHA and the Google{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Privacy Policy
          </a>{' '}
          and{' '}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Terms of Service
          </a>{' '}
          apply.
        </p>
      </form>

      {/* Mini FAQ */}
      <div className="mt-8 pt-8 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('faq.title')}</h3>
        <div className="space-y-2">
          {['docs', 'destinations', 'sample'].map((key) => (
            <div key={key} className="border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleFaq(key)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-background-secondary transition-colors"
              >
                <span className="font-medium text-foreground">{t(`faq.${key}.question`)}</span>
                {expandedFaq === key ? (
                  <ChevronUp className="w-5 h-5 text-foreground-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-foreground-muted" />
                )}
              </button>
              {expandedFaq === key && (
                <div className="px-4 pb-4 text-sm text-foreground-muted">
                  {t(`faq.${key}.answer`)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ContactForm;
