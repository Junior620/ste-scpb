import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { FileQuestion, ArrowLeft, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'documentsInProgress.metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function DocumentsInProgressPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <FileQuestion className="w-10 h-10 text-primary" />
          </div>

          {/* Title */}
          <DocumentsInProgressContent />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/">
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <DocumentsInProgressBackButton />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="primary" size="lg">
                <Mail className="w-4 h-4 mr-2" />
                <DocumentsInProgressContactButton />
              </Button>
            </Link>
          </div>

          {/* Contact info */}
          <div className="mt-12 p-6 bg-background rounded-xl border border-border">
            <DocumentsInProgressContactInfo />
          </div>
        </div>
      </div>
    </main>
  );
}

function DocumentsInProgressContent() {
  const t = useTranslations('documentsInProgress');
  return (
    <>
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('title')}</h1>
      <p className="text-lg text-foreground-muted mb-6">{t('description')}</p>
      <p className="text-foreground-muted">{t('message')}</p>
    </>
  );
}

function DocumentsInProgressBackButton() {
  const t = useTranslations('documentsInProgress');
  return <>{t('backButton')}</>;
}

function DocumentsInProgressContactButton() {
  const t = useTranslations('documentsInProgress');
  return <>{t('contactButton')}</>;
}

function DocumentsInProgressContactInfo() {
  const t = useTranslations('documentsInProgress');
  return (
    <>
      <h3 className="text-lg font-semibold text-foreground mb-4">{t('contactInfo.title')}</h3>
      <div className="space-y-3 text-sm text-foreground-muted">
        <div className="flex items-center justify-center gap-2">
          <Phone className="w-4 h-4 text-primary" />
          <span>{t('contactInfo.phone')}</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Mail className="w-4 h-4 text-primary" />
          <span>{t('contactInfo.email')}</span>
        </div>
      </div>
    </>
  );
}
