/**
 * Anonymized demo parcels for CocoaTrack public demo portal.
 * Coordinates are approximate zones in Cameroon cocoa regions (not real farm boundaries).
 */
export interface DemoParcel {
  id: string;
  zoneKey: string;
  latitude: number;
  longitude: number;
  areaHa: number;
  riskLevel: 'low' | 'medium' | 'verified';
}

export const DEMO_PARCELS: DemoParcel[] = [
  {
    id: 'P-0142',
    zoneKey: 'centre',
    latitude: 4.12,
    longitude: 11.42,
    areaHa: 2.4,
    riskLevel: 'verified',
  },
  {
    id: 'P-0143',
    zoneKey: 'centre',
    latitude: 4.08,
    longitude: 11.55,
    areaHa: 1.8,
    riskLevel: 'low',
  },
  {
    id: 'P-0201',
    zoneKey: 'centre',
    latitude: 3.98,
    longitude: 11.38,
    areaHa: 3.1,
    riskLevel: 'verified',
  },
  { id: 'P-0310', zoneKey: 'sud', latitude: 2.95, longitude: 11.15, areaHa: 2.0, riskLevel: 'low' },
  {
    id: 'P-0311',
    zoneKey: 'sud',
    latitude: 2.88,
    longitude: 11.28,
    areaHa: 1.5,
    riskLevel: 'verified',
  },
  {
    id: 'P-0312',
    zoneKey: 'sud',
    latitude: 2.82,
    longitude: 11.05,
    areaHa: 2.7,
    riskLevel: 'medium',
  },
  {
    id: 'P-0405',
    zoneKey: 'littoral',
    latitude: 4.55,
    longitude: 10.05,
    areaHa: 1.9,
    riskLevel: 'low',
  },
  {
    id: 'P-0406',
    zoneKey: 'littoral',
    latitude: 4.62,
    longitude: 10.18,
    areaHa: 2.2,
    riskLevel: 'verified',
  },
  { id: 'P-0501', zoneKey: 'est', latitude: 4.05, longitude: 13.42, areaHa: 2.5, riskLevel: 'low' },
  {
    id: 'P-0502',
    zoneKey: 'est',
    latitude: 3.92,
    longitude: 13.55,
    areaHa: 1.7,
    riskLevel: 'verified',
  },
];

export const DEMO_LOT = {
  id: 'LOT-2026-0047',
  volumeKg: 18500,
  parcelCount: 10,
  producerCount: 8,
  harvestPeriod: '2025-10 / 2026-01',
};

export const DEMO_DOSSIER_SECTIONS = ['origin', 'gps', 'risk', 'chain', 'certificates'] as const;

export type DemoDossierSectionKey = (typeof DEMO_DOSSIER_SECTIONS)[number];
