'use client';

/**
 * Blog Section Component
 * Validates: Requirements 7.1, 7.3
 *
 * Displays articles in a grid format with:
 * - Featured image, title, excerpt, date
 * - Category/tag filtering
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import type { ArticleListItem, ArticleCategory } from '@/domain/entities/Article';
import { formatArticleDate } from '@/domain/entities/Article';
import type { Locale } from '@/domain/value-objects/Locale';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/Card';
import {
  Scene3DWrapper,
  Starfield,
  Constellation,
  PostProcessing,
  StaticHeroFallback,
} from '@/components/3d';
import { usePerformanceMode } from '@/hooks/usePerformanceMode';
import { Pagination, PaginationInfo } from '@/components/ui/Pagination';

export interface BlogSectionProps {
  articles: ArticleListItem[];
  categories?: ArticleCategory[];
  initialCategory?: string;
  locale: Locale;
  itemsPerPage?: number;
  initialPage?: number;
}

/**
 * 3D Scene for blog hero
 */
function BlogHeroScene() {
  const { config } = usePerformanceMode();

  const constellationConfig = {
    nodes: [
      { id: 'blog-1', position: [-3, 1.5, 0] as [number, number, number], size: 0.2, label: '' },
      { id: 'blog-2', position: [3, 1.5, 0] as [number, number, number], size: 0.2, label: '' },
      { id: 'blog-3', position: [0, -1, 0] as [number, number, number], size: 0.25, label: '' },
      { id: 'blog-4', position: [-1.5, 0.5, 0] as [number, number, number], size: 0.15, label: '' },
      { id: 'blog-5', position: [1.5, 0.5, 0] as [number, number, number], size: 0.15, label: '' },
    ],
    connections: [
      [0, 3],
      [3, 2],
      [2, 4],
      [4, 1],
      [0, 4],
      [1, 3],
    ] as [number, number][],
    color: '#fbbf24',
    glowIntensity: 0.8,
    animationSpeed: 0.5,
  };

  return (
    <>
      <Starfield
        config={config}
        color="#ffffff"
        secondaryColor="#fbbf24"
        depth={30}
        parallaxIntensity={0.05}
        enableParallax={true}
      />
      <Constellation config={constellationConfig} isActive={true} />
      <PostProcessing config={config} />
      <ambientLight intensity={0.3} />
    </>
  );
}

/**
 * Category filter component
 */
function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  locale,
}: {
  categories: ArticleCategory[];
  selectedCategory: string | null;
  onCategoryChange: (categorySlug: string | null) => void;
  locale: Locale;
}) {
  const tCommon = useTranslations('common');

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
        {tCommon('seeAll')}
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.slug)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedCategory === category.slug
              ? 'bg-primary text-primary-foreground'
              : 'bg-background-secondary text-foreground-muted hover:bg-background-tertiary'
          }`}
          aria-pressed={selectedCategory === category.slug}
        >
          {category.name[locale]}
        </button>
      ))}
    </div>
  );
}

/**
 * Article card component
 * Validates: Requirements 7.1
 */
function ArticleCard({ article, locale }: { article: ArticleListItem; locale: Locale }) {
  const t = useTranslations('news');

  return (
    <Link href={`/actualites/${article.slug}`}>
      <Card variant="default" interactive className="h-full group">
        {/* Featured Image */}
        {article.featuredImage && (
          <div className="relative aspect-video overflow-hidden rounded-t-xl -mx-4 -mt-4 md:-mx-6 md:-mt-6 mb-4">
            <Image
              src={article.featuredImage.url}
              alt={article.featuredImage.alt[locale]}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {/* Category badge */}
            {article.category && (
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                {article.category.name[locale]}
              </span>
            )}
          </div>
        )}

        <CardHeader className="mb-2">
          <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
            {article.title[locale]}
          </CardTitle>
          <CardDescription className="line-clamp-3">{article.excerpt[locale]}</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Publication date */}
          <div className="flex items-center gap-2 text-sm text-foreground-muted">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <time dateTime={article.publishedAt.toISOString()}>
              {t('publishedOn')} {formatArticleDate(article.publishedAt, locale)}
            </time>
          </div>
        </CardContent>

        <CardFooter>
          <span className="text-primary text-sm font-medium group-hover:underline">
            {t('readMore')} →
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}

/**
 * Main Blog Section component
 */
export function BlogSection({
  articles,
  categories = [],
  initialCategory,
  locale,
  itemsPerPage = 9,
  initialPage = 1,
}: BlogSectionProps) {
  const t = useTranslations('news');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory ?? null);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Extract unique categories from articles if not provided
  const availableCategories = useMemo(() => {
    if (categories.length > 0) return categories;

    const categoryMap = new Map<string, ArticleCategory>();
    articles.forEach((article) => {
      if (article.category && !categoryMap.has(article.category.id)) {
        categoryMap.set(article.category.id, article.category);
      }
    });
    return Array.from(categoryMap.values());
  }, [articles, categories]);

  // Filter articles by category
  const filteredArticles = useMemo(() => {
    if (!selectedCategory) return articles;
    return articles.filter((a) => a.category?.slug === selectedCategory);
  }, [articles, selectedCategory]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredArticles.slice(startIndex, endIndex);
  }, [filteredArticles, currentPage, itemsPerPage]);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Update URL when category or page changes
  useEffect(() => {
    const url = new URL(window.location.href);

    // Update category parameter
    if (selectedCategory) {
      url.searchParams.set('category', selectedCategory);
    } else {
      url.searchParams.delete('category');
    }

    // Update page parameter
    if (currentPage > 1) {
      url.searchParams.set('page', currentPage.toString());
    } else {
      url.searchParams.delete('page');
    }

    window.history.replaceState({}, '', url.toString());
  }, [selectedCategory, currentPage]);

  // Handle category change
  const handleCategoryChange = useCallback((categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top of articles section
    const articlesSection = document.getElementById('articles-grid');
    if (articlesSection) {
      articlesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <section className="relative" aria-label={t('title')}>
      {/* 3D Hero */}
      <div className="relative h-[40vh] min-h-[300px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Scene3DWrapper
            className="h-full w-full"
            fallback={<StaticHeroFallback starCount={100} />}
            camera={{ position: [0, 0, 8], fov: 60 }}
          >
            <BlogHeroScene />
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

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Category Filter */}
        {availableCategories.length > 0 && (
          <CategoryFilter
            categories={availableCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            locale={locale}
          />
        )}

        {/* Pagination Info */}
        {filteredArticles.length > 0 && (
          <div className="flex justify-center mb-6">
            <PaginationInfo
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredArticles.length}
              locale={locale}
            />
          </div>
        )}

        {/* Articles Grid */}
        <div id="articles-grid">
          {paginatedArticles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedArticles.map((article) => (
                <ArticleCard key={article.id} article={article} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-foreground-muted text-lg">
                {articles.length === 0
                  ? locale === 'fr'
                    ? 'Aucun article disponible pour le moment.'
                    : 'No articles available at the moment.'
                  : locale === 'fr'
                    ? 'Aucun article dans cette catégorie.'
                    : 'No articles in this category.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredArticles.length > itemsPerPage && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showFirstLast={true}
              maxVisiblePages={5}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default BlogSection;
