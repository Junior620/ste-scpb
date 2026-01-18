import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Locale } from '@/domain/value-objects/Locale';
import { generateAlternateLanguages, SITE_NAME } from '@/i18n/metadata';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { ContactForm } from '@/components/forms/ContactForm';
import { MapSection } from '@/components/sections';
import { ContactHero } from '@/components/sections/ContactHero';

interface ContactPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.contact' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: generateAlternateLanguages('/contact', locale as Locale),
    openGraph: {
      title: `${t('title')} | ${SITE_NAME}`,
      description: t('description'),
    },
  };
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations({ locale, namespace: 'contact' });

  return (
    <main id="main-content" className="min-h-screen bg-background">
      {/* 3D Hero */}
      <ContactHero
        title={t('title')}
        subtitle={t('subtitle')}
        quoteLink="/devis"
        quoteLinkText={t('quoteLink')}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Cameroon Office */}
              <div className="bg-background-secondary rounded-lg p-6 border border-border">
                <h2 className="text-xl font-semibold text-foreground mb-6">{t('info.title')}</h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{t('info.address')}</p>
                      <p className="text-foreground-muted">{t('info.addressValue')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{t('info.phone')}</p>
                      <a
                        href="tel:+237676905938"
                        className="text-foreground-muted hover:text-primary transition-colors"
                      >
                        +237 676 905 938
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{t('info.email')}</p>
                      <a
                        href="mailto:scpb@ste-scpb.com"
                        className="text-foreground-muted hover:text-primary transition-colors"
                      >
                        scpb@ste-scpb.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{t('info.hours')}</p>
                      <p className="text-foreground-muted">{t('info.hoursValue')}</p>
                    </div>
                  </div>
                </div>

                {/* Response time badge */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Clock className="w-4 h-4" />
                    <span>{t('info.response')}</span>
                  </div>
                </div>
              </div>

              {/* USA Office */}
              <div className="bg-background-secondary rounded-lg p-6 border border-border">
                <h2 className="text-xl font-semibold text-foreground mb-6">{t('infoUsa.title')}</h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{t('infoUsa.address')}</p>
                      <p className="text-foreground-muted">{t('infoUsa.addressValue')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{t('infoUsa.phone')}</p>
                      <a
                        href="tel:+19175939310"
                        className="text-foreground-muted hover:text-primary transition-colors"
                      >
                        +1 917 593 9310
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{t('infoUsa.email')}</p>
                      <a
                        href="mailto:kameragro@yahoo.com"
                        className="text-foreground-muted hover:text-primary transition-colors"
                      >
                        kameragro@yahoo.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{t('infoUsa.hours')}</p>
                      <p className="text-foreground-muted">{t('infoUsa.hoursValue')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-background-secondary rounded-lg p-6 md:p-8 border border-border">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <MapSection />
    </main>
  );
}
