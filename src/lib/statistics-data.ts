/**
 * Statistics Data Model
 * Static data for the public statistics page
 * Can be replaced with CMS/API data later
 */

export interface KPIData {
  tonnesExported: number;
  countriesServed: number;
  producerPartners: number;
  yearsExperience: number;
  avgResponseTime: string;
  tracedLots: number; // percentage
}

export interface RegionData {
  region: 'eu' | 'usa' | 'asia' | 'africa' | 'other';
  percentage: number;
  countries: string[];
}

export interface TopDestination {
  country: string;
  countryCode: string;
  percentage: number;
  port?: string;
}

export interface MonthlyVolume {
  month: string;
  volume: number;
  year: number;
}

export interface ProductMix {
  product: string;
  slug: string;
  volume: number;
  percentage: number;
  color: string;
}

export interface QualityMetric {
  id: string;
  value: string;
  description: string;
}

export interface StatisticsData {
  kpi: KPIData;
  exportsByRegion: RegionData[];
  topDestinations: TopDestination[];
  monthlyVolumes: MonthlyVolume[];
  productMix: ProductMix[];
  qualityMetrics: QualityMetric[];
  lastUpdated: string;
}

// Static data - can be updated monthly or connected to CMS
export const STATISTICS_DATA: StatisticsData = {
  kpi: {
    tonnesExported: 30000,
    countriesServed: 5,
    producerPartners: 20,
    yearsExperience: 5,
    avgResponseTime: '24-48h',
    tracedLots: 95,
  },
  exportsByRegion: [
    {
      region: 'eu',
      percentage: 55,
      countries: ['France', 'Belgique', 'Allemagne', 'Pays-Bas', 'Italie'],
    },
    { region: 'asia', percentage: 25, countries: ['Chine', 'Inde', 'Vietnam', 'Malaisie'] },
    { region: 'usa', percentage: 12, countries: ['États-Unis', 'Canada'] },
    { region: 'africa', percentage: 5, countries: ['Maroc', 'Sénégal', "Côte d'Ivoire"] },
    { region: 'other', percentage: 3, countries: ['Autres'] },
  ],
  topDestinations: [
    { country: 'Pays-Bas', countryCode: 'NL', percentage: 30, port: 'Rotterdam' },
    { country: 'Belgique', countryCode: 'BE', percentage: 25, port: 'Anvers' },
    { country: 'Allemagne', countryCode: 'DE', percentage: 18, port: 'Hambourg' },
    { country: 'France', countryCode: 'FR', percentage: 15, port: 'Le Havre' },
    { country: 'Chine', countryCode: 'CN', percentage: 12, port: 'Shanghai' },
  ],
  monthlyVolumes: [
    { month: 'Jan', volume: 180, year: 2024 },
    { month: 'Fév', volume: 220, year: 2024 },
    { month: 'Mar', volume: 280, year: 2024 },
    { month: 'Avr', volume: 250, year: 2024 },
    { month: 'Mai', volume: 200, year: 2024 },
    { month: 'Juin', volume: 180, year: 2024 },
    { month: 'Juil', volume: 160, year: 2024 },
    { month: 'Août', volume: 190, year: 2024 },
    { month: 'Sep', volume: 240, year: 2024 },
    { month: 'Oct', volume: 300, year: 2024 },
    { month: 'Nov', volume: 320, year: 2024 },
    { month: 'Déc', volume: 280, year: 2024 },
  ],
  productMix: [
    { product: 'Cacao', slug: 'cacao', volume: 1200, percentage: 48, color: '#8B4513' },
    { product: 'Café', slug: 'cafe', volume: 600, percentage: 24, color: '#6F4E37' },
    { product: 'Cajou', slug: 'cajou', volume: 300, percentage: 12, color: '#DEB887' },
    { product: 'Sésame', slug: 'sesame', volume: 200, percentage: 8, color: '#F5DEB3' },
    { product: 'Soja', slug: 'soja', volume: 150, percentage: 6, color: '#9ACD32' },
    { product: 'Autres', slug: 'autres', volume: 50, percentage: 2, color: '#808080' },
  ],
  qualityMetrics: [
    { id: 'grading', value: '100%', description: 'Lots gradés avant export' },
    { id: 'humidity', value: '<8%', description: 'Humidité cible (cacao)' },
    { id: 'phyto', value: '100%', description: 'Conformité phytosanitaire' },
    { id: 'coa', value: '100%', description: 'COA disponible sur demande' },
  ],
  lastUpdated: '2024-12-01',
};

