'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function PrivacyPolicyContent() {
  const t = useTranslations('legal.privacyPolicy');

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-slate-400">
            {t('lastUpdated')}: {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </header>

        {/* Introduction */}
        <section className="mb-10">
          <p className="text-slate-300 leading-relaxed">{t('intro')}</p>
        </section>

        {/* Section 1: Data Controller */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.dataController.title')}
          </h2>
          <p className="text-slate-300 mb-3">{t('sections.dataController.content')}</p>
          <ul className="text-slate-400 space-y-1 ml-4">
            <li>{t('sections.dataController.address')}</li>
            <li>{t('sections.dataController.email')}</li>
            <li>{t('sections.dataController.phone')}</li>
          </ul>
        </section>

        {/* Section 2: Data Collected */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.dataCollected.title')}
          </h2>
          <p className="text-slate-300 mb-3">{t('sections.dataCollected.intro')}</p>
          <ul className="text-slate-400 space-y-2 ml-4 list-disc list-inside">
            <li>{t('sections.dataCollected.items.contact')}</li>
            <li>{t('sections.dataCollected.items.rfq')}</li>
            <li>{t('sections.dataCollected.items.newsletter')}</li>
            <li>{t('sections.dataCollected.items.navigation')}</li>
          </ul>
        </section>

        {/* Section 3: Purposes */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.purposes.title')}
          </h2>
          <p className="text-slate-300 mb-3">{t('sections.purposes.intro')}</p>
          <ul className="text-slate-400 space-y-2 ml-4 list-disc list-inside">
            <li>{t('sections.purposes.items.contact')}</li>
            <li>{t('sections.purposes.items.rfq')}</li>
            <li>{t('sections.purposes.items.newsletter')}</li>
            <li>{t('sections.purposes.items.analytics')}</li>
            <li>{t('sections.purposes.items.legal')}</li>
          </ul>
        </section>

        {/* Section 4: Legal Basis */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.legalBasis.title')}
          </h2>
          <p className="text-slate-300 mb-3">{t('sections.legalBasis.intro')}</p>
          <ul className="text-slate-400 space-y-2 ml-4 list-disc list-inside">
            <li>{t('sections.legalBasis.items.consent')}</li>
            <li>{t('sections.legalBasis.items.contract')}</li>
            <li>{t('sections.legalBasis.items.legitimate')}</li>
            <li>{t('sections.legalBasis.items.legal')}</li>
          </ul>
        </section>

        {/* Section 5: Retention */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.retention.title')}
          </h2>
          <p className="text-slate-300 mb-3">{t('sections.retention.intro')}</p>
          <ul className="text-slate-400 space-y-2 ml-4 list-disc list-inside">
            <li>{t('sections.retention.items.contact')}</li>
            <li>{t('sections.retention.items.rfq')}</li>
            <li>{t('sections.retention.items.newsletter')}</li>
            <li>{t('sections.retention.items.navigation')}</li>
          </ul>
        </section>

        {/* Section 6: Rights */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.rights.title')}
          </h2>
          <p className="text-slate-300 mb-3">{t('sections.rights.intro')}</p>
          <ul className="text-slate-400 space-y-2 ml-4 list-disc list-inside">
            <li>{t('sections.rights.items.access')}</li>
            <li>{t('sections.rights.items.rectification')}</li>
            <li>{t('sections.rights.items.erasure')}</li>
            <li>{t('sections.rights.items.restriction')}</li>
            <li>{t('sections.rights.items.portability')}</li>
            <li>{t('sections.rights.items.objection')}</li>
            <li>{t('sections.rights.items.withdraw')}</li>
          </ul>
          <p className="text-slate-300 mt-4">{t('sections.rights.exercise')}</p>
        </section>

        {/* Section 7: Security */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.security.title')}
          </h2>
          <p className="text-slate-300">{t('sections.security.content')}</p>
        </section>

        {/* Section 8: Transfers */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.transfers.title')}
          </h2>
          <p className="text-slate-300">{t('sections.transfers.content')}</p>
        </section>

        {/* Section 9: Cookies */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.cookies.title')}
          </h2>
          <p className="text-slate-300">{t('sections.cookies.content')}</p>
        </section>

        {/* Section 10: Changes */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
            {t('sections.changes.title')}
          </h2>
          <p className="text-slate-300">{t('sections.changes.content')}</p>
        </section>

        {/* Section 11: Contact */}
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
