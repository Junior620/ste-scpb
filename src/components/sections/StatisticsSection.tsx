'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import {
  TrendingUp,
  Globe,
  Users,
  Award,
  Clock,
  Shield,
  Package,
  FileCheck,
  Leaf,
  Ship,
  BarChart3,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Download,
  MessageSquare,
  Filter,
  RefreshCw,
  Coffee,
  Wheat,
  TreeDeciduous,
  Layers,
  Info,
  Calendar,
  HelpCircle,
  Share2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ScrollReveal } from '@/components/ui';
import {
  STATISTICS_DATA,
  PRODUCT_STATS,
  getTranslatedCountryName,
  type ProductFilter,
  type PeriodFilter,
  type RegionFilter,
  type StatisticsData,
} from '@/lib/statistics-data';
import { ExportMap } from './ExportMap';
import type { ExportStatisticsData } from '@/infrastructure/cms';

interface StatisticsSectionProps {
  sanityData?: ExportStatisticsData | null;
}

const PRODUCTS: { value: ProductFilter; icon: React.ReactNode }[] = [
  { value: 'all', icon: <Layers className="w-4 h-4" /> },
  { value: 'cacao', icon: <Package className="w-4 h-4" /> },
  { value: 'cafe', icon: <Coffee className="w-4 h-4" /> },
  { value: 'cajou', icon: <Leaf className="w-4 h-4" /> },
  { value: 'sesame', icon: <Wheat className="w-4 h-4" /> },
  { value: 'soja', icon: <TreeDeciduous className="w-4 h-4" /> },
];

const PERIODS: PeriodFilter[] = ['12m', '24m', '2024', '2023'];
const REGIONS: RegionFilter[] = ['global', 'eu', 'usa', 'asia', 'africa'];

