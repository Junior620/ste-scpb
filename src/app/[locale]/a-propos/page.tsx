import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Locale } from '@/domain/value-objects/Locale';
import { generateAlternateLanguages, SITE_NAME } from '@/i18n/metadata';
import { Target, Eye, Heart } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { AboutHero } from '@/components/sections/AboutHero';
import { AboutValuesSection, AboutStatsSection } from '@/components/sections/AboutSections';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: generateAlternateLanguages('/a-propos', locale as Locale),
    openGraph: {
      title: `${t('meta.title')} | ${SITE_NAME}`,
      description: t('meta.description'),
    },
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations({ locale, namespace: 'about' });

  const values = [
    { key: 'quality', iconName: 'Award' as const },
    { key: 'transparency', iconName: 'Eye' as const },
    { key: 'sustainability', iconName: 'Globe' as const },
    { key: 'partnership', iconName: 'Handshake' as const },
  ];

  const stats = [
    { key: 'experience', iconName: 'TrendingUp' as const },
    { key: 'partners', iconName: 'Users' as const },
    { key: 'destinations', iconName: 'Globe' as const },
    { key: 'volume', iconName: 'Package' as const },
  ];

  // Prepare values data for client component
  const valuesData = values.map(({ key, iconName }) => ({
    key,
    iconName,
    title: t(`values.${key}`),
    description: t(`values.${key}Description`),
    proof: t(`values.${key}Proof`),
  }));

  // Prepare stats data for client component
  const statsData = stats.map(({ key, iconName }) => ({
    key,
    iconName,
    value: t(`stats.${key}.value`),
    label: t(`stats.${key}.label`),
  }));

  return (
    <main id="main-content" className="min-h-screen bg-background">
      {/* 3D Hero Section */}
      <AboutHero title={t('title')} subtitle={t('subtitle')} />

      {/* Mission Section */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-accent" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {t('mission.title')}
              </h2>
            </div>
            <p className="text-lg text-foreground-muted leading-relaxed mb-4">
              {t('mission.description')}
            </p>
            <p className="text-sm text-accent font-medium bg-accent/10 px-4 py-2 rounded-lg inline-block">
              ✓ {t('mission.proof')}
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-10 md:py-14 bg-background-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-8 h-8 text-accent" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {t('vision.title')}
              </h2>
            </div>
            <p className="text-lg text-foreground-muted leading-relaxed mb-4">
              {t('vision.description')}
            </p>
            <p className="text-sm text-accent font-medium bg-accent/10 px-4 py-2 rounded-lg inline-block">
              ✓ {t('vision.proof')}
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-8 h-8 text-accent" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                {t('values.title')}
              </h2>
            </div>
            <AboutValuesSection values={valuesData} />
          </div>
        </div>
      </section>

      {/* Mid-page CTA Section */}
      <section className="py-10 md:py-14 bg-gradient-to-r from-accent/20 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">{t('cta.title')}</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/produits/cacao">
                <Button variant="outline" size="lg">
                  {t('cta.datasheet')}
                </Button>
              </Link>
              <Link href="/devis">
                <Button variant="primary" size="lg" className="glow-gold">
                  {t('cta.quote')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 md:py-14 bg-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AboutStatsSection stats={statsData} />
          </div>
        </div>
      </section>
    </main>
  );
}
