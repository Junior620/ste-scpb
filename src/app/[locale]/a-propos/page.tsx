import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Locale } from '@/domain/value-objects/Locale';
import { generateAlternateLanguages, SITE_NAME } from '@/i18n/metadata';
import { Target, Eye, Heart, Handshake, Award, Globe, Users, TrendingUp, Package } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { AboutHero } from '@/components/sections/AboutHero';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: generateAlternateLanguages('/a-propos'),
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
    { key: 'quality', icon: Award },
    { key: 'transparency', icon: Eye },
    { key: 'sustainability', icon: Globe },
    { key: 'partnership', icon: Handshake },
  ];

  const stats = [
    { key: 'experience', icon: TrendingUp },
    { key: 'partners', icon: Users },
    { key: 'destinations', icon: Globe },
    { key: 'volume', icon: Package },
  ];

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {values.map(({ key, icon: Icon }) => (
                <div
                  key={key}
                  className="bg-background-secondary rounded-lg p-5 border border-border"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-6 h-6 text-accent" />
                    <h3 className="text-lg font-semibold text-foreground">
                      {t(`values.${key}`)}
                    </h3>
                  </div>
                  <p className="text-foreground-muted mb-3">
                    {t(`values.${key}Description`)}
                  </p>
                  <p className="text-xs text-accent font-medium bg-accent/10 px-3 py-1.5 rounded inline-block">
                    → {t(`values.${key}Proof`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mid-page CTA Section */}
      <section className="py-10 md:py-14 bg-gradient-to-r from-accent/20 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
              {t('cta.title')}
            </h2>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map(({ key, icon: Icon }) => (
                <div key={key}>
                  <Icon className="w-8 h-8 text-accent mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                    {t(`stats.${key}.value`)}
                  </div>
                  <div className="text-sm text-foreground-muted">
                    {t(`stats.${key}.label`)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
