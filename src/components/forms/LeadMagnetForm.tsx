'use client';

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { leadMagnetSchema, type LeadMagnetFormData } from '@/lib/validation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Download, CheckCircle } from 'lucide-react';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export interface LeadMagnetFormProps {
  magnetType?: 'eudr-dossier';
  className?: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export function LeadMagnetForm({
  magnetType = 'eudr-dossier',
  className = '',
}: LeadMagnetFormProps) {
  const t = useTranslations('leadMagnet');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const { trackConversion } = useAnalytics();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadMagnetFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(leadMagnetSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      company: '',
      privacyConsent: false as unknown as true,
      magnetType,
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
    script.onload = () => setRecaptchaLoaded(true);
    document.head.appendChild(script);
  }, []);

  const getRecaptchaToken = useCallback(async (): Promise<string | undefined> => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (!siteKey || !window.grecaptcha) {
      return undefined;
    }

    return new Promise((resolve) => {
      window.grecaptcha!.ready(async () => {
        try {
          const token = await window.grecaptcha!.execute(siteKey, {
            action: 'lead_magnet_download',
          });
          resolve(token);
        } catch {
          resolve(undefined);
        }
      });
    });
  }, []);

  const onSubmit = async (data: LeadMagnetFormData) => {
    setStatus('submitting');
    setErrorMessage('');

    try {
      const recaptchaToken = recaptchaLoaded ? await getRecaptchaToken() : undefined;

      const response = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, recaptchaToken }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Submission failed');
      }

      setDownloadUrl(result.downloadUrl);
      setStatus('success');
      trackConversion('brochure_download', {
        event_category: 'conversion',
        event_label: magnetType,
        magnet_type: magnetType,
      });
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : t('error'));
    }
  };

  if (status === 'success' && downloadUrl) {
    return (
      <div className={`rounded-xl border border-primary/30 bg-primary/5 p-6 ${className}`}>
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">{t('successTitle')}</h3>
            <p className="text-sm text-foreground-muted">{t('successMessage')}</p>
          </div>
        </div>
        <Button variant="primary" asChild className="w-full sm:w-auto">
          <a href={downloadUrl} download target="_blank" rel="noopener noreferrer">
            <Download className="w-4 h-4 mr-2" />
            {t('downloadButton')}
          </a>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-4 rounded-xl border border-border bg-background-secondary p-6 ${className}`}
    >
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">{t('formTitle')}</h3>
        <p className="text-sm text-foreground-muted">{t('formSubtitle')}</p>
      </div>

      <Input label={t('name')} {...register('name')} error={errors.name?.message} required />
      <Input
        label={t('email')}
        type="email"
        {...register('email')}
        error={errors.email?.message}
        required
      />
      <Input
        label={t('company')}
        {...register('company')}
        error={errors.company?.message}
        required
      />

      <label className="flex items-start gap-2 text-sm text-foreground-muted cursor-pointer">
        <input
          type="checkbox"
          {...register('privacyConsent')}
          className="mt-1 rounded border-border"
        />
        <span>
          {t('privacyPrefix')}{' '}
          <Link href="/politique-confidentialite" className="text-primary hover:underline">
            {t('privacyLink')}
          </Link>
        </span>
      </label>
      {errors.privacyConsent && (
        <p className="text-sm text-red-500">{errors.privacyConsent.message}</p>
      )}

      {status === 'error' && errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

      <Button
        type="submit"
        variant="primary"
        fullWidth
        disabled={isSubmitting || status === 'submitting'}
      >
        {status === 'submitting' ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}

export default LeadMagnetForm;
