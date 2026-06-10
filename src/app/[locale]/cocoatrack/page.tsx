import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Locale, SUPPORTED_LOCALES, isValidLocale } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import { SolutionHero } from '@/components/sections/SolutionHero';
import { CocoaTrackDemoVideo } from '@/components/sections/CocoaTrackDemoVideo';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { MapPin, Satellite, FileCheck, Smartphone, BarChart3, ShieldCheck } from 'lucide-react';

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
  const t = await getTranslations({ locale: validLocale, namespace: 'solutions.cocoatrack.meta' });

  return generateLocalizedMetadata({
    title: t('title'),
    description: t('description'),
    pathname: '/cocoatrack',
    locale: validLocale,
    keywords: ['CocoaTrack', 'traçabilité cacao', 'EUDR', 'parcelles GPS', 'due diligence'],
  });
}

const FEATURE_KEYS = [
  'parcels',
  'field',
  'satellite',
  'compliance',
  'dashboard',
  'mobile',
] as const;
const FEATURE_ICONS = {
  parcels: MapPin,
  field: Smartphone,
  satellite: Satellite,
  compliance: FileCheck,
  dashboard: BarChart3,
  mobile: ShieldCheck,
};

export default async function CocoaTrackPage({ params }: PageProps) {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  setRequestLocale(validLocale);

  const t = await getTranslations({ locale: validLocale, namespace: 'solutions.cocoatrack' });

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <SolutionHero
        badge={t('hero.badge')}
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        primaryCta={{ href: '/contact', label: t('hero.primaryCta') }}
        secondaryCta={{ href: '/conformite-eudr', label: t('hero.secondaryCta') }}
      />

      <CocoaTrackDemoVideo />

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {t('intro.title')}
            </h2>
            <p className="text-foreground-muted">{t('intro.description')}</p>
          </div>
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURE_KEYS.map((key) => {
              const Icon = FEATURE_ICONS[key];
              return (
                <div
                  key={key}
                  className="rounded-xl border border-border p-6 bg-background-secondary"
                >
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">
                    {t(`features.${key}.title`)}
                  </h3>
                  <p className="text-sm text-foreground-muted">
                    {t(`features.${key}.description`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-background-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('demo.title')}</h2>
            <p className="text-foreground-muted mb-8">{t('demo.description')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cocoatrack/demo">
                <Button variant="primary" size="lg" className="glow-gold min-w-[220px]">
                  {t('demo.portalCta')}
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="min-w-[220px]">
                  {t('demo.primaryCta')}
                </Button>
              </Link>
              <Link href="/devis">
                <Button variant="outline" size="lg" className="min-w-[220px]">
                  {t('demo.secondaryCta')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
