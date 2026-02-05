'use client';

/**
 * Products Section Component
 * Validates: Requirements 2.1
 *
 * Displays products as interactive constellation nodes with:
 * - Category filtering
 * - 3D constellation navigation
 * - Product grid view
 */

import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import type { Product, ProductCategory } from '@/domain/entities/Product';
import { PRODUCT_CATEGORIES } from '@/domain/entities/Product';
import type { Locale } from '@/domain/value-objects/Locale';
import {
  Scene3DWrapper,
  Starfield,
  Constellation,
  PostProcessing,
  StaticHeroFallback,
} from '@/components/3d';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';
import { PRODUCT_CONSTELLATIONS, PRODUCT_COLORS } from '@/lib/scene-presets';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/Card';
import { ScrollReveal } from '@/components/ui';
// Button import removed - not currently used

export interface ProductsSectionProps {
  products: Product[];
  initialCategory?: ProductCategory;
  initialSearchQuery?: string;
  locale: Locale;
}

/**
 * Category filter button component
 */
function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
}: {
  categories: readonly ProductCategory[];
  selectedCategory: ProductCategory | null;
  onCategoryChange: (category: ProductCategory | null) => void;
}) {
  const t = useTranslations('products.categories');

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      <button
        onClick={() => onCategoryChange(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          selectedCategory === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-background-secondary text-foreground-muted hover:bg-background-tertiary'
        }`}
        aria-pressed={selectedCategory === null}
      >
        {useTranslations('common')('seeAll')}
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedCategory === category
              ? 'bg-primary text-primary-foreground'
              : 'bg-background-secondary text-foreground-muted hover:bg-background-tertiary'
          }`}
          style={{
            borderColor: selectedCategory === category ? PRODUCT_COLORS[category] : undefined,
          }}
          aria-pressed={selectedCategory === category}
        >
          {t(category)}
        </button>
      ))}
    </div>
  );
}

/**
 * 3D Scene for products constellation
 */
function ProductsScene({
  selectedCategory,
  onNodeClick,
}: {
  selectedCategory: ProductCategory | null;
  onNodeClick?: (nodeId: string) => void;
}) {
  const { config } = usePerformanceMode();

  // Get constellation config for selected category or default
  const constellationConfig = selectedCategory
    ? PRODUCT_CONSTELLATIONS[selectedCategory]
    : {
        nodes: PRODUCT_CATEGORIES.map((cat, index) => ({
          id: cat,
          position: [
            Math.cos((index / PRODUCT_CATEGORIES.length) * Math.PI * 2) * 3,
            Math.sin((index / PRODUCT_CATEGORIES.length) * Math.PI * 2) * 3,
            0,
          ] as [number, number, number],
          size: 0.3,
          label: cat,
        })),
        connections: PRODUCT_CATEGORIES.map((_, i) => [i, (i + 1) % PRODUCT_CATEGORIES.length]) as [
          number,
          number,
        ][],
        color: '#fbbf24',
        glowIntensity: 1.0,
        animationSpeed: 0.8,
      };

  return (
    <>
      <Starfield
        config={config}
        color="#ffffff"
        secondaryColor={selectedCategory ? PRODUCT_COLORS[selectedCategory] : '#fbbf24'}
        depth={30}
        parallaxIntensity={0.05}
        enableParallax={true}
      />
      <Constellation config={constellationConfig} isActive={true} onNodeClick={onNodeClick} />
      <PostProcessing config={config} />
      <ambientLight intensity={0.3} />
    </>
  );
}

/**
 * Get product badge based on category (B2B relevant info)
 */
function getProductBadge(category: ProductCategory, t: ReturnType<typeof useTranslations>): string {
  const badges: Record<ProductCategory, string> = {
    cacao: t('badges.gradeExport'),
    cafe: t('badges.gradeExport'),
    bois: t('badges.flegt'),
    mais: t('badges.gradeExport'),
    hevea: t('badges.industrial'),
    sesame: t('badges.gradeExport'),
    cajou: t('badges.gradeExport'),
    soja: t('badges.nonOgm'),
    amandes: t('badges.gradeExport'),
    sorgho: t('badges.gradeExport'),
    poivre: t('badges.gradeExport'),
  };
  return badges[category] || t('badges.gradeExport');
}