export function StatisticsSection({ sanityData }: StatisticsSectionProps) {
  const t = useTranslations('statistics');
  const locale = useLocale() as 'fr' | 'en' | 'ru';
  const [productFilter, setProductFilter] = useState<ProductFilter>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('12m');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('global');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Use Sanity data if available, otherwise fallback to static data
  const data: StatisticsData = useMemo(() => {
    if (sanityData) {
      return {
        kpi: {
          tonnesExported: sanityData.kpi.tonnesExported,
          countriesServed: sanityData.kpi.countriesServed,
          producerPartners: sanityData.kpi.producerPartners,
          yearsExperience: sanityData.kpi.yearsExperience,
          avgResponseTime: '24-48h',
          tracedLots: sanityData.kpi.tracedLots,
        },
        exportsByRegion: sanityData.exportsByRegion,
        topDestinations: sanityData.topDestinations,
        monthlyVolumes: sanityData.monthlyVolumes,
        productMix: sanityData.productMix,
        qualityMetrics: STATISTICS_DATA.qualityMetrics,
        lastUpdated: sanityData.lastUpdated,
      };
    }
    return STATISTICS_DATA;
  }, [sanityData]);

  const productData = productFilter !== 'all' ? PRODUCT_STATS[productFilter] : null;

  const filteredProductMix = useMemo(() => {
    if (productFilter === 'all') return data.productMix;
    return data.productMix.filter((p) => p.slug === productFilter);
  }, [productFilter, data.productMix]);

  const filteredDestinations = useMemo(() => {
    if (regionFilter === 'global') return data.topDestinations;
    const regionCountries: Record<RegionFilter, string[]> = {
      global: [],
      eu: ['FR', 'BE', 'NL', 'DE', 'IT', 'ES'],
      usa: ['US', 'CA'],
      asia: ['CN', 'IN', 'VN', 'MY', 'JP'],
      africa: ['MA', 'SN', 'CI'],
    };
    return data.topDestinations.filter((d) =>
      regionCountries[regionFilter].includes(d.countryCode)
    );
  }, [regionFilter, data.topDestinations]);

  const hasNoData = filteredDestinations.length === 0 && productFilter !== 'all';

  const resetFilters = () => {
    setProductFilter('all');
    setPeriodFilter('12m');
    setRegionFilter('global');
  };

  const shareStats = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('product', productFilter);
    url.searchParams.set('period', periodFilter);
    url.searchParams.set('zone', regionFilter);
    navigator.clipboard.writeText(url.toString());
  };

  const toggleFaq = (key: string) => {
    setExpandedFaq(expandedFaq === key ? null : key);
  };

  return (
    <div className="space-y-12">
      {/* KPI Cards */}
      <section className="text-center space-y-6">
        <ScrollReveal direction="up" delay={0} duration={500}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KPICard
              icon={<TrendingUp className="w-6 h-6" />}
              value={`${data.kpi.tonnesExported.toLocaleString()} MT`}
              label={t('kpi.tonnes')}
              tooltip={t('kpi.tooltips.tonnes')}
            />
            <KPICard
              icon={<Globe className="w-6 h-6" />}
              value={`${data.kpi.countriesServed}`}
              label={t('kpi.countries')}
              tooltip={t('kpi.tooltips.countries')}
            />
            <KPICard
              icon={<Users className="w-6 h-6" />}
              value={`${data.kpi.producerPartners}+`}
              label={t('kpi.producers')}
              tooltip={t('kpi.tooltips.producers')}
            />
            <KPICard
              icon={<Award className="w-6 h-6" />}
              value={`${data.kpi.yearsExperience}`}
              label={t('kpi.years')}
              tooltip={t('kpi.tooltips.years')}
            />
            <KPICard
              icon={<Clock className="w-6 h-6" />}
              value={data.kpi.avgResponseTime}
              label={t('kpi.response')}
              tooltip={t('kpi.tooltips.response')}
            />
            <KPICard
              icon={<Shield className="w-6 h-6" />}
              value={`${data.kpi.tracedLots}%`}
              label={t('kpi.traced')}
              tooltip={t('kpi.tooltips.traced')}
            />
          </div>
          <p className="text-xs text-foreground-muted flex items-center justify-center gap-1">
            <Info className="w-3 h-3" />
            {t('kpi.disclaimer')}
          </p>
        </ScrollReveal>
      </section>

      {/* Filters */}
      <section className="bg-background-secondary rounded-xl p-4 md:p-6 border border-border">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-foreground-muted">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">{t('filters.title')}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRODUCTS.map(({ value, icon }) => (
              <button
                key={value}
                onClick={() => setProductFilter(value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                  ${
                    productFilter === value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border border-border text-foreground-muted hover:border-primary/50'
                  }`}
              >
                {icon}
                {t(`filters.products.${value}`)}
              </button>
            ))}
          </div>

          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
            className="px-3 py-1.5 rounded-lg bg-background border border-border text-foreground text-sm"
          >
            {PERIODS.map((period) => (
              <option key={period} value={period}>
                {t(`filters.periods.${period}`)}
              </option>
            ))}
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value as RegionFilter)}
            className="px-3 py-1.5 rounded-lg bg-background border border-border text-foreground text-sm"
          >
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {t(`filters.regions.${region}`)}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={shareStats}
              className="p-2 text-foreground-muted hover:text-foreground"
              title="Partager"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground-muted hover:text-foreground"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t('filters.reset')}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border text-xs text-foreground-muted">
          <Calendar className="w-3 h-3" />
          {t('filters.lastUpdated')}:{' '}
          {new Date(data.lastUpdated).toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </section>

      {/* Empty state */}
      {hasNoData && (
        <div className="bg-background-secondary rounded-xl p-8 text-center border border-border">
          <AlertCircle className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">{t('empty.title')}</h3>
          <p className="text-foreground-muted mb-4">{t('empty.description')}</p>
          <Button variant="outline" onClick={resetFilters}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('filters.reset')}
          </Button>
        </div>
      )}

      {/* Destinations */}
      {!hasNoData && (
        <ScrollReveal direction="up" delay={100} duration={500}>
          <section id="destinations" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-background-secondary rounded-xl p-6 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {t('destinations.title')}
              </h2>
              <ExportMap
                exportsByRegion={data.exportsByRegion}
                topDestinations={data.topDestinations}
              />
            </div>

            <div className="bg-background-secondary rounded-xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {t('destinations.top')}
              </h3>
              <div className="space-y-3">
                {(filteredDestinations.length > 0 ? filteredDestinations : data.topDestinations)
                  .slice(0, 5)
                  .map((dest, idx) => (
                    <div key={dest.countryCode} className="flex items-center gap-3 group">
                      <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {typeof dest.country === 'string'
                            ? dest.country
                            : dest.country?.[locale] ||
                              dest.country?.fr ||
                              getTranslatedCountryName(dest.countryCode, locale)}
                        </p>
                        {dest.port && (
                          <p className="text-xs text-foreground-muted opacity-0 group-hover:opacity-100 transition-opacity">
                            Port: {dest.port}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-primary">{dest.percentage}%</span>
                    </div>
                  ))}
              </div>
              <Link
                href="#destinations"
                className="flex items-center gap-1 text-sm text-primary hover:underline mt-4"
              >
                {t('destinations.cta')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Volumes & Product Mix */}
      {!hasNoData && (
        <ScrollReveal direction="up" delay={150} duration={500}>
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-background-secondary rounded-xl p-6 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                {t('volumes.title')}
              </h2>
              <div className="h-80">
                <VolumeChart data={data.monthlyVolumes} lastUpdated={data.lastUpdated} />
              </div>
            </div>

            <div className="bg-background-secondary rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  {t('productMix.title')}
                </h2>
                {productFilter !== 'all' && (
                  <button
                    onClick={() => setProductFilter('all')}
                    className="text-xs px-3 py-1.5 bg-primary/15 hover:bg-primary/25 text-primary font-medium rounded-full flex items-center gap-1.5 transition-all border border-primary/30 hover:border-primary/50"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Voir tous
                  </button>
                )}
              </div>
              <p className="text-[10px] text-foreground/40 mb-5">
                Part du volume exporté (12 derniers mois) — Total :{' '}
                {data.kpi.tonnesExported.toLocaleString()} t
              </p>

              {/* Reference lines */}
              <div className="relative">
                <div className="absolute inset-0 flex pointer-events-none">
                  <div className="w-1/4 border-r border-dashed border-foreground/5" />
                  <div className="w-1/4 border-r border-dashed border-foreground/10" />
                  <div className="w-1/4 border-r border-dashed border-foreground/5" />
                </div>
                <div className="absolute top-0 left-1/4 -translate-x-1/2 text-[8px] text-foreground/25">
                  25%
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] text-foreground/25">
                  50%
                </div>
                <div className="absolute top-0 left-3/4 -translate-x-1/2 text-[8px] text-foreground/25">
                  75%
                </div>

                <div className="space-y-3 relative">
                  {(productFilter === 'all' ? data.productMix : filteredProductMix).map(
                    (product, idx) => {
                      // Harmonized warm palette (gold/brown tones)
                      const warmColors: Record<string, string> = {
                        cacao: '#c9a227',
                        cafe: '#a67c52',
                        cajou: '#d4a574',
                        sesame: '#e8c99b',
                        soja: '#b8956b',
                        autres: '#7a7a7a',
                      };
                      const barColor = warmColors[product.slug] || product.color;
                      const isSelected = productFilter === product.slug;
                      const isAutres = product.slug === 'autres';

                      // Tooltip content for "Autres"
                      const autresTooltip = isAutres
                        ? 'Hévéa 20t, Maïs 15t, Bois 10t, +2 autres'
                        : null;

                      return (
                        <button
                          key={product.slug}
                          onClick={() =>
                            setProductFilter(isSelected ? 'all' : (product.slug as ProductFilter))
                          }
                          className={`w-full text-left group relative rounded-lg p-2 -mx-2 transition-colors ${
                            isSelected
                              ? 'bg-primary/10 ring-1 ring-primary/30'
                              : 'hover:bg-foreground/5'
                          }`}
                        >
                          <div className="flex items-center justify-between text-sm mb-1.5">
                            <div className="flex items-center gap-2">
                              {/* Rang pour tous les produits */}
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold tabular-nums ${
                                  idx === 0
                                    ? 'bg-primary/25 text-primary'
                                    : idx < 3
                                      ? 'bg-foreground/10 text-foreground/60'
                                      : 'bg-foreground/5 text-foreground/40'
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <span className="text-foreground group-hover:text-primary transition-colors font-medium">
                                {product.product}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 tabular-nums">
                              <span className="text-[10px] text-foreground/35 min-w-[45px] text-right">
                                {product.volume.toLocaleString()} t
                              </span>
                              <span className="text-foreground font-semibold min-w-[32px] text-right">
                                {product.percentage}%
                              </span>
                            </div>
                          </div>
                          <div className="h-2.5 bg-foreground/8 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 group-hover:brightness-125"
                              style={{
                                width: `${product.percentage}%`,
                                backgroundColor: barColor,
                                boxShadow: idx === 0 ? `0 0 10px ${barColor}50` : 'none',
                              }}
                            />
                          </div>

                          {/* Hover tooltip - enrichi pour "Autres" */}
                          <div className="absolute left-1/2 -translate-x-1/2 -top-14 px-3 py-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl text-xs whitespace-nowrap z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium text-foreground">{product.product}</span>
                              <span className="text-foreground/30">•</span>
                              <span className="text-primary font-bold">{product.percentage}%</span>
                              <span className="text-foreground/30">•</span>
                              <span className="text-foreground/50">
                                {product.volume.toLocaleString()} t
                              </span>
                            </div>
                            {autresTooltip && (
                              <div className="text-[10px] text-foreground/40 mt-1 border-t border-border/50 pt-1">
                                {autresTooltip}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Quality */}
      <ScrollReveal direction="up" delay={0} duration={500}>
        <section className="bg-background-secondary rounded-xl p-6 md:p-8 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {t('quality.title')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QualityCard
              icon={<BarChart3 className="w-6 h-6" />}
              title={t('quality.grading.title')}
              description={t('quality.grading.description')}
            />
            <QualityCard
              icon={<Shield className="w-6 h-6" />}
              title={t('quality.traceability.title')}
              description={t('quality.traceability.description')}
            />
            <QualityCard
              icon={<Leaf className="w-6 h-6" />}
              title={t('quality.phyto.title')}
              description={t('quality.phyto.description')}
            />
            <QualityCard
              icon={<FileCheck className="w-6 h-6" />}
              title={t('quality.certifications.title')}
              description={t('quality.certifications.description')}
            />
          </div>
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              {t('quality.downloadCOA')}
            </Button>
            <Button variant="outline" size="sm">
              <FileCheck className="w-4 h-4 mr-2" />
              {t('quality.downloadOrigin')}
            </Button>
            <Link href="/a-propos#qualite">
              <Button variant="ghost" size="sm">
                {t('quality.seeProcess')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </section>
      </ScrollReveal>

      {/* Product Focus */}
      {productData && (
        <section className="bg-primary/5 rounded-xl p-6 md:p-8 border border-primary/20">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {t('productFocus.title', { product: t(`filters.products.${productFilter}`) })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-foreground mb-3">{t('productFocus.formats')}</h3>
              <div className="flex flex-wrap gap-2">
                {productData.formats.map((format) => (
                  <span
                    key={format}
                    className="px-3 py-1.5 bg-background rounded-full text-sm text-foreground border border-border"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-3">{t('productFocus.specs')}</h3>
              <div className="space-y-2">
                {productData.specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between text-sm">
                    <span className="text-foreground-muted">{spec.label}</span>
                    <span className="text-foreground font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-3">
                {t('productFocus.certifications')}
              </h3>
              <div className="space-y-1">
                {productData.certifications.map((cert) => (
                  <p key={cert} className="text-sm text-foreground-muted flex items-center gap-2">
                    <FileCheck className="w-3 h-3 text-primary" /> {cert}
                  </p>
                ))}
              </div>
            </div>
          </div>
          {productData.seasonality && (
            <p className="text-sm text-foreground-muted mt-4 pt-4 border-t border-primary/20 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> {productData.seasonality}
            </p>
          )}
        </section>
      )}

      {/* FAQ */}
      <section className="bg-background-secondary rounded-xl p-6 md:p-8 border border-border">
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          {t('faq.title')}
        </h2>
        <div className="space-y-2">
          {['volumes', 'update', 'products', 'methodology'].map((key) => (
            <div key={key} className="border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleFaq(key)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-background transition-colors"
              >
                <span className="font-medium text-foreground">{t(`faq.${key}.question`)}</span>
                {expandedFaq === key ? (
                  <ChevronUp className="w-5 h-5 text-foreground-muted" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-foreground-muted" />
                )}
              </button>
              {expandedFaq === key && (
                <div className="px-4 pb-4 text-sm text-foreground-muted">
                  {t(`faq.${key}.answer`)}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <ScrollReveal direction="up" delay={0} duration={500}>
        <section className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-8 md:p-12 text-center border border-primary/20">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{t('cta.title')}</h2>
          <p className="text-foreground-muted mb-8 max-w-xl mx-auto">{t('cta.subtitle')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/devis">
                <Ship className="w-5 h-5 mr-2" />
                {t('cta.quote')}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/devis?type=sample">
                <Package className="w-5 h-5 mr-2" />
                {t('cta.sample')}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/contact">
                <MessageSquare className="w-5 h-5 mr-2" />
                {t('cta.contact')}
              </Link>
            </Button>
          </div>
          <p className="text-sm text-foreground-muted mt-6 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            {t('cta.response')}
          </p>
        </section>
      </ScrollReveal>

      {/* Methodology */}
      <section className="text-center text-xs text-foreground-muted space-y-1">
        <p>{t('methodology.disclaimer')}</p>
        <p>{t('methodology.source')}</p>
      </section>
    </div>
  );
}

function KPICard({
  icon,
  value,
  label,
  tooltip,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tooltip?: string;
}) {
  return (
    <div className="bg-background-secondary rounded-xl p-4 border border-border text-center hover:border-primary/50 transition-colors group relative">
      <div className="text-primary mb-2 flex justify-center">{icon}</div>
      <p className="text-2xl md:text-3xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-foreground-muted">{label}</p>
      {tooltip && (
        <div
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          title={tooltip}
        >
          <Info className="w-3.5 h-3.5 text-foreground-muted cursor-help" />
        </div>
      )}
    </div>
  );
}

function QualityCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background rounded-lg p-4 border border-border hover:border-primary/30 transition-colors">
      <div className="text-primary mb-3">{icon}</div>
      <h3 className="font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-foreground-muted">{description}</p>
    </div>
  );
}

interface VolumeChartProps {
  data: { month: string; volume: number; year: number }[];
  lastUpdated: string;
}

function VolumeChart({ data, lastUpdated }: VolumeChartProps) {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);

  // Trigger animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const maxVolume = Math.max(...data.map((d) => d.volume));
  const minVolume = Math.min(...data.map((d) => d.volume));
  const avgVolume = Math.round(data.reduce((sum, d) => sum + d.volume, 0) / data.length);
  const peakIdx = data.findIndex((d) => d.volume === maxVolume);
  const lowIdx = data.findIndex((d) => d.volume === minVolume);

  const monthLabels: Record<string, string> = {
    Jan: 'Jan',
    Fév: 'Fév',
    Mar: 'Mar',
    Avr: 'Avr',
    Mai: 'Mai',
    Juin: 'Juin',
    Juil: 'Juil',
    Août: 'Août',
    Sep: 'Sep',
    Oct: 'Oct',
    Nov: 'Nov',
    Déc: 'Déc',
  };

  // Chart max = round up to nice number
  const chartMax = Math.ceil(maxVolume / 100) * 100 + 50;
  const gridLines = [0, 100, 200, 300].filter((v) => v <= chartMax);
  const chartHeight = 200;

  const year = data[0]?.year || new Date().getFullYear();

  // Calculate change with absolute delta
  const getChange = (idx: number) => {
    if (idx === 0) return null;
    const prev = data[idx - 1].volume;
    const curr = data[idx].volume;
    const delta = curr - prev;
    const percent = Math.round((delta / prev) * 100);
    return { delta, percent, prevMonth: data[idx - 1].month };
  };

  // Average line position
  const avgLineY = (avgVolume / chartMax) * chartHeight;

  return (
    <div className="h-full flex flex-col">
      {/* Header: KPIs */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="px-2 py-0.5 bg-foreground/8 rounded text-foreground/70">
            ≈ <span className="font-medium text-foreground">{avgVolume}t</span> moy.
          </span>
          <span className="px-2 py-0.5 bg-primary/20 rounded text-primary">
            ↗ <span className="font-semibold">{maxVolume}t</span> ({data[peakIdx]?.month})
          </span>
          <span className="px-2 py-0.5 bg-amber-500/20 rounded text-amber-600 dark:text-amber-400">
            ↘ <span className="font-semibold">{minVolume}t</span> ({data[lowIdx]?.month})
          </span>
        </div>
        <span className="text-[10px] text-foreground/60">Jan–Déc {year} • tonnes</span>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: chartHeight + 40 }}>
        {/* Y-axis labels with unit */}
        <div className="absolute left-0 top-0 bottom-6 w-9 flex flex-col justify-between text-[10px] text-foreground/50 tabular-nums">
          {[...gridLines].reverse().map((v) => (
            <span key={v} className="text-right pr-1">
              {v}t
            </span>
          ))}
        </div>

        {/* Grid lines */}
        <div className="absolute left-10 right-0 top-0" style={{ height: chartHeight }}>
          {gridLines.map((v) => (
            <div
              key={v}
              className="absolute left-0 right-0 border-t border-foreground/8"
              style={{ bottom: `${(v / chartMax) * 100}%` }}
            />
          ))}

          {/* Average line - gray with label on line */}
          <div
            className="absolute left-0 right-0 border-t border-dashed border-foreground/25"
            style={{ bottom: avgLineY }}
          >
            <span className="absolute right-2 -translate-y-1/2 text-[8px] font-medium text-foreground/50 bg-background/90 px-1.5 py-0.5 rounded border border-foreground/10">
              moy. {avgVolume}t
            </span>
          </div>
        </div>

        {/* Bars container */}
        <div
          className="absolute left-10 right-0 bottom-6 flex items-end gap-1"
          style={{ height: chartHeight }}
        >
          {data.map((item, idx) => {
            const isPeak = idx === peakIdx;
            const isLow = idx === lowIdx;
            const isSelected = selectedMonth === idx;
            const barHeightPx = Math.max((item.volume / chartMax) * chartHeight, 4);
            const change = getChange(idx);

            // 3D only on Peak/Low + hover (normal bars = flat clean)
            const show3D = isPeak || isLow || isSelected;

            // Animation: stagger delay per bar (50ms each)
            const animDelay = idx * 50;
            const animatedHeight = isAnimated ? barHeightPx : 0;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center group relative">
                {/* Peak label - darker bg with light border for contrast */}
                {isPeak && isAnimated && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 z-10 animate-fade-in"
                    style={{ bottom: barHeightPx + 2, animationDelay: `${animDelay + 400}ms` }}
                  >
                    <span className="text-[8px] font-semibold text-primary bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded whitespace-nowrap border border-primary/40 shadow-sm">
                      ↑ Pic
                    </span>
                  </div>
                )}

                {/* Low label */}
                {isLow && isAnimated && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 z-10 animate-fade-in"
                    style={{ bottom: barHeightPx + 2, animationDelay: `${animDelay + 400}ms` }}
                  >
                    <span className="text-[8px] font-semibold text-amber-600 dark:text-amber-400 bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded whitespace-nowrap border border-amber-500/40 shadow-sm">
                      ↓ Creux
                    </span>
                  </div>
                )}

                {/* Bar container */}
                <button
                  onClick={() => setSelectedMonth(isSelected ? null : idx)}
                  className="w-full relative group/bar"
                  style={{ height: chartHeight }}
                  aria-label={`${item.month} ${item.year}: ${item.volume} tonnes`}
                >
                  {/* Drop shadow - stronger on 3D bars */}
                  <div
                    className={`absolute bottom-0 left-1.5 right-0 rounded-t blur-[3px] transition-all ease-out ${show3D ? 'bg-black/30' : 'bg-black/15'}`}
                    style={{
                      height: Math.max(animatedHeight - 3, 0),
                      transform: show3D
                        ? 'translateX(5px) translateY(4px)'
                        : 'translateX(3px) translateY(2px)',
                      transitionDuration: `${600 + idx * 30}ms`,
                      transitionDelay: `${animDelay}ms`,
                    }}
                  />

                  {/* Right side face (3D extrusion) - ALL bars have edge, stronger on special */}
                  <div
                    className={`absolute bottom-0 rounded-tr transition-all ease-out ${
                      isPeak
                        ? 'bg-gradient-to-b from-[#9a7a4a] to-[#7a5a30] right-0 w-[6px]'
                        : isLow
                          ? 'bg-gradient-to-b from-amber-700 to-amber-800 right-0 w-[6px]'
                          : show3D
                            ? 'bg-gradient-to-b from-primary/55 to-primary/75 right-0 w-[5px]'
                            : 'bg-gradient-to-b from-primary/40 to-primary/60 right-0 w-[4px] group-hover/bar:from-primary/50 group-hover/bar:to-primary/70'
                    }`}
                    style={{
                      height: animatedHeight,
                      transitionDuration: `${600 + idx * 30}ms`,
                      transitionDelay: `${animDelay}ms`,
                    }}
                  />

                  {/* Left edge highlight (subtle light reflection) */}
                  <div
                    className={`absolute bottom-0 left-0.5 w-[1px] rounded-tl transition-all ease-out ${
                      isPeak || isLow ? 'bg-white/20' : 'bg-white/10 group-hover/bar:bg-white/15'
                    }`}
                    style={{
                      height: animatedHeight,
                      transitionDuration: `${600 + idx * 30}ms`,
                      transitionDelay: `${animDelay}ms`,
                    }}
                  />

                  {/* Main bar face */}
                  <div
                    className={`absolute bottom-0 rounded-t transition-all ease-out ${
                      isPeak
                        ? 'left-[2px] right-[6px] bg-gradient-to-t from-primary via-primary/95 to-primary/80 shadow-[0_0_12px_rgba(212,165,116,0.3)]'
                        : isLow
                          ? 'left-[2px] right-[6px] bg-gradient-to-t from-amber-600 via-amber-500/95 to-amber-500/80 shadow-[inset_0_0_8px_rgba(0,0,0,0.15)]'
                          : show3D
                            ? 'left-[2px] right-[5px] bg-gradient-to-t from-primary/90 to-primary/65 shadow-[0_0_8px_rgba(212,165,116,0.2)]'
                            : 'left-[2px] right-[4px] bg-gradient-to-t from-primary/80 to-primary/55 group-hover/bar:from-primary/90 group-hover/bar:to-primary/65 group-hover/bar:shadow-[0_0_6px_rgba(212,165,116,0.15)]'
                    } ${isSelected && !isPeak && !isLow ? 'ring-2 ring-primary/70' : ''}`}
                    style={{
                      height: animatedHeight,
                      transitionDuration: `${600 + idx * 30}ms`,
                      transitionDelay: `${animDelay}ms`,
                    }}
                  >
                    {/* Top edge highlight (brighter on 3D) */}
                    <div
                      className={`absolute inset-x-0 top-0 rounded-t ${show3D ? 'h-[3px] bg-gradient-to-r from-white/40 via-white/55 to-white/30' : 'h-[2px] bg-gradient-to-r from-white/25 via-white/35 to-white/20'}`}
                    />
                    {/* Inner glow */}
                    <div
                      className={`absolute inset-x-0 top-0 rounded-t bg-gradient-to-b from-white/15 to-transparent ${show3D ? 'h-1/3' : 'h-1/4'}`}
                    />
                  </div>

                  {/* Tooltip */}
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 px-3 py-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-xl text-xs whitespace-nowrap z-30 transition-all duration-150 pointer-events-none ${
                      isSelected ? 'opacity-100' : 'opacity-0 group-hover/bar:opacity-100'
                    }`}
                    style={{ bottom: barHeightPx + (isPeak || isLow ? 32 : 8) }}
                  >
                    <div className="font-medium text-foreground">
                      {item.month} {item.year}
                    </div>
                    <div className="text-primary font-bold text-sm">{item.volume} t</div>
                    {change && (
                      <div
                        className={`text-[10px] mt-0.5 ${change.delta >= 0 ? 'text-green-500' : 'text-red-400'}`}
                      >
                        {change.delta >= 0 ? '+' : ''}
                        {change.delta}t ({change.delta >= 0 ? '+' : ''}
                        {change.percent}%) vs {change.prevMonth}
                      </div>
                    )}
                  </div>
                </button>

                {/* Month label */}
                <span
                  className={`text-[10px] mt-1.5 transition-colors ${
                    isPeak
                      ? 'text-primary font-bold border-b-2 border-primary pb-0.5'
                      : isLow
                        ? 'text-amber-600 dark:text-amber-400 font-bold border-b-2 border-amber-500/60 pb-0.5'
                        : isSelected
                          ? 'text-primary font-medium'
                          : 'text-foreground/60 group-hover/bar:text-foreground/80'
                  }`}
                >
                  {monthLabels[item.month] || item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected month detail */}
      {selectedMonth !== null && (
        <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">
              {data[selectedMonth].month} {data[selectedMonth].year}
            </span>
            <span className="text-primary font-bold">{data[selectedMonth].volume} tonnes</span>
          </div>
          <p className="text-xs text-foreground-muted mt-1">
            {selectedMonth === peakIdx &&
              'Période de forte récolte – Disponibilité élevée pour export.'}
            {selectedMonth === lowIdx &&
              'Période creuse – Stocks limités, planifiez vos commandes.'}
            {selectedMonth !== peakIdx &&
              selectedMonth !== lowIdx &&
              'Disponibilité standard selon collecte et séchage.'}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-border/30 flex items-center justify-between text-[9px] text-foreground/50">
        <span>Note : saisonnalité liée aux cycles de récolte & logistique.</span>
        <span>
          Mise à jour :{' '}
          {new Date(lastUpdated).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}

export default StatisticsSection;
