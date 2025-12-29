'use client';

/**
 * Workforce Section Component
 * Humanizes the company with team stats and roles
 * B2B credibility: links workforce to business value
 */

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import {
  Users,
  MapPin,
  Warehouse,
  Handshake,
  CheckCircle,
  Briefcase,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui';

// Stats configuration - unique indicators (no duplicate with other sections)
const STATS = [
  { key: 'employees', icon: Users, value: '100+' },
  { key: 'regions', icon: MapPin, value: '10' },
  { key: 'collectionPoints', icon: Warehouse, value: '25+' },
  { key: 'partners', icon: Handshake, value: '500+' },
] as const;

// Team roles/capabilities
const TEAM_ROLES = ['collection', 'quality', 'logistics'] as const;

export function WorkforceSection() {
  const t = useTranslations('workforce');

  return (
    <section className="py-16 md:py-24 bg-background-secondary">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('title')}
          </h2>
          <p className="text-foreground-muted text-lg leading-relaxed">
            {t('description')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {STATS.map(({ key, icon: Icon, value }) => (
            <div
              key={key}
              className="bg-background rounded-xl p-6 text-center border border-border hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">{value}</div>
              <div className="text-sm text-foreground-muted">{t(`stats.${key}`)}</div>
            </div>
          ))}
        </div>

        {/* Team Roles - Business Value */}
        <div className="bg-background rounded-2xl p-8 border border-border mb-8">
          <h3 className="text-xl font-bold text-foreground mb-6 text-center">
            {t('roles.title')}
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            {TEAM_ROLES.map((role) => (
              <div key={role} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-foreground">{t(`roles.${role}`)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA - Careers / Partner */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button variant="outline" size="lg">
              <Briefcase className="w-4 h-4 mr-2" />
              {t('cta.careers')}
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="ghost" size="lg" className="text-foreground-muted hover:text-foreground">
              <ArrowRight className="w-4 h-4 mr-2" />
              {t('cta.partner')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default WorkforceSection;
