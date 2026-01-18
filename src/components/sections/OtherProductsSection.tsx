'use client';

/**
 * Other Products Section
 * Displays complementary products with descriptions, SEO tags, and B2B advantages
 * Hover effect shows product image from Sanity CMS
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import {
  Coffee,
  TreeDeciduous,
  Wheat,
  Leaf,
  Droplets,
  Sprout,
  CheckCircle,
  Phone,
  Globe,
  ArrowRight,
  Ship,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui';
import type { Product } from '@/domain/entities/Product';

// Custom Cashew icon
const CashewIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className={className}
  >
    <path d="M6 8c2-4 8-4 10 0c2 4 0 10-4 12c-4-2-8-8-6-12z" />
  </svg>
);

// Other products with icons
const OTHER_PRODUCTS = [
  { key: 'cafe', Icon: Coffee, slug: 'cafe' },
  { key: 'cajou', Icon: CashewIcon, slug: 'cajou' },
  { key: 'sesame', Icon: Sprout, slug: 'sesame' },
  { key: 'soja', Icon: Leaf, slug: 'soja' },
  { key: 'bois', Icon: TreeDeciduous, slug: 'bois' },
  { key: 'mais', Icon: Wheat, slug: 'mais' },
  { key: 'hevea', Icon: Droplets, slug: 'hevea' },
] as const;

// Common advantages - expanded for B2B
const COMMON_ADVANTAGES = [
  'qualityControl',
  'exportPackaging',
  'documentation',
  'traceability',
  'incoterms',
  'volumes',
] as const;

export interface OtherProductsSectionProps {
  products?: Product[];
}

// Normalize slug for matching (remove accents, lowercase)
const normalizeSlug = (slug: string): string => {
  return slug
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, ''); // Remove special chars
};

export function OtherProductsSection({ products = [] }: OtherProductsSectionProps) {
  const t = useTranslations('otherProducts');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  // Create a map of normalized slug -> product for flexible matching
  const productMap = new Map(products.map((p) => [normalizeSlug(p.slug), p]));

  // Debug: log products received
  if (typeof window !== 'undefined' && products.length > 0) {
    console.log(
      'OtherProductsSection products:',
      products.map((p) => ({
        slug: p.slug,
        normalized: normalizeSlug(p.slug),
        hasImage: !!p.images?.[0]?.url,
      }))
    );
  }

  return (
    <section className="py-16 md:py-24 bg-background-secondary">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('title')}</h2>
          <p className="text-lg text-foreground-muted">{t('subtitle')}</p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {OTHER_PRODUCTS.map(({ key, Icon, slug }) => {
            const product = productMap.get(normalizeSlug(slug));
            const imageUrl = product?.images?.[0]?.url;
            const isHovered = hoveredProduct === key;

            return (
              <Link
                key={key}
                href={`/produits/${slug}`}
                className="group relative bg-background rounded-xl p-6 border border-border hover:border-primary/50 transition-all hover:shadow-lg overflow-hidden"
                onMouseEnter={() => setHoveredProduct(key)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Background image on hover */}
                {imageUrl && (
                  <div
                    className={`absolute inset-0 transition-opacity duration-300 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Image
                      src={imageUrl}
                      alt={t(`products.${key}.name`)}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      loading="lazy"
                    />
                    {/* Dark overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
                  </div>
                )}

                <div
                  className={`relative z-10 flex flex-col h-full transition-colors duration-300 ${isHovered && imageUrl ? 'text-white' : ''}`}
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        isHovered && imageUrl
                          ? 'bg-white/20 backdrop-blur-sm'
                          : 'bg-primary/10 group-hover:bg-primary/20'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${isHovered && imageUrl ? 'text-white' : 'text-primary'}`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`font-semibold mb-1 ${isHovered && imageUrl ? 'text-white' : 'text-foreground'}`}
                      >
                        {t(`products.${key}.name`)}
                      </h3>
                      <p
                        className={`text-sm ${isHovered && imageUrl ? 'text-white/80' : 'text-foreground-muted'}`}
                      >
                        {t(`products.${key}.desc`)}
                      </p>
                    </div>
                  </div>
                  {/* SEO tag */}
                  <p
                    className={`text-xs mt-auto pt-3 border-t ${
                      isHovered && imageUrl
                        ? 'text-white/60 border-white/20'
                        : 'text-foreground-muted/70 border-border/50'
                    }`}
                  >
                    {t(`products.${key}.seo`)}
                  </p>
                  {/* Hover CTA */}
                  <div
                    className={`flex items-center gap-1 text-sm font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isHovered && imageUrl ? 'text-white' : 'text-primary'
                    }`}
                  >
                    {t('viewSpecs')}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Common Advantages - Enhanced B2B */}
        <div className="bg-background rounded-2xl p-8 md:p-10 border border-border">
          <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6 text-center">
            {t('advantages.title')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {COMMON_ADVANTAGES.map((advantage) => (
              <div key={advantage} className="flex items-center gap-3">
                {advantage === 'incoterms' ? (
                  <Ship className="w-5 h-5 text-primary flex-shrink-0" />
                ) : advantage === 'volumes' ? (
                  <Package className="w-5 h-5 text-primary flex-shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
                <span className="text-foreground">{t(`advantages.${advantage}`)}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/devis">
              <Button variant="primary" size="lg">
                <Phone className="w-4 h-4 mr-2" />
                {t('cta.quote')}
              </Button>
            </Link>
            <Link href="/statistiques">
              <Button variant="outline" size="lg">
                <Globe className="w-4 h-4 mr-2" />
                {t('cta.destinations')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default OtherProductsSection;
