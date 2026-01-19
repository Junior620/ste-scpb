'use client';

/**
 * Certifications Section Component
 * Displays quality certifications, process steps, quality indicators and compliance badges
 * Builds B2B trust and credibility for cocoa export - EU audit level
 */

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  CheckCircle,
  FileText,
  Microscope,
  Leaf,
  Globe,
  Ship,
  FileCheck,
  Truck,
  Thermometer,
  Sun,
  Hand,
  Package,
  Download,
  Phone,
  FileSpreadsheet,
  Droplets,
  Clock,
  BarChart3,
  FlaskConical,
  Info,
} from 'lucide-react';
import { Button, ScrollReveal } from '@/components/ui';

export interface CertificationsSectionProps {
  className?: string;
}

const CERTIFICATIONS = [
  { id: 'quality-control', icon: CheckCircle },
  { id: 'traceability', icon: FileText },
  { id: 'phytosanitary', icon: Microscope },
  { id: 'sustainable', icon: Leaf },
];

const PROCESS_STEPS = [
  { id: 'fermentation', icon: Thermometer },
  { id: 'drying', icon: Sun },
  { id: 'sorting', icon: Hand },
  { id: 'packaging', icon: Package },
];

const STATS = [
  { value: '40 000 MT', key: '0' },
  { value: '5+', key: '1' },
  { value: '20+', key: '2' },
  { value: '15', key: '3' },
];

const BADGES = [
  { key: 'export', icon: Globe },
  { key: 'incoterms', icon: Ship },
  { key: 'documentation', icon: FileCheck },
  { key: 'logistics', icon: Truck },
];

const QUALITY_INDICATORS = [
  { key: 'humidity', icon: Droplets },
  { key: 'fermentation', icon: Clock },
  { key: 'grading', icon: BarChart3 },
  { key: 'analyses', icon: FlaskConical },
];

export function CertificationsSection({ className = '' }: CertificationsSectionProps) {
  const t = useTranslations('certifications');

  // Export destinations for social proof - translated
  const EXPORT_DESTINATIONS = [
    t('destinations.france'),
    t('destinations.germany'),
    t('destinations.belgium'),
    t('destinations.usa'),
    t('destinations.morocco'),
    t('destinations.turkey'),
  ];

  return (
    <section className={`py-16 md:py-24 bg-background ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollReveal direction="up" delay={0} duration={500}>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('title')}</h2>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto mb-4">{t('subtitle')}</p>
            {/* Standards reference */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-primary">
              <span className="font-medium">{t('standards')}</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Certifications Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {CERTIFICATIONS.map((cert, index) => {
            const IconComponent = cert.icon;
            return (
              <ScrollReveal key={cert.id} direction="up" delay={index * 100} duration={500}>
                <div className="bg-background rounded-xl p-6 border border-border hover:border-primary/50 transition-colors h-full">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t(`items.${cert.id}.name`)}
                  </h3>
                  <p className="text-sm text-foreground-muted">
                    {t(`items.${cert.id}.description`)}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Process Section */}
        <div className="mb-16">
          <ScrollReveal direction="up" delay={0} duration={500}>
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {t('process.title')}
              </h3>
              <p className="text-foreground-muted">{t('process.subtitle')}</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <ScrollReveal key={step.id} direction="up" delay={index * 100} duration={500}>
                  <div className="relative bg-background rounded-xl p-6 border border-border hover:border-primary/50 transition-colors h-full">
                    {/* Step number */}
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-background flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">
                      {t(`process.${step.id}.name`)}
                    </h4>
                    <p className="text-sm text-foreground-muted">
                      {t(`process.${step.id}.description`)}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* Quality Indicators - EU Audit Level */}
        <ScrollReveal direction="up" delay={0} duration={500}>
          <div className="mb-16">
            <div className="bg-background rounded-2xl p-8 border border-border">
              <h3 className="text-xl font-bold text-foreground mb-6 text-center">
                {t('qualityIndicators.title')}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {QUALITY_INDICATORS.map((indicator) => {
                  const IconComponent = indicator.icon;
                  return (
                    <div key={indicator.key} className="text-center">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <IconComponent className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {t(`qualityIndicators.${indicator.key}.value`)}
                      </div>
                      <div className="text-sm text-foreground-muted">
                        {t(`qualityIndicators.${indicator.key}.label`)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Stats with disclaimer */}
        <ScrollReveal direction="up" delay={0} duration={500}>
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 md:p-12 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {STATS.map((stat) => (
                <div key={stat.key}>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-foreground-muted">{t(`stats.${stat.key}`)}</div>
                </div>
              ))}
            </div>
            {/* Disclaimer for credibility */}
            <div className="flex items-center justify-center gap-2 mt-6 text-xs text-foreground-muted/70">
              <Info className="w-3 h-3" />
              <span>{t('stats.disclaimer')}</span>
            </div>
          </div>
        </ScrollReveal>

        {/* Social Proof - Export destinations */}
        <div className="text-center mb-16">
          <p className="text-sm text-foreground-muted">
            {t('stats.exportTo')}{' '}
            <span className="text-foreground font-medium">{EXPORT_DESTINATIONS.join(', ')}...</span>
          </p>
        </div>

        {/* CTA Section - Capture leads at peak trust */}
        <div className="mb-12">
          <div className="bg-background rounded-2xl p-8 border-2 border-primary/30 text-center">
            <h3 className="text-xl font-bold text-foreground mb-6">{t('cta.title')}</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Primary CTA - Contact (highest value) */}
              <Link href="/contact">
                <Button variant="primary" size="lg" className="min-w-[220px]">
                  <Phone className="w-4 h-4 mr-2" />
                  {t('cta.contact')}
                </Button>
              </Link>
              {/* Secondary CTA - Datasheet */}
              <Link href="/devis">
                <Button variant="outline" size="lg">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  {t('cta.datasheet')}
                </Button>
              </Link>
              {/* Tertiary CTA - COA download */}
              <div className="flex flex-col items-center">
                <Link href="/devis">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-foreground-muted hover:text-foreground"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('cta.coa')}
                  </Button>
                </Link>
                <span className="text-xs text-foreground-muted/70 mt-1">{t('cta.coaContent')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          {BADGES.map((badge) => {
            const IconComponent = badge.icon;
            return (
              <div
                key={badge.key}
                className="flex items-center gap-2 text-sm text-foreground-muted"
              >
                <IconComponent className="w-4 h-4 text-green-500" />
                <span>{t(`badges.${badge.key}`)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CertificationsSection;
