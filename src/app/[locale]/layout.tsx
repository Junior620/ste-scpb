import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Locale, isValidLocale, SUPPORTED_LOCALES } from '@/domain/value-objects/Locale';
import { generateAlternateLanguages, BASE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/i18n/metadata';
import { CookieBanner, SkipNavigation, WhatsAppWidget } from '@/components/ui';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';
import { Header, Footer } from '@/components/layout';
import { WebSiteJsonLd, OrganizationJsonLd } from '@/components/seo/JsonLd';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${SITE_NAME} | Commerce de Produits Agricoles`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'STE-SCPB - Société camerounaise spécialisée dans le commerce de produits agricoles et matières premières: cacao, café, bois, maïs et plus.',
  alternates: generateAlternateLanguages(''),
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!isValidLocale(locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale as Locale);

  // Get messages for the current locale
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {/* Global SEO JSON-LD schemas */}
      <WebSiteJsonLd locale={locale as Locale} />
      <OrganizationJsonLd />

      <AnalyticsProvider>
        <SkipNavigation targetId="main-content" />
        <Header />
        {children}
        <Footer />
      </AnalyticsProvider>
      <CookieBanner />
      <WhatsAppWidget />
    </NextIntlClientProvider>
  );
}
