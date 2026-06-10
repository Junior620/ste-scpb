'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FileCheck, ChevronDown, ChevronUp } from 'lucide-react';
import {
  DEMO_DOSSIER_SECTIONS,
  DEMO_LOT,
  type DemoDossierSectionKey,
} from '@/data/cocoatrack-demo';

export function DueDiligenceDossierPreview() {
  const t = useTranslations('cocoatrackDemo.dossier');
  const [openSection, setOpenSection] = useState<DemoDossierSectionKey | null>('origin');

  return (
    <div className="rounded-2xl border border-border bg-background-secondary overflow-hidden">
      <div className="p-6 border-b border-border bg-primary/5">
        <div className="flex items-start gap-3">
          <FileCheck className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('title')}</h3>
            <p className="text-sm text-foreground-muted mt-1">{t('subtitle')}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-foreground-muted">{t('lotId')}</dt>
                <dd className="font-mono font-medium">{DEMO_LOT.id}</dd>
              </div>
              <div>
                <dt className="text-foreground-muted">{t('volume')}</dt>
                <dd className="font-medium">{DEMO_LOT.volumeKg.toLocaleString()} kg</dd>
              </div>
              <div>
                <dt className="text-foreground-muted">{t('parcels')}</dt>
                <dd className="font-medium">{DEMO_LOT.parcelCount}</dd>
              </div>
              <div>
                <dt className="text-foreground-muted">{t('harvest')}</dt>
                <dd className="font-medium">{DEMO_LOT.harvestPeriod}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {DEMO_DOSSIER_SECTIONS.map((key) => {
          const isOpen = openSection === key;
          return (
            <div key={key}>
              <button
                type="button"
                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-background/80 transition-colors"
                onClick={() => setOpenSection(isOpen ? null : key)}
                aria-expanded={isOpen}
              >
                <span className="font-medium text-foreground">{t(`sections.${key}.title`)}</span>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-foreground-muted flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-foreground-muted flex-shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-6 pb-4 text-sm text-foreground-muted leading-relaxed">
                  <p>{t(`sections.${key}.content`)}</p>
                  {key === 'certificates' && (
                    <ul className="mt-3 space-y-1 list-disc list-inside">
                      <li>{t('certItems.phyto')}</li>
                      <li>{t('certItems.origin')}</li>
                      <li>{t('certItems.coa')}</li>
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="px-6 py-4 text-xs text-foreground-muted border-t border-border">
        {t('disclaimer')}
      </p>
    </div>
  );
}

export default DueDiligenceDossierPreview;
