'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button, ScrollReveal } from '@/components/ui';
import { Handshake, ArrowRight } from 'lucide-react';

export interface PartnerTeaserProps {
  className?: string;
}

export function PartnerTeaser({ className = '' }: PartnerTeaserProps) {
  const t = useTranslations('partnerTeaser');

  return (
    <section className={`py-12 md:py-16 bg-background ${className}`}>
      <div className="container mx-auto px-4">
        <ScrollReveal direction="up">
          <div className="max-w-4xl mx-auto rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <Handshake className="w-10 h-10 text-primary flex-shrink-0" />
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                    {t('title')}
                  </h2>
                  <p className="text-foreground-muted">{t('description')}</p>
                  <p className="text-sm text-primary font-medium mt-2">{t('partners')}</p>
                </div>
              </div>
              <Link href="/partenaires" className="flex-shrink-0">
                <Button variant="outline" size="lg">
                  {t('cta')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default PartnerTeaser;
