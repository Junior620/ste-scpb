import { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StatisticsSection } from '@/components/sections/StatisticsSection';
import { StatisticsHero } from '@/components/sections/StatisticsHero';
import { createSanityClient, type ExportStatisticsData } from '@/infrastructure/cms';
import { Locale } from '@/domain/value-objects/Locale';
import { generateAlternateLanguages, SITE_NAME } from '@/i18n/metadata';

// Revalidate every 1 hour (3600 seconds)
export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'statistics' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: generateAlternateLanguages('/statistiques', locale as Locale),
    openGraph: {
      title: `${t('meta.title')} | ${SITE_NAME}`,
      description: t('meta.description'),
    },
  };
}

async function getExportStatistics(): Promise<ExportStatisticsData | null> {
  try {
    const sanityClient = createSanityClient();
    return await sanityClient.getExportStatistics();
  } catch (error) {
    console.error('[StatistiquesPage] Error fetching export statistics:', error);
    return null;
  }
}

/**
 * Async component that fetches and displays statistics
 */
async function StatisticsContent() {
  // Fetch statistics from Sanity (will fallback to static data if null)
  const sanityStats = await getExportStatistics();

  return <StatisticsSection sanityData={sanityStats} />;
}

/**
 * Skeleton fallback for statistics loading state
 */
function StatisticsLoadingFallback() {
  return (
    <div className="space-y-12 animate-pulse">
      {/* KPI Cards skeleton */}
      <section className="text-center space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-background-secondary rounded-xl p-4 border border-border">
              <div className="w-6 h-6 bg-border/50 rounded mx-auto mb-2" />
              <div className="h-8 bg-border/50 rounded mb-2" />
              <div className="h-4 bg-border/50 rounded" />
            </div>
          ))}
        </div>
      </section>

      {/* Filters skeleton */}
      <section className="bg-background-secondary rounded-xl p-4 md:p-6 border border-border">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-border/50 rounded-full" />
          ))}
        </div>
      </section>

      {/* Content skeleton */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-background-secondary rounded-xl p-6 border border-border h-96" />
        <div className="bg-background-secondary rounded-xl p-6 border border-border h-96" />
      </section>
    </div>
  );
}

export default async function StatistiquesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'statistics' });

  return (
    <main className="min-h-screen bg-background">
      {/* Hero 3D avec constellation */}
      <StatisticsHero
        title={t('hero.title')}
        subtitle={t('hero.subtitle')}
        badges={{
          traceability: t('hero.badges.traceability'),
          export: t('hero.badges.export'),
          docs: t('hero.badges.docs'),
        }}
      />

      {/* Contenu statistiques with Suspense boundary */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <Suspense fallback={<StatisticsLoadingFallback />}>
          <StatisticsContent />
        </Suspense>
      </div>
    </main>
  );
}
