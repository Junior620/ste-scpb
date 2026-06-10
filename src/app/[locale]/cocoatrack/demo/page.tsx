import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Locale, SUPPORTED_LOCALES, isValidLocale } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import { CocoaTrackDemoMap } from '@/components/sections/CocoaTrackDemoMap';
import { DueDiligenceDossierPreview } from '@/components/sections/DueDiligenceDossierPreview';
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
  const t = await getTranslations({ locale: validLocale, namespace: 'cocoatrackDemo.meta' });

  return generateLocalizedMetadata({
    title: t('title'),
    description: t('description'),
    pathname: '/cocoatrack/demo',
    locale: validLocale,
    keywords: ['CocoaTrack demo', 'EUDR dossier', 'GPS parcels', 'due diligence'],
  });
}

export default async function CocoaTrackDemoPage({ params }: PageProps) {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  setRequestLocale(validLocale);

  const t = await getTranslations({ locale: validLocale, namespace: 'cocoatrackDemo' });

  return (
    <main id="main-content" className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">
            {t('hero.badge')}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('hero.title')}</h1>
          <p className="text-lg text-foreground-muted">{t('hero.subtitle')}</p>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t('map.heading')}</h2>
            <CocoaTrackDemoMap />
            <p className="mt-3 text-xs text-foreground-muted text-center">{t('map.disclaimer')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-4">{t('dossier.heading')}</h2>
            <DueDiligenceDossierPreview />
          </section>

          <div className="text-center rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-8">
            <h2 className="text-xl font-bold text-foreground mb-3">{t('cta.title')}</h2>
            <p className="text-foreground-muted mb-6">{t('cta.subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button variant="primary" size="lg" className="glow-gold">
                  {t('cta.primary')}
                </Button>
              </Link>
              <Link href="/conformite-eudr">
                <Button variant="outline" size="lg">
                  {t('cta.secondary')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
