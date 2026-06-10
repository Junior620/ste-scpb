'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface FAQSectionProps {
  namespace?: string;
  sectionKeys: readonly string[];
  itemKeys: Record<string, readonly string[]>;
  className?: string;
}

export function FAQSection({
  namespace = 'faqPage',
  sectionKeys,
  itemKeys,
  className = '',
}: FAQSectionProps) {
  const t = useTranslations(namespace);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  return (
    <div className={`space-y-10 ${className}`}>
      {sectionKeys.map((sectionKey) => (
        <section key={sectionKey}>
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            {t(`sections.${sectionKey}.title`)}
          </h2>
          <div className="space-y-3">
            {(itemKeys[sectionKey] ?? []).map((itemKey) => {
              const id = `${sectionKey}-${itemKey}`;
              const isOpen = expanded === id;
              return (
                <div
                  key={id}
                  className="rounded-xl border border-border bg-background-secondary overflow-hidden"
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                    onClick={() => toggle(id)}
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium text-foreground">
                      {t(`sections.${sectionKey}.items.${itemKey}.question`)}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-foreground-muted flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm text-foreground-muted leading-relaxed border-t border-border pt-3">
                      {t(`sections.${sectionKey}.items.${itemKey}.answer`)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export default FAQSection;
