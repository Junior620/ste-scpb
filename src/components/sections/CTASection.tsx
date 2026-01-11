'use client';

/**
 * CTA Section Component
 * B2B-focused final call to action before footer
 * Optimized for export lead generation
 */

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { FileText, Package, Clock, Ship, FileCheck } from 'lucide-react';
import { Button, ScrollReveal } from '@/components/ui';

export function CTASection() {
  const t = useTranslations('home');

  return (
    <section className="py-16 md:py-20 bg-primary/10">
      <div className="container mx-auto px-4">
        <ScrollReveal direction="up" delay={0} duration={500}>
          <div className="max-w-3xl mx-auto text-center">
          {/* B2B-focused headline */}
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('cta.contactTitle')}
          </h2>
          <p className="text-foreground-muted text-lg mb-6">
            {t('cta.contactDescription')}
          </p>

          {/* CTAs - Clear hierarchy */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            {/* Primary CTA - Quote (highest value) */}
            <Link href="/devis">
              <Button variant="primary" size="lg" className="min-w-[220px]">
                <FileText className="w-4 h-4 mr-2" />
                {t('cta.quote')}
              </Button>
            </Link>
            {/* Secondary CTA - Sample */}
            <Link href="/devis">
              <Button variant="outline" size="lg">
                <Package className="w-4 h-4 mr-2" />
                {t('cta.sample')}
              </Button>
            </Link>
          </div>

          {/* Reassurance line */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-foreground-muted">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-primary" />
              {t('cta.reassurance.response')}
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="flex items-center gap-1">
              <Ship className="w-4 h-4 text-primary" />
              {t('cta.reassurance.incoterms')}
            </span>
            <span className="hidden sm:inline text-border">•</span>
            <span className="flex items-center gap-1">
              <FileCheck className="w-4 h-4 text-primary" />
              {t('cta.reassurance.docs')}
            </span>
          </div>
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default CTASection;
