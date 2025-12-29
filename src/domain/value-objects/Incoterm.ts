/**
 * Incoterm value object - ICC 2020 Incoterms
 * Validates: Requirements 17.4
 *
 * Incoterms define responsibilities for shipping, insurance, and customs
 */

/**
 * All valid ICC 2020 Incoterms
 */
export const INCOTERMS = [
  'EXW', // Ex Works
  'FCA', // Free Carrier
  'FAS', // Free Alongside Ship
  'FOB', // Free on Board
  'CFR', // Cost and Freight
  'CIF', // Cost, Insurance and Freight
  'CPT', // Carriage Paid To
  'CIP', // Carriage and Insurance Paid To
  'DAP', // Delivered at Place
  'DPU', // Delivered at Place Unloaded
  'DDP', // Delivered Duty Paid
] as const;

export type Incoterm = (typeof INCOTERMS)[number];

/**
 * Incoterm descriptions for UI display
 */
export const INCOTERM_DESCRIPTIONS: Record<Incoterm, { en: string; fr: string }> = {
  EXW: {
    en: 'Ex Works - Buyer bears all costs and risks',
    fr: 'Ex Works - L\'acheteur supporte tous les coûts et risques',
  },
  FCA: {
    en: 'Free Carrier - Seller delivers to carrier',
    fr: 'Franco Transporteur - Le vendeur livre au transporteur',
  },
  FAS: {
    en: 'Free Alongside Ship - Seller delivers alongside vessel',
    fr: 'Franco le Long du Navire - Le vendeur livre le long du navire',
  },
  FOB: {
    en: 'Free on Board - Seller delivers on board vessel',
    fr: 'Franco à Bord - Le vendeur livre à bord du navire',
  },
  CFR: {
    en: 'Cost and Freight - Seller pays freight to destination',
    fr: 'Coût et Fret - Le vendeur paie le fret jusqu\'à destination',
  },
  CIF: {
    en: 'Cost, Insurance and Freight - Seller pays freight and insurance',
    fr: 'Coût, Assurance et Fret - Le vendeur paie le fret et l\'assurance',
  },
  CPT: {
    en: 'Carriage Paid To - Seller pays carriage to destination',
    fr: 'Port Payé Jusqu\'à - Le vendeur paie le transport jusqu\'à destination',
  },
  CIP: {
    en: 'Carriage and Insurance Paid To - Seller pays carriage and insurance',
    fr: 'Port Payé, Assurance Comprise - Le vendeur paie transport et assurance',
  },
  DAP: {
    en: 'Delivered at Place - Seller delivers at named place',
    fr: 'Rendu au Lieu de Destination - Le vendeur livre au lieu convenu',
  },
  DPU: {
    en: 'Delivered at Place Unloaded - Seller delivers and unloads',
    fr: 'Rendu au Lieu de Destination Déchargé - Le vendeur livre et décharge',
  },
  DDP: {
    en: 'Delivered Duty Paid - Seller bears all costs including duties',
    fr: 'Rendu Droits Acquittés - Le vendeur supporte tous les coûts y compris les droits',
  },
};

/**
 * Validates if a string is a valid Incoterm
 */
export function isValidIncoterm(value: string): value is Incoterm {
  return INCOTERMS.includes(value as Incoterm);
}

/**
 * Parses a string to Incoterm, returns undefined if invalid
 */
export function parseIncoterm(value: string): Incoterm | undefined {
  const upper = value.toUpperCase().trim();
  return isValidIncoterm(upper) ? upper : undefined;
}
