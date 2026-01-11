'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  // Generate JSON-LD for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && { item: item.href }),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center text-sm text-foreground-muted ${className}`}
      >
        <ol className="flex items-center flex-wrap gap-1">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isFirst = index === 0;

            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 mx-1 flex-shrink-0" aria-hidden="true" />
                )}
                {isLast ? (
                  <span
                    className="text-foreground font-medium truncate max-w-[200px] md:max-w-[300px]"
                    aria-current="page"
                    title={item.label}
                  >
                    {item.label}
                  </span>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-primary transition-colors flex items-center gap-1 truncate max-w-[150px] md:max-w-[200px]"
                    title={item.label}
                  >
                    {isFirst && <Home className="w-4 h-4 flex-shrink-0" aria-hidden="true" />}
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                ) : (
                  <span className="truncate max-w-[150px] md:max-w-[200px]" title={item.label}>
                    {isFirst && <Home className="w-4 h-4 inline mr-1" aria-hidden="true" />}
                    <span className="hidden sm:inline">{item.label}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
