import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Locale, SUPPORTED_LOCALES, isValidLocale } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import { SolutionHero } from '@/components/sections/SolutionHero';
import { LeadMagnetForm } from '@/components/forms/LeadMagnetForm';
import { CheckCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-static';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  const t = await getTranslations({ locale: validLocale, namespace: 'solutions.eudr.meta' });

  return generateLocalizedMetadata({
    title: t('title'),
    description: t('description'),
    pathname: '/conformite-eudr',
    locale: validLocale,
    keywords: [
      'EUDR',
      'conformité EUDR cacao',
      'cacao zéro déforestation',
      'due diligence',
      'DDS',
      'cacao traçable Cameroun',
    ],
  });
}

const SECTION_KEYS = ['obligation', 'methodology', 'documentation', 'cocoatrack'] as const;
const CHECKLIST_KEYS = ['gps', 'risk', 'dds', 'chain'] as const;

export default async function EudrCompliancePage({ params }: PageProps) {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  setRequestLocale(validLocale);

  const t = await getTranslations({ locale: validLocale, namespace: 'solutions.eudr' });

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <SolutionHero
        badge={t('hero.badge')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        primaryCta={{ href: '/devis', label: t('hero.primaryCta') }}
        secondaryCta={{ href: '/tracabilite-cacao', label: t('hero.secondaryCta') }}
      />

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            {SECTION_KEYS.map((key) => (
              <div
                key={key}
                className="rounded-xl border border-border p-6 bg-background-secondary"
              >
                <h2 className="text-xl font-semibold text-foreground mb-3">
                  {t(`sections.${key}.title`)}
                </h2>
                <p className="text-foreground-muted leading-relaxed">
                  {t(`sections.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('checklist.title')}
              </h2>
              <p className="text-foreground-muted mb-6">{t('checklist.subtitle')}</p>
              <ul className="space-y-3">
                {CHECKLIST_KEYS.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground-muted">{t(`checklist.items.${key}`)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link href="/cocoatrack">
                  <Button variant="outline">{t('checklist.cocoatrackCta')}</Button>
                </Link>
              </div>
            </div>
            <LeadMagnetForm />
          </div>
        </div>
      </section>
    </main>
  );
}
