import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Locale, SUPPORTED_LOCALES, isValidLocale } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Building2, Factory, Scale } from 'lucide-react';

export const dynamic = 'force-static';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const CASE_KEYS = ['chocolatier', 'industrial', 'trader'] as const;
const CASE_ICONS = { chocolatier: Building2, industrial: Factory, trader: Scale };

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  const t = await getTranslations({ locale: validLocale, namespace: 'useCases.meta' });

  return generateLocalizedMetadata({
    title: t('title'),
    description: t('description'),
    pathname: '/cas-usage',
    locale: validLocale,
  });
}

export default async function UseCasesPage({ params }: PageProps) {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  setRequestLocale(validLocale);

  const t = await getTranslations({ locale: validLocale, namespace: 'useCases' });

  return (
    <main id="main-content" className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('hero.title')}</h1>
          <p className="text-lg text-foreground-muted">{t('hero.subtitle')}</p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 mb-12">
          {CASE_KEYS.map((key) => {
            const Icon = CASE_ICONS[key];
            return (
              <article
                key={key}
                className="rounded-2xl border border-border bg-background-secondary p-6 flex flex-col"
              >
                <Icon className="w-8 h-8 text-primary mb-4" />
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  {t(`cases.${key}.title`)}
                </h2>
                <p className="text-sm text-primary font-medium mb-3">{t(`cases.${key}.profile`)}</p>
                <div className="space-y-3 text-sm text-foreground-muted flex-1">
                  <div>
                    <p className="font-medium text-foreground mb-1">{t('labels.challenge')}</p>
                    <p>{t(`cases.${key}.challenge`)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">{t('labels.solution')}</p>
                    <p>{t(`cases.${key}.solution`)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">{t('labels.result')}</p>
                    <p>{t(`cases.${key}.result`)}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <p className="text-foreground-muted mb-6">{t('cta.text')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cocoatrack/demo">
              <Button variant="primary" size="lg" className="glow-gold">
                {t('cta.demo')}
              </Button>
            </Link>
            <Link href="/devis">
              <Button variant="outline" size="lg">
                {t('cta.quote')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
