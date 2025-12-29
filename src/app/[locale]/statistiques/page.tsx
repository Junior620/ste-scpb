import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StatisticsSection } from '@/components/sections/StatisticsSection';
import { StatisticsHero } from '@/components/sections/StatisticsHero';
import { createSanityClient, type ExportStatisticsData } from '@/infrastructure/cms';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'statistics' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    openGraph: {
      title: t('meta.title'),
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

export default async function StatistiquesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'statistics' });

  // Fetch statistics from Sanity (will fallback to static data if null)
  const sanityStats = await getExportStatistics();

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

      {/* Contenu statistiques */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <StatisticsSection sanityData={sanityStats} />
      </div>
    </main>
  );
}
