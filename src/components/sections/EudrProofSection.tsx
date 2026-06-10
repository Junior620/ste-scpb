'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button, ScrollReveal } from '@/components/ui';
import { ShieldCheck, MapPin, FileCheck, Satellite, ArrowRight } from 'lucide-react';

export interface EudrProofSectionProps {
  className?: string;
}

const PROOF_KEYS = ['traceability', 'gps', 'dds', 'cocoatrack'] as const;
const PROOF_ICONS = {
  traceability: MapPin,
  gps: Satellite,
  dds: FileCheck,
  cocoatrack: ShieldCheck,
};

export function EudrProofSection({ className = '' }: EudrProofSectionProps) {
  const t = useTranslations('eudrProof');

  return (
    <section className={`py-16 md:py-20 bg-background-secondary ${className}`}>
      <div className="container mx-auto px-4">
        <ScrollReveal direction="up" delay={0}>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-sm font-semibold text-primary uppercase tracking-wide mb-2 block">
              {t('badge')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('title')}</h2>
            <p className="text-lg text-foreground-muted">{t('subtitle')}</p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {PROOF_KEYS.map((key, index) => {
            const Icon = PROOF_ICONS[key];
            return (
              <ScrollReveal key={key} direction="up" delay={index * 80}>
                <div className="h-full rounded-xl border border-border bg-background p-6">
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{t(`items.${key}.title`)}</h3>
                  <p className="text-sm text-foreground-muted">{t(`items.${key}.description`)}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal direction="up" delay={200}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/conformite-eudr">
              <Button variant="primary" size="lg" className="glow-gold min-w-[220px]">
                {t('cta.eudr')}
              </Button>
            </Link>
            <Link href="/cocoatrack">
              <Button variant="outline" size="lg" className="min-w-[220px]">
                {t('cta.cocoatrack')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default EudrProofSection;