// Product-specific data
export const PRODUCT_STATS: Record<
  string,
  {
    formats: string[];
    certifications: string[];
    specs: { label: string; value: string }[];
    seasonality: string;
  }
> = {
  cacao: {
    formats: ['Fèves', 'Beurre', 'Pâte', 'Poudre'],
    certifications: ['Bio (sur demande)', 'Fairtrade (sur demande)', 'UTZ/Rainforest'],
    specs: [
      { label: 'Humidité cible', value: '< 8%' },
      { label: 'Fermentation', value: '5-7 jours' },
      { label: 'Grades', value: 'Grade I, Grade II' },
      { label: 'Défauts max', value: '< 5%' },
    ],
    seasonality: 'Pics de collecte : Oct-Déc (grande saison), Mai-Juil (petite saison)',
  },
  cafe: {
    formats: ['Vert', 'Torréfié'],
    certifications: ['Bio (sur demande)', 'Fairtrade (sur demande)'],
    specs: [
      { label: 'Humidité cible', value: '< 12%' },
      { label: 'Variétés', value: 'Robusta, Arabica' },
      { label: 'Grades', value: 'Grade 1, Grade 2' },
    ],
    seasonality: 'Récolte principale : Nov-Fév',
  },
  cajou: {
    formats: ['Noix brutes', 'Noix décortiquées'],
    certifications: ['Bio (sur demande)'],
    specs: [
      { label: 'Humidité', value: '< 10%' },
      { label: 'KOR', value: '45-50 lbs' },
    ],
    seasonality: 'Récolte : Fév-Mai',
  },
};

export type ProductFilter = 'all' | 'cacao' | 'cafe' | 'cajou' | 'sesame' | 'soja';
export type PeriodFilter = '12m' | '24m' | '2024' | '2023';
export type RegionFilter = 'global' | 'eu' | 'usa' | 'asia' | 'africa';

/**
 * Get translated country name by country code
 */
export function getTranslatedCountryName(
  countryCode: string,
  locale: 'fr' | 'en' | 'ru' = 'fr'
): string {
  const countryNames: Record<string, { fr: string; en: string; ru: string }> = {
    NL: { fr: 'Pays-Bas', en: 'Netherlands', ru: 'Нидерланды' },
    BE: { fr: 'Belgique', en: 'Belgium', ru: 'Бельгия' },
    DE: { fr: 'Allemagne', en: 'Germany', ru: 'Германия' },
    FR: { fr: 'France', en: 'France', ru: 'Франция' },
    CN: { fr: 'Chine', en: 'China', ru: 'Китай' },
    US: { fr: 'États-Unis', en: 'United States', ru: 'Соединённые Штаты Америки' },
    CA: { fr: 'Canada', en: 'Canada', ru: 'Канада' },
    IN: { fr: 'Inde', en: 'India', ru: 'Индия' },
    VN: { fr: 'Vietnam', en: 'Vietnam', ru: 'Вьетнам' },
    MY: { fr: 'Malaisie', en: 'Malaysia', ru: 'Малайзия' },
    MA: { fr: 'Maroc', en: 'Morocco', ru: 'Марокко' },
    SN: { fr: 'Sénégal', en: 'Senegal', ru: 'Сенегал' },
    CI: { fr: "Côte d'Ivoire", en: 'Ivory Coast', ru: "Кот-д'Ивуар" },
    IT: { fr: 'Italie', en: 'Italy', ru: 'Италия' },
    ES: { fr: 'Espagne', en: 'Spain', ru: 'Испания' },
    ID: { fr: 'Indonésie', en: 'Indonesia', ru: 'Индонезия' },
  };

  return countryNames[countryCode]?.[locale] || countryCode;
}
