/**
 * Head component for JSON-LD schemas
 *
 * This renders JSON-LD scripts directly in <head> as recommended by Google.
 * metadata.other does NOT create <script type="application/ld+json"> tags.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data
 */

import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';
import type { Locale } from '@/domain/value-objects/Locale';

interface HeadProps {
  params: Promise<{ locale: string }>;
}

export default async function Head({ params }: HeadProps) {
  const { locale } = await params;

  return (
    <>
      {/* Global JSON-LD schemas - rendered in <head> */}
      <OrganizationJsonLd />
      <WebSiteJsonLd locale={locale as Locale} />
    </>
  );
}
