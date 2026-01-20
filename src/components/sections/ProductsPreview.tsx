'use client';

/**
 * Products Preview Section
 * Premium cocoa showcase with technical specs, process visualization, and B2B trust elements
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Award,
  CheckCircle,
  Download,
  ShoppingBag,
  Info,
  ArrowRight,
  Users,
  Globe,
  Building2,
  MapPin,
} from 'lucide-react';
import { Button, ScrollReveal } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { SampleRequestForm } from '@/components/forms/SampleRequestForm';

// Custom Cocoa icon
const CocoaIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={className}
  >
    <ellipse cx="12" cy="12" rx="5" ry="8" />
    <path d="M9 5v14M12 4v16M15 5v14" />
    <path d="M12 4c0-1 1-2 2-2" />
  </svg>
);

// Cocoa formats
const COCOA_FORMATS = ['beans', 'butter', 'paste', 'powder'] as const;

// Quality guarantees
const QUALITY_GUARANTEES = [
  'terroir',
  'fermentation',
  'drying',
  'traceability',
  'certifications',
] as const;

// Process steps
const PROCESS_STEPS = ['plantation', 'fermentation', 'drying', 'sorting', 'export'] as const;

// Markets served with Lucide icons
const MARKETS = [
  { key: 'eu', Icon: Building2 },
  { key: 'usa', Icon: MapPin },
  { key: 'africa', Icon: Globe },
] as const;

// Technical specs
const TECH_SPECS = ['humidity', 'fat', 'aroma'] as const;

export function ProductsPreview() {
  const t = useTranslations('productsPreview');
  const tSample = useTranslations('sampleRequest');
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <ScrollReveal direction="up" delay={0} duration={500}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('title')}</h2>
            <p className="text-lg text-foreground-muted max-w-2xl mx-auto">{t('subtitle')}</p>
          </div>
        </ScrollReveal>

        {/* Featured Product: Cocoa */}
        <ScrollReveal direction="up" delay={100} duration={600}>
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl border-2 border-primary/30 p-6 md:p-10">
              {/* Badge */}
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                  {t('featured.badge')}
                </span>
              </div>

              {/* Title with icon */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                  <CocoaIcon className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    {t('featured.title')}
                  </h3>
                  <p className="text-foreground-muted">{t('featured.origin')}</p>
                </div>
              </div>

              {/* Terroir description - emotional */}
              <p className="text-foreground/80 mb-8 italic border-l-4 border-primary/30 pl-4">
                {t('featured.terroirDesc')}
              </p>

              {/* Two columns: Formats + Guarantees */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Formats */}
                <div>
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {t('featured.formatsTitle')}
                  </h4>
                  <ul className="space-y-3">
                    {COCOA_FORMATS.map((format) => (
                      <li key={format} className="flex items-start gap-3">
                        <span className="text-primary font-bold">•</span>
                        <div>
                          <span className="font-medium text-foreground">
                            {t(`featured.formats.${format}.name`)}
                          </span>
                          <span className="text-foreground-muted">
                            {' '}
                            – {t(`featured.formats.${format}.desc`)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quality Guarantees */}
                <div>
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    {t('featured.guaranteesTitle')}
                  </h4>
                  <ul className="space-y-3">
                    {QUALITY_GUARANTEES.map((guarantee) => (
                      <li key={guarantee} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-foreground">
                          {t(`featured.guarantees.${guarantee}`)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Technical Specs - B2B credibility */}
              <div className="bg-background/50 rounded-xl p-5 mb-8 border border-border">
                <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide">
                  {t('featured.techSpecs.title')}
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {TECH_SPECS.map((spec) => (
                    <div key={spec}>
                      <div className="text-lg font-bold text-primary">
                        {t(`featured.techSpecs.${spec}.value`)}
                      </div>
                      <div className="text-xs text-foreground-muted">
                        {t(`featured.techSpecs.${spec}.label`)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process visualization */}
              <div className="mb-8">
                <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wide text-center">
                  {t('featured.process.title')}
                </h4>
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
                  {PROCESS_STEPS.map((step, index) => (
                    <div key={step} className="flex items-center gap-2">
                      <div className="bg-primary/10 rounded-lg px-3 py-2 text-sm font-medium text-foreground">
                        {t(`featured.process.${step}`)}
                      </div>
                      {index < PROCESS_STEPS.length - 1 && (
                        <ArrowRight className="w-4 h-4 text-primary hidden sm:block" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Markets served badges */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                {MARKETS.map(({ key, Icon }) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 bg-background rounded-full px-4 py-2 border border-border"
                  >
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">
                      {t(`featured.markets.${key}.name`)}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 justify-center mb-6">
                <Link href="/">
                  <Button variant="primary" size="lg" className="glow-gold">
                    <Download className="w-4 h-4 mr-2" />
                    {t('featured.cta.datasheet')}
                  </Button>
                </Link>
                <Button variant="outline" size="lg" onClick={() => setIsSampleModalOpen(true)}>
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  {t('featured.cta.sample')}
                </Button>
              </div>

              {/* Certifications note with tooltip */}
              <div className="flex items-center justify-center gap-2 text-sm text-foreground-muted mb-6">
                <Info className="w-4 h-4" />
                <span>{t('featured.certificationsNote')}</span>
                <span
                  className="underline decoration-dotted cursor-help"
                  title={t('featured.certificationsTooltip')}
                >
                  {t('featured.certificationsDetails')}
                </span>
              </div>

              {/* Why us - human differentiation */}
              <div className="bg-primary/5 rounded-xl p-5 border border-primary/20 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-foreground">{t('featured.whyUs.title')}</span>
                </div>
                <p className="text-foreground/80">{t('featured.whyUs.desc')}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Sample Request Modal */}
      <Modal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        title={tSample('title')}
        size="full"
      >
        <SampleRequestForm
          productName="Cacao"
          productSlug="cacao"
          onSuccess={() => {
            setIsSampleModalOpen(false);
          }}
          onCancel={() => setIsSampleModalOpen(false)}
        />
      </Modal>
    </section>
  );
}

export default ProductsPreview;
