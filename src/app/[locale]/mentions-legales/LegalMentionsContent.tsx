'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function LegalMentionsContent() {
  const t = useTranslations('legal.legalMentions');

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {t('title')}
          </h1>
        </header>

        {/* Section 1: Publisher */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.publisher.title')}
          </h2>
          <ul className="text-slate-300 space-y-2">
            <li>{t('sections.publisher.companyName')}</li>
            <li>{t('sections.publisher.legalForm')}</li>
            <li>{t('sections.publisher.capital')}</li>
            <li>{t('sections.publisher.registration')}</li>
            <li>{t('sections.publisher.address')}</li>
            <li>{t('sections.publisher.phone')}</li>
            <li>{t('sections.publisher.email')}</li>
            <li>{t('sections.publisher.director')}</li>
          </ul>
        </section>

        {/* Section 2: Hosting */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.hosting.title')}
          </h2>
          <ul className="text-slate-300 space-y-2">
            <li>{t('sections.hosting.provider')}</li>
            <li>{t('sections.hosting.address')}</li>
            <li>{t('sections.hosting.website')}</li>
          </ul>
        </section>

        {/* Section 3: Intellectual Property */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.intellectual.title')}
          </h2>
          <p className="text-slate-300 mb-4">{t('sections.intellectual.content')}</p>
          <p className="text-slate-300">{t('sections.intellectual.prohibition')}</p>
        </section>

        {/* Section 4: Liability */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.liability.title')}
          </h2>
          <p className="text-slate-300 mb-4">{t('sections.liability.content')}</p>
          <p className="text-slate-300">{t('sections.liability.links')}</p>
        </section>

        {/* Section 5: Personal Data */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.personalData.title')}
          </h2>
          <p className="text-slate-300">
            {t('sections.personalData.content')}{' '}
            <Link
              href="/politique-confidentialite"
              className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
            >
              Politique de Confidentialité
            </Link>
          </p>
        </section>

        {/* Section 6: Cookies */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.cookies.title')}
          </h2>
          <p className="text-slate-300">{t('sections.cookies.content')}</p>
        </section>

        {/* Section 7: Applicable Law */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.law.title')}
          </h2>
          <p className="text-slate-300">{t('sections.law.content')}</p>
        </section>

        {/* Section 8: Contact */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.contact.title')}
          </h2>
          <p className="text-slate-300 mb-3">{t('sections.contact.content')}</p>
          <ul className="text-slate-400 space-y-1 ml-4">
            <li>{t('sections.contact.email')}</li>
            <li>{t('sections.contact.address')}</li>
          </ul>
        </section>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <Link
            href="/"
            className="text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
