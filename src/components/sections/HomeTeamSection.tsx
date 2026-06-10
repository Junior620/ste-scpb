'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Users, MapPin, Warehouse, Handshake, ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui';
import type { TeamMember } from '@/domain/entities/TeamMember';
import type { Locale } from '@/domain/value-objects/Locale';
import {
  getLocalizedName,
  getLocalizedRole,
  getLocalizedBio,
  sortTeamMembers,
} from '@/domain/entities/TeamMember';

const STATS = [
  { key: 'employees', icon: Users, value: '100+' },
  { key: 'regions', icon: MapPin, value: '10' },
  { key: 'collectionPoints', icon: Warehouse, value: '25+' },
  { key: 'partners', icon: Handshake, value: '500+' },
] as const;

export interface HomeTeamSectionProps {
  members: TeamMember[];
  locale: Locale;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function HomeTeamSection({ members, locale }: HomeTeamSectionProps) {
  const tTeam = useTranslations('team');
  const tWorkforce = useTranslations('workforce');

  const previewMembers = sortTeamMembers(members).slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-background-secondary">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{tTeam('title')}</h2>
          <p className="text-lg text-foreground-muted">{tWorkforce('description')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
          {STATS.map(({ key, icon: Icon, value }) => (
            <div
              key={key}
              className="rounded-xl border border-border bg-background p-4 text-center"
            >
              <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{value}</div>
              <div className="text-xs text-foreground-muted">{tWorkforce(`stats.${key}`)}</div>
            </div>
          ))}
        </div>

        {previewMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {previewMembers.map((member) => {
              const name = getLocalizedName(member, locale);
              const role = getLocalizedRole(member, locale);
              const bio = getLocalizedBio(member, locale);
              return (
                <div
                  key={member.id}
                  className="rounded-xl border border-border bg-background p-6 text-center"
                >
                  {member.photo?.url ? (
                    <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-primary/20">
                      <Image
                        src={member.photo.url}
                        alt={name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {getInitials(name)}
                    </div>
                  )}
                  <h3 className="font-semibold text-foreground text-sm mb-1">{name}</h3>
                  <p className="text-primary text-xs font-medium mb-2">{role}</p>
                  <p className="text-xs text-foreground-muted line-clamp-3">{bio}</p>
                </div>
              );
            })}
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button variant="primary" size="lg">
              <Phone className="w-4 h-4 mr-2" />
              {tTeam('cta.contact')}
            </Button>
          </Link>
          <Link href="/equipe">
            <Button variant="outline" size="lg">
              <ArrowRight className="w-4 h-4 mr-2" />
              {tTeam('viewAll')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HomeTeamSection;