/**
 * Get product tagline based on category
 */
function getProductTagline(category: ProductCategory, locale: Locale): string {
  const taglines: Record<ProductCategory, { fr: string; en: string; ru: string }> = {
    cacao: {
      fr: 'Fèves fermentées – Grade export',
      en: 'Fermented beans – Export grade',
      ru: 'Ферментированные бобы – Экспортный сорт',
    },
    cafe: {
      fr: 'Arabica & Robusta – Grade export',
      en: 'Arabica & Robusta – Export grade',
      ru: 'Арабика и Робуста – Экспортный сорт',
    },
    bois: {
      fr: 'Essences légales – Traçabilité FLEGT',
      en: 'Legal species – FLEGT traceability',
      ru: 'Легальные породы – Отслеживаемость FLEGT',
    },
    mais: {
      fr: 'Grade alimentaire – Séché & trié',
      en: 'Food grade – Dried & sorted',
      ru: 'Пищевой сорт – Сушеная и отсортированная',
    },
    hevea: {
      fr: 'Latex / caoutchouc – Grade industriel',
      en: 'Latex / rubber – Industrial grade',
      ru: 'Латекс / каучук – Промышленный сорт',
    },
    sesame: {
      fr: 'Décortiqué – Pureté 99%',
      en: 'Hulled – 99% purity',
      ru: 'Очищенный – Чистота 99%',
    },
    cajou: {
      fr: 'Calibre W320/W240 – Qualité export',
      en: 'W320/W240 grade – Export quality',
      ru: 'Калибр W320/W240 – Экспортное качество',
    },
    soja: {
      fr: 'Non-OGM (selon lots) – Haute protéine',
      en: 'Non-GMO (per batch) – High protein',
      ru: 'Без ГМО (по партиям) – Высокий белок',
    },
    amandes: {
      fr: 'Qualité premium – Grade export',
      en: 'Premium quality – Export grade',
      ru: 'Премиум качество – Экспортный сорт',
    },
    sorgho: {
      fr: 'Grade alimentaire – Trié & calibré',
      en: 'Food grade – Sorted & calibrated',
      ru: 'Пищевой сорт – Отсортированное и калиброванное',
    },
    poivre: {
      fr: 'Qualité premium – Arôme intense',
      en: 'Premium quality – Intense aroma',
      ru: 'Премиум качество – Интенсивный аромат',
    },
  };
  return taglines[category]?.[locale] || taglines[category]?.fr || '';
}

/**
 * Product card component - B2B optimized
 */
