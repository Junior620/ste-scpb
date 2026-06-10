import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Locale, SUPPORTED_LOCALES, isValidLocale } from '@/domain/value-objects/Locale';
import { generateLocalizedMetadata } from '@/i18n/metadata';
import { FAQSection } from '@/components/sections/FAQSection';
import { FAQJsonLd } from '@/components/seo/JsonLd';
import { FAQ_SECTION_KEYS, FAQ_ITEMS_BY_SECTION, buildFaqJsonLdItems } from '@/lib/faq-config';
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
  const t = await getTranslations({ locale: validLocale, namespace: 'faqPage.meta' });

  return generateLocalizedMetadata({
    title: t('title'),
    description: t('description'),
    pathname: '/faq',
    locale: validLocale,
    keywords: ['FAQ', 'EUDR', 'export cacao', 'traçabilité', 'devis'],
  });
}

export default async function FAQPage({ params }: PageProps) {
  const { locale } = await params;
  const validLocale = isValidLocale(locale) ? (locale as Locale) : 'fr';
  setRequestLocale(validLocale);

  const t = await getTranslations({ locale: validLocale, namespace: 'faqPage' });
  const jsonLdItems = buildFaqJsonLdItems((key) => t(key));

  return (
    <main id="main-content" className="min-h-screen bg-background pt-20">
      <FAQJsonLd items={jsonLdItems} />

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('hero.title')}</h1>
          <p className="text-lg text-foreground-muted">{t('hero.subtitle')}</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <FAQSection sectionKeys={FAQ_SECTION_KEYS} itemKeys={FAQ_ITEMS_BY_SECTION} />
        </div>

        <div className="max-w-3xl mx-auto mt-12 text-center rounded-2xl border border-primary/20 bg-primary/5 p-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">{t('cta.title')}</h2>
          <p className="text-foreground-muted mb-6">{t('cta.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button variant="primary" size="lg">
                {t('cta.contact')}
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
