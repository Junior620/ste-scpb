'use client';

import { useTranslations } from 'next-intl';

export interface CalComEmbedProps {
  className?: string;
}

/**
 * Embeds a Cal.com scheduling widget when NEXT_PUBLIC_CALCOM_LINK is configured.
 */
export function CalComEmbed({ className = '' }: CalComEmbedProps) {
  const t = useTranslations('booking');
  const calLink = process.env.NEXT_PUBLIC_CALCOM_LINK;

  if (!calLink) {
    return null;
  }

  const embedUrl = calLink.includes('cal.com')
    ? `${calLink.replace(/\/$/, '')}?embed=true&theme=light`
    : calLink;

  return (
    <section className={`py-10 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('title')}</h2>
          <p className="text-foreground-muted">{t('subtitle')}</p>
        </div>
        <div className="max-w-4xl mx-auto rounded-xl overflow-hidden border border-border bg-background-secondary">
          <iframe
            src={embedUrl}
            title={t('iframeTitle')}
            className="w-full min-h-[630px] border-0"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

export default CalComEmbed;
