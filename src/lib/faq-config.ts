export const FAQ_SECTION_KEYS = ['export', 'eudr', 'traceability', 'commercial'] as const;

export const FAQ_ITEMS_BY_SECTION: Record<(typeof FAQ_SECTION_KEYS)[number], readonly string[]> = {
  export: ['docs', 'destinations', 'incoterms', 'sample'],
  eudr: ['deadline', 'dds', 'scpbRole', 'cocoatrack'],
  traceability: ['method', 'gps', 'lot'],
  commercial: ['response', 'payment', 'nda'],
};

export function buildFaqJsonLdItems(
  t: (key: string) => string
): Array<{ question: string; answer: string }> {
  const items: Array<{ question: string; answer: string }> = [];

  for (const section of FAQ_SECTION_KEYS) {
    for (const item of FAQ_ITEMS_BY_SECTION[section]) {
      items.push({
        question: t(`sections.${section}.items.${item}.question`),
        answer: t(`sections.${section}.items.${item}.answer`),
      });
    }
  }

  return items;
}
