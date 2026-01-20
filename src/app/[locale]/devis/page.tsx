import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Locale } from '@/domain/value-objects/Locale';
import { generateAlternateLanguages, SITE_NAME } from '@/i18n/metadata';
import { RFQForm } from '@/components/forms/RFQForm';
import { Clock, FileCheck, Ship } from 'lucide-react';
import { BackButton } from '@/components/ui';

interface DevisPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: DevisPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'rfq' });

  // Canonical always points to /devis (without query params)
  // This prevents /devis?type=sample from being indexed as separate page
  // Uses locale-specific canonical (REQ-7: FR→FR, EN→EN)
  const canonicalUrl = `https://www.ste-scpb.com/${locale}/devis`;

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: {
      ...generateAlternateLanguages('/devis', locale as Locale),
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${t('meta.title')} | ${SITE_NAME}`,
      description: t('meta.description'),
    },
  };
}

export default async function DevisPage({ params }: DevisPageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations({ locale, namespace: 'rfq' });

  return (
    <main id="main-content" className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <BackButton />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('title')}</h1>
            <p className="text-lg text-foreground-muted mb-6">{t('description')}</p>
            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-foreground-muted">
              <span className="flex items-center gap-1.5 bg-background-secondary px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4 text-primary" />
                {t('form.badges.response')}
              </span>
              <span className="flex items-center gap-1.5 bg-background-secondary px-3 py-1.5 rounded-full">
                <FileCheck className="w-4 h-4 text-primary" />
                {t('form.badges.proforma')}
              </span>
              <span className="flex items-center gap-1.5 bg-background-secondary px-3 py-1.5 rounded-full">
                <Ship className="w-4 h-4 text-primary" />
                {t('form.badges.docs')}
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="bg-background-secondary rounded-2xl p-6 md:p-8 border border-border">
            <RFQForm />
          </div>
        </div>
      </div>
    </main>
  );
}
