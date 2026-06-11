'use client';

import type { ComponentProps } from 'react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';

type AppHref = ComponentProps<typeof Link>['href'];

export interface SolutionHeroProps {
  badge?: string;
  title: string;
  subtitle: string;
  primaryCta?: {
    href: AppHref;
    label: string;
  };
  secondaryCta?: {
    href: AppHref;
    label: string;
  };
}

export function SolutionHero({
  badge,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
}: SolutionHeroProps) {
  return (
    <section className="relative pt-8 pb-16 md:pb-20 bg-gradient-to-b from-primary/10 via-background to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {badge && (
            <span className="inline-block text-sm font-semibold text-primary uppercase tracking-wide mb-4">
              {badge}
            </span>
          )}
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">{title}</h1>
          <p className="text-lg md:text-xl text-foreground-muted leading-relaxed mb-8">
            {subtitle}
          </p>
          {(primaryCta || secondaryCta) && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {primaryCta && (
                <Link href={primaryCta.href}>
                  <Button variant="primary" size="lg" className="min-w-[220px] glow-gold">
                    {primaryCta.label}
                  </Button>
                </Link>
              )}
              {secondaryCta && (
                <Link href={secondaryCta.href}>
                  <Button variant="outline" size="lg" className="min-w-[220px]">
                    {secondaryCta.label}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default SolutionHero;
