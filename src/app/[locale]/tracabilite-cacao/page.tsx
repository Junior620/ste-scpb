import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Locale, SUPPORTED_LOCALES, isValidLocale } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import { SolutionHero } from '@/components/sections/SolutionHero';
import { TraceabilityMap } from '@/components/sections/TraceabilityMap';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Package, Users, MapPin } from 'lucide-react';

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
  const t = await getTranslations({
    locale: validLocale,
    namespace: 'solutions.traceability.meta',
  });

  return generateLocalizedMetadata({
    title: t('title'),
    description: t('description'),
    pathname: '/tracabilite-cacao',
    locale: validLocale,
    keywords: [
      'traçabilité cacao',
      'cacao GPS',
      'parcelles cartographiées',
      'lot à parcelle',
      'cacao Cameroun',
    ],
  });
}

const STEP_KEYS = ['origin', 'collection', 'processing', 'export'] as const;
const STEP_ICONS = { origin: MapPin, collection: Users, processing: Package, export: ArrowRight };

export default async function TraceabilityPage({ params }: PageProps) {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  setRequestLocale(validLocale);

  const t = await getTranslations({ locale: validLocale, namespace: 'solutions.traceability' });

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <SolutionHero
        badge={t('hero.badge')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        primaryCta={{ href: '/devis', label: t('hero.primaryCta') }}
        secondaryCta={{ href: '/conformite-eudr', label: t('hero.secondaryCta') }}
      />

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {t('map.title')}
            </h2>
            <p className="text-foreground-muted">{t('map.subtitle')}</p>
          </div>
          <div className="max-w-5xl mx-auto">
            <TraceabilityMap />
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
              {t('process.title')}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEP_KEYS.map((key, index) => {
                const Icon = STEP_ICONS[key];
                return (
                  <div
                    key={key}
                    className="relative rounded-xl border border-border p-6 bg-background"
                  >
                    <span className="text-xs font-bold text-primary mb-2 block">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <Icon className="w-7 h-7 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-2">
                      {t(`process.steps.${key}.title`)}
                    </h3>
                    <p className="text-sm text-foreground-muted">
                      {t(`process.steps.${key}.description`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-foreground-muted mb-6 max-w-2xl mx-auto">{t('cta.text')}</p>
          <Link href="/cocoatrack">
            <Button variant="primary" size="lg" className="glow-gold">
              {t('cta.button')}
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