function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const t = useTranslations('products');
  const categoryColor = PRODUCT_COLORS[product.category];

  // Get image URL with fallback
  const imageUrl = product.images?.[0]?.url || '/images/placeholder-product.svg';
  const imageAlt = product.images?.[0]?.alt?.[locale] || product.name[locale];
  const hasValidImage = imageUrl && !imageUrl.includes('placeholder');

  // Get B2B badge and tagline
  const badge = getProductBadge(product.category, t);
  const tagline = getProductTagline(product.category, locale);

  return (
    <Link href={`/produits/${product.slug}`} className="block h-full">
      <Card
        variant="glow"
        interactive
        className="h-full group cursor-pointer transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl"
        style={{ '--glow-color': categoryColor } as React.CSSProperties}
      >
        {/* Product Image */}
        <div className="relative aspect-video overflow-hidden rounded-t-xl -mx-4 -mt-4 md:-mx-6 md:-mt-6 mb-4">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />
          {/* B2B Badge (not category name - more useful info) */}
          <span
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm"
            style={{ backgroundColor: `${categoryColor}dd` }}
          >
            {badge}
          </span>
          {/* Placeholder fallback */}
          {!hasValidImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-background-secondary">
              <span className="text-foreground-muted text-sm">Image non disponible</span>
            </div>
          )}
        </div>

        <CardHeader className="mb-2">
          <CardTitle className="text-xl group-hover:text-primary transition-colors capitalize">
            {product.name[locale]}
          </CardTitle>
          {/* Product tagline - 1 line B2B description */}
          <CardDescription className="text-sm text-foreground-muted mt-1">
            {tagline}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-grow">
          {/* Origin if available */}
          {product.origin.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-foreground-muted mb-2">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{product.origin.join(', ')}</span>
            </div>
          )}

          {/* Certifications badges */}
          {product.certifications.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.certifications.slice(0, 3).map((cert) => (
                <span
                  key={cert}
                  className="px-2 py-0.5 bg-background-tertiary rounded text-xs text-foreground-muted"
                >
                  {cert}
                </span>
              ))}
              {product.certifications.length > 3 && (
                <span className="px-2 py-0.5 text-xs text-foreground-muted">
                  +{product.certifications.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-4 border-t border-border/50">
          <span className="text-primary text-sm font-medium group-hover:underline flex items-center gap-1">
            {t('details.requestQuote')}
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

/**
 * Main Products Section component
 */
export function ProductsSection({
  products,
  initialCategory,
  initialSearchQuery,
  locale,
}: ProductsSectionProps) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(
    initialCategory ?? null
  );
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery ?? '');

  // Filter products by category and search query
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by category
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const name = p.name[locale]?.toLowerCase() || '';
        const description = p.description?.[locale]?.toLowerCase() || '';
        const category = p.category.toLowerCase();
        const certifications = p.certifications.join(' ').toLowerCase();
        const origin = p.origin.join(' ').toLowerCase();

        return (
          name.includes(query) ||
          description.includes(query) ||
          category.includes(query) ||
          certifications.includes(query) ||
          origin.includes(query)
        );
      });
    }

    return result;
  }, [products, selectedCategory, searchQuery, locale]);

  // Handle category change
  const handleCategoryChange = useCallback((category: ProductCategory | null) => {
    setSelectedCategory(category);
    // Update URL without navigation
    const url = new URL(window.location.href);
    if (category) {
      url.searchParams.set('category', category);
    } else {
      url.searchParams.delete('category');
    }
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Handle search change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Update URL with search query
    const url = new URL(window.location.href);
    if (value.trim()) {
      url.searchParams.set('q', value.trim());
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Handle constellation node click
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (PRODUCT_CATEGORIES.includes(nodeId as ProductCategory)) {
        handleCategoryChange(nodeId as ProductCategory);
      }
    },
    [handleCategoryChange]
  );

  return (
    <section className="relative" aria-label={t('title')}>
      {/* 3D Constellation Header */}
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Scene3DWrapper
            className="h-full w-full"
            fallback={<StaticHeroFallback starCount={100} />}
            camera={{ position: [0, 0, 8], fov: 60 }}
          >
            <ProductsScene selectedCategory={selectedCategory} onNodeClick={handleNodeClick} />
          </Scene3DWrapper>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-background/30 to-background" />

        {/* Title overlay */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl holographic">
            {t('title')}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-foreground-muted">{t('subtitle')}</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="container mx-auto px-4 py-8">
        {/* Search Input */}
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <input
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={tCommon('search')}
              className="w-full px-4 py-3 pl-12 rounded-full bg-background-secondary border border-border/50 text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              aria-label={tCommon('search')}
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <CategoryFilter
          categories={PRODUCT_CATEGORIES}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <ScrollReveal key={product.id} direction="up" delay={index * 50} duration={500}>
                <ProductCard product={product} locale={locale} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-foreground-muted text-lg">
              {products.length === 0
                ? 'Aucun produit disponible pour le moment.'
                : 'Aucun produit dans cette catégorie.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductsSection;
