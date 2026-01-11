'use client';

/**
 * About Page Sections with ScrollReveal animations
 * Client components for values and stats sections
 */

import { Award, Eye, Globe, Handshake, TrendingUp, Users, Package } from 'lucide-react';
import { ScrollReveal } from '@/components/ui';

type IconName = 'Award' | 'Eye' | 'Globe' | 'Handshake' | 'TrendingUp' | 'Users' | 'Package';

const iconMap: Record<IconName, typeof Award> = {
  Award,
  Eye,
  Globe,
  Handshake,
  TrendingUp,
  Users,
  Package,
};

interface ValueItem {
  key: string;
  iconName: IconName;
  title: string;
  description: string;
  proof: string;
}

interface StatItem {
  key: string;
  iconName: IconName;
  value: string;
  label: string;
}

interface AboutValuesSectionProps {
  values: ValueItem[];
}

interface AboutStatsSectionProps {
  stats: StatItem[];
}

export function AboutValuesSection({ values }: AboutValuesSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {values.map(({ key, iconName, title, description, proof }, index) => {
        const Icon = iconMap[iconName];
        return (
          <ScrollReveal key={key} direction="up" delay={index * 100} duration={500}>
            <div className="bg-background-secondary rounded-lg p-5 border border-border h-full">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-6 h-6 text-accent" />
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
              </div>
              <p className="text-foreground-muted mb-3">{description}</p>
              <p className="text-xs text-accent font-medium bg-accent/10 px-3 py-1.5 rounded inline-block">
                → {proof}
              </p>
            </div>
          </ScrollReveal>
        );
      })}
    </div>
  );
}

export function AboutStatsSection({ stats }: AboutStatsSectionProps) {
  return (
    <ScrollReveal direction="up" delay={0} duration={500}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map(({ key, iconName, value, label }) => {
          const Icon = iconMap[iconName];
          return (
            <div key={key}>
              <Icon className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">{value}</div>
              <div className="text-sm text-foreground-muted">{label}</div>
            </div>
          );
        })}
      </div>
    </ScrollReveal>
  );
}
