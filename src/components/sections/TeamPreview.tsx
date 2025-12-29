'use client';

/**
 * Team Preview Section Component
 * B2B-focused team presentation with clear roles and micro-bios
 * Builds trust through transparency and expertise display
 */

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { User, Phone, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';

// Team members with explicit roles and expertise keys for i18n
const TEAM_MEMBERS = [
  { key: 'ceo', name: 'M. MBATCHOU NOKAM ELVIS' },
  { key: 'gm', name: 'M. TCHOUMEGNE TAGNE SIMONO' },
  { key: 'operations', name: 'M. TATCHUM SEDRIQUE' },
  { key: 'export', name: 'M. TEYOMNOU WILLIAM' },
] as const;

export function TeamPreview() {
  const t = useTranslations('team');

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header - B2B focused */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('title')}
          </h2>
          <p className="text-foreground-muted text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.key}
              className="bg-background-secondary rounded-xl p-6 border border-border hover:border-primary/30 transition-colors text-center"
            >
              {/* Avatar placeholder - ready for real photos */}
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/20">
                <User className="w-12 h-12 text-primary/60" />
              </div>

              {/* Name */}
              <h3 className="font-semibold text-foreground mb-1">
                {member.name}
              </h3>

              {/* Role - explicit title */}
              <p className="text-primary font-medium text-sm mb-2">
                {t(`members.${member.key}.role`)}
              </p>

              {/* Micro-bio - expertise */}
              <p className="text-xs text-foreground-muted leading-relaxed">
                {t(`members.${member.key}.bio`)}
              </p>
            </div>
          ))}
        </div>

        {/* CTAs - Commercial focus */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Primary CTA - Contact export team */}
          <Link href="/contact">
            <Button variant="primary" size="lg">
              <Phone className="w-4 h-4 mr-2" />
              {t('cta.contact')}
            </Button>
          </Link>
          {/* Secondary CTA - View full team */}
          <Link href="/equipe">
            <Button variant="outline" size="lg">
              <ArrowRight className="w-4 h-4 mr-2" />
              {t('viewAll')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default TeamPreview;
