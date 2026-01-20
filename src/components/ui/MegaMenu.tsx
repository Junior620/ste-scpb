'use client';

import { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Button } from './Button';
import { Bean, Coffee, TreeDeciduous, Wheat, Leaf, CircleDot, Star } from 'lucide-react';

export interface ProductCategory {
  id: string;
  slug: string;
  labelKey: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface NavItem {
  labelKey: string;
  href: string;
  children?: NavItem[];
}

export interface MegaMenuProps {
  /** Product categories for the mega menu */
  productCategories?: ProductCategory[];
  /** Additional CSS classes */
  className?: string;
}

const DEFAULT_PRODUCT_CATEGORIES: ProductCategory[] = [
  { id: 'cacao', slug: 'cacao', labelKey: 'cacao', icon: Bean },
  { id: 'cafe', slug: 'cafe', labelKey: 'cafe', icon: Coffee },
  { id: 'bois', slug: 'bois', labelKey: 'bois', icon: TreeDeciduous },
  { id: 'mais', slug: 'mais', labelKey: 'mais', icon: Wheat },
  { id: 'hevea', slug: 'hevea', labelKey: 'hevea', icon: Leaf },
  { id: 'sesame', slug: 'sesame', labelKey: 'sesame', icon: CircleDot },
  { id: 'cajou', slug: 'cajou', labelKey: 'cajou', icon: CircleDot },
  { id: 'amandes', slug: 'amandes', labelKey: 'amandes', icon: CircleDot },
  { id: 'sorgho', slug: 'sorgho', labelKey: 'sorgho', icon: Wheat },
  { id: 'soja', slug: 'soja', labelKey: 'soja', icon: Leaf },
];

const NAV_ITEMS: NavItem[] = [
  { labelKey: 'home', href: '/' },
  { labelKey: 'products', href: '/produits' },
  { labelKey: 'about', href: '/a-propos' },
  { labelKey: 'team', href: '/equipe' },
  { labelKey: 'news', href: '/actualites' },
  { labelKey: 'contact', href: '/contact' },
];

/**
 * MegaMenu Component
 * Desktop mega menu with product categories and mobile hamburger menu
 * Fully accessible with keyboard navigation
 */
export function MegaMenu({
  productCategories = DEFAULT_PRODUCT_CATEGORIES,
  className = '',
}: MegaMenuProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const productsButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProductsMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsProductsMenuOpen(false);
        setIsMobileMenuOpen(false);
        productsButtonRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change using useLayoutEffect
  // This runs synchronously after DOM mutations but before paint
  useLayoutEffect(() => {
    // Close menus when pathname changes - this is intentional behavior
    setIsMobileMenuOpen(false);
    setIsMobileProductsOpen(false);
  }, [pathname]);

  const handleProductsKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setIsProductsMenuOpen((prev) => !prev);
      }
      if (event.key === 'ArrowDown' && isProductsMenuOpen) {
        event.preventDefault();
        const firstLink =
          menuRef.current?.querySelector<HTMLAnchorElement>('[data-mega-menu-item]');
        firstLink?.focus();
      }
    },
    [isProductsMenuOpen]
  );

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border ${className}`}
    >
      <nav className="container mx-auto px-4" aria-label="Main navigation">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-primary transition-colors"
          >
            <span className="text-gradient-gold">STE-SCPB</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1" ref={menuRef}>
            {NAV_ITEMS.map((item) => {
              if (item.labelKey === 'products') {
                return (
                  <div key={item.labelKey} className="relative">
                    <button
                      ref={productsButtonRef}
                      onClick={() => setIsProductsMenuOpen(!isProductsMenuOpen)}
                      onKeyDown={handleProductsKeyDown}
                      aria-expanded={isProductsMenuOpen}
                      aria-haspopup="true"
                      className={`
                        flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium
                        transition-colors
                        focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
                        ${
                          isActive(item.href)
                            ? 'text-primary bg-primary/10'
                            : 'text-foreground-muted hover:text-foreground hover:bg-background-tertiary'
                        }
                      `}
                    >
                      {t(`nav.${item.labelKey}`)}
                      <svg
                        className={`h-4 w-4 transition-transform ${isProductsMenuOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Mega Menu Dropdown */}
                    {isProductsMenuOpen && (
                      <div
                        className="absolute left-0 top-full mt-2 w-[600px] bg-background-secondary border border-border rounded-xl shadow-lg p-6"
                        role="menu"
                        aria-label={t('nav.products')}
                      >
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-foreground mb-2">
                            {t('products.title')}
                          </h3>
                          <p className="text-sm text-foreground-muted">{t('products.subtitle')}</p>
                        </div>
                        {/* Featured: Cacao */}
                        <div className="col-span-3 mb-4 p-4 bg-primary/10 rounded-lg border border-primary/30">
                          <Link
                            href="/produits/cacao"
                            data-mega-menu-item
                            role="menuitem"
                            onClick={() => setIsProductsMenuOpen(false)}
                            className="flex items-center gap-4 group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                              <Star className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                {t('products.categories.cacao')}
                              </span>
                              <span className="block text-sm text-foreground-muted">
                                {t('nav.featuredProduct')}
                              </span>
                            </div>
                            <svg
                              className="h-5 w-5 ml-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Link>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {productCategories
                            .filter((c) => c.id !== 'cacao')
                            .map((category) => {
                              const IconComponent = category.icon;
                              return (
                                <Link
                                  key={category.id}
                                  href={`/produits/${category.slug}`}
                                  data-mega-menu-item
                                  role="menuitem"
                                  onClick={() => setIsProductsMenuOpen(false)}
                                  className="
                                  flex items-center gap-3 p-3 rounded-lg
                                  text-foreground-muted hover:text-foreground
                                  hover:bg-background-tertiary
                                  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset
                                  transition-colors
                                "
                                >
                                  {IconComponent && (
                                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                                  )}
                                  <span className="text-sm font-medium break-words hyphens-auto">
                                    {t(`products.categories.${category.labelKey}`)}
                                  </span>
                                </Link>
                              );
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                          <Link
                            href="/produits"
                            onClick={() => setIsProductsMenuOpen(false)}
                            className="
                              inline-flex items-center gap-2 text-sm font-medium text-primary
                              hover:text-primary-light transition-colors
                            "
                          >
                            {t('common.seeAll')}
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.labelKey}
                  href={item.href}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium
                    transition-colors
                    focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
                    ${
                      isActive(item.href)
                        ? 'text-primary bg-primary/10'
                        : 'text-foreground-muted hover:text-foreground hover:bg-background-tertiary'
                    }
                  `}
                >
                  {t(`nav.${item.labelKey}`)}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher variant="dropdown" showFlags showLabels={false} />
            <Button variant="primary" size="sm" asChild>
              <Link href="/devis">{t('nav.quote')}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={
              isMobileMenuOpen ? t('accessibility.closeMenu') : t('accessibility.openMenu')
            }
            className="
              lg:hidden p-2 rounded-lg text-foreground-muted
              hover:text-foreground hover:bg-background-tertiary
              focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
              transition-colors
            "
          >
            {isMobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            ref={mobileMenuRef}
            className="lg:hidden fixed inset-0 top-16 bg-background z-50 overflow-y-auto"
          >
            <div className="container mx-auto px-4 py-6">
              <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
                {NAV_ITEMS.map((item) => {
                  if (item.labelKey === 'products') {
                    return (
                      <div key={item.labelKey}>
                        <button
                          onClick={() => setIsMobileProductsOpen(!isMobileProductsOpen)}
                          aria-expanded={isMobileProductsOpen}
                          className={`
                            flex items-center justify-between w-full px-4 py-3 rounded-lg text-base font-medium
                            transition-colors
                            ${
                              isActive(item.href)
                                ? 'text-primary bg-primary/10'
                                : 'text-foreground hover:bg-background-tertiary'
                            }
                          `}
                        >
                          {t(`nav.${item.labelKey}`)}
                          <svg
                            className={`h-5 w-5 transition-transform ${isMobileProductsOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>

                        {isMobileProductsOpen && (
                          <div className="mt-2 ml-4 flex flex-col gap-1">
                            {productCategories.map((category) => (
                              <Link
                                key={category.id}
                                href={`/produits/${category.slug}`}
                                className="
                                  px-4 py-2 rounded-lg text-sm
                                  text-foreground-muted hover:text-foreground
                                  hover:bg-background-tertiary
                                  transition-colors break-words hyphens-auto
                                "
                              >
                                {t(`products.categories.${category.labelKey}`)}
                              </Link>
                            ))}
                            <Link
                              href="/produits"
                              className="
                                px-4 py-2 rounded-lg text-sm font-medium
                                text-primary hover:text-primary-light
                                transition-colors
                              "
                            >
                              {t('common.seeAll')}
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.labelKey}
                      href={item.href}
                      className={`
                        px-4 py-3 rounded-lg text-base font-medium
                        transition-colors
                        ${
                          isActive(item.href)
                            ? 'text-primary bg-primary/10'
                            : 'text-foreground hover:bg-background-tertiary'
                        }
                      `}
                    >
                      {t(`nav.${item.labelKey}`)}
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Actions */}
              <div className="mt-6 pt-6 border-t border-border flex flex-col gap-4">
                <LanguageSwitcher
                  variant="toggle"
                  showFlags
                  showLabels
                  className="justify-center"
                />
                <Button variant="primary" fullWidth asChild>
                  <Link href="/devis">{t('nav.quote')}</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default MegaMenu;
