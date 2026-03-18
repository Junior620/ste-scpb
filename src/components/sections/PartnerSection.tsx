'use client';

/**
 * Partner Section - AFREXIA Partnership
 * Showcases strategic partnership with AFREXIA
 */

import { useTranslations } from 'next-intl';
import { ExternalLink, CheckCircle } from 'lucide-react';
import { Button, ScrollReveal, Carousel } from '@/components/ui';

export function PartnerSection() {
  const t = useTranslations('partner');

  // 🎯 AJOUTE TES IMAGES ICI
  // Pour ajouter des images au carrousel, modifie ce tableau
  const carouselImages = [
    {
      src: '/partners/afrexia-warehouse.jpg',
      alt: 'AFREXIA - Contrôle qualité et traçabilité',
      caption: t('imageCaption'),
    },
    //
    {
      src: '/partners/afrexia-scpb2.jpg',
      alt: "Description de l'image 2",
      caption: 'AFREXIA - SCPB',
    },
    {
      src: '/partners/afrexia-scpb3.jpg',
      alt: "Description de l'image 2",
      caption: 'AFREXIA - SCPB',
    },
    {
      src: '/partners/afrexia-scpb4.jpg',
      alt: "Description de l'image 2",
      caption: 'AFREXIA - SCPB',
    },

    // {
    //   src: '/partners/afrexia-image3.jpg',
    //   alt: 'Description de l\'image 3',
    //   caption: 'Légende optionnelle',
    // },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-background via-background-secondary to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollReveal direction="up" delay={0} duration={500}>
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-primary uppercase tracking-wide mb-2 block">
              {t('badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('title')}</h2>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">{t('subtitle')}</p>
          </div>
        </ScrollReveal>

        {/* Main Content */}
        <ScrollReveal direction="up" delay={100} duration={600}>
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border-2 border-primary/30 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8 p-6 md:p-10">
                {/* Left: Carousel */}
                <div className="relative h-[400px] md:h-[500px]">
                  <Carousel images={carouselImages} autoPlayInterval={3000} className="h-full" />
                </div>

                {/* Right: Content */}
                <div className="flex flex-col justify-center">
                  {/* Logo/Title */}
                  <div className="mb-6">
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                      AFREXIA × SCPB SARL
                    </h3>
                    <p className="text-foreground/80 italic">{t('tagline')}</p>
                  </div>

                  {/* Description */}
                  <p className="text-foreground/90 mb-6 leading-relaxed">{t('description')}</p>

                  <p className="text-foreground/90 mb-6 leading-relaxed">{t('partnership')}</p>

                  {/* Key Points */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{t('points.collection')}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{t('points.quality')}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{t('points.traceability')}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-8 bg-background/50 rounded-xl p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">+2000</div>
                      <div className="text-xs text-foreground-muted">{t('stats.cooperatives')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">40,000 t</div>
                      <div className="text-xs text-foreground-muted">{t('stats.capacity')}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">5</div>
                      <div className="text-xs text-foreground-muted">{t('stats.sites')}</div>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-wrap gap-4">
                    <a
                      href="https://afrexiacmr.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block"
                    >
                      <Button variant="primary" size="lg" className="glow-gold">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t('cta.visit')}
                      </Button>
                    </a>
                  </div>

                  {/* Footer note */}
                  <p className="text-sm text-foreground-muted mt-6 italic">{t('footer')}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default PartnerSection;
