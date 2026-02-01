import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';
import type { Locale } from '@/domain/value-objects/Locale';

interface HeadProps {
  params: Promise<{ locale: string }>;
}

/**
 * Head component for JSON-LD structured data
 * Renders in <head> for optimal SEO (Google recommendation)
 */
export default async function Head({ params }: HeadProps) {
  const { locale } = await params;

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd locale={locale as Locale} />
    </>
  );
}
