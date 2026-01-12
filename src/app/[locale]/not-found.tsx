import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Home, Package, Mail, FileText } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Metadata } from 'next';

// Prevent 404 pages from being indexed by search engines
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <main
      id="main-content"
      className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden"
    >
      {/* Constellation background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-pulse opacity-60" />
        <div
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent rounded-full animate-pulse opacity-40"
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-primary-light rounded-full animate-pulse opacity-50"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-1 h-1 bg-accent-light rounded-full animate-pulse opacity-30"
          style={{ animationDelay: '1.5s' }}
        />
        <div
          className="absolute bottom-1/3 right-1/2 w-2 h-2 bg-primary rounded-full animate-pulse opacity-40"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* 404 Number */}
        <div className="mb-8">
          <span className="text-[150px] md:text-[200px] font-bold text-gradient-gold leading-none">
            404
          </span>
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('title')}</h1>
        <p className="text-lg text-foreground-muted mb-12 max-w-md mx-auto">{t('message')}</p>

        {/* Navigation Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link href="/">
            <Button variant="primary" size="lg" className="gap-2">
              <Home className="w-5 h-5" />
              {t('backHome')}
            </Button>
          </Link>
          <Link href="/produits">
            <Button variant="secondary" size="lg" className="gap-2">
              <Package className="w-5 h-5" />
              {t('products')}
            </Button>
          </Link>
        </div>

        {/* Secondary Links */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <Link
            href="/contact"
            className="text-foreground-muted hover:text-primary transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            {t('contact')}
          </Link>
          <Link
            href="/devis"
            className="text-foreground-muted hover:text-primary transition-colors flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {t('quote')}
          </Link>
        </div>
      </div>
    </main>
  );
}
