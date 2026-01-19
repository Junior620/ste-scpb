'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Ship } from 'lucide-react';
import { getTranslatedCountryName } from '@/lib/statistics-data';

/**
 * Export destination with coordinates and percentage
 */
export interface ExportDestination {
  id: string;
  region: string;
  regionKey: string;
  percentage: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  countries: string[];
  color: string;
}

/**
 * Top destination country
 */
export interface TopDestinationCountry {
  country: string;
  countryCode: string;
  percentage: number;
  port?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Export destinations by region with real coordinates
 */
export const EXPORT_DESTINATIONS: ExportDestination[] = [
  {
    id: 'eu',
    region: 'Europe',
    regionKey: 'eu',
    percentage: 55,
    coordinates: { latitude: 50.8503, longitude: 4.3517 }, // Brussels (center of EU)
    countries: ['France', 'Belgique', 'Allemagne', 'Pays-Bas', 'Italie'],
    color: '#3B82F6', // Blue
  },
  {
    id: 'asia',
    region: 'Asie',
    regionKey: 'asia',
    percentage: 25,
    coordinates: { latitude: 35.8617, longitude: 104.1954 }, // China center
    countries: ['Chine', 'Inde', 'Vietnam', 'Malaisie'],
    color: '#EF4444', // Red
  },
  {
    id: 'usa',
    region: 'Amérique du Nord',
    regionKey: 'usa',
    percentage: 12,
    coordinates: { latitude: 39.8283, longitude: -98.5795 }, // USA center
    countries: ['États-Unis', 'Canada'],
    color: '#10B981', // Green
  },
  {
    id: 'africa',
    region: 'Afrique',
    regionKey: 'africa',
    percentage: 5,
    coordinates: { latitude: 9.082, longitude: 8.6753 }, // Nigeria
    countries: ['Maroc', 'Sénégal', "Côte d'Ivoire"],
    color: '#F59E0B', // Amber
  },
  {
    id: 'other',
    region: 'Autres',
    regionKey: 'other',
    percentage: 3,
    coordinates: { latitude: -23.5505, longitude: -46.6333 }, // Brazil
    countries: ['Autres'],
    color: '#8B5CF6', // Purple
  },
];

/**
 * Top destination countries with coordinates
 */
export const TOP_DESTINATIONS: TopDestinationCountry[] = [
  {
    country: 'Pays-Bas',
    countryCode: 'NL',
    percentage: 30,
    port: 'Rotterdam',
    coordinates: { latitude: 51.9225, longitude: 4.4792 },
  },
  {
    country: 'Belgique',
    countryCode: 'BE',
    percentage: 25,
    port: 'Anvers',
    coordinates: { latitude: 51.2194, longitude: 4.4025 },
  },
  {
    country: 'Allemagne',
    countryCode: 'DE',
    percentage: 18,
    port: 'Hambourg',
    coordinates: { latitude: 53.5511, longitude: 9.9937 },
  },
  {
    country: 'France',
    countryCode: 'FR',
    percentage: 15,
    port: 'Le Havre',
    coordinates: { latitude: 49.4944, longitude: 0.1079 },
  },
  {
    country: 'Chine',
    countryCode: 'CN',
    percentage: 12,
    port: 'Shanghai',
    coordinates: { latitude: 31.2304, longitude: 121.4737 },
  },
];

/**
 * Origin port (Cameroon)
 */
const ORIGIN_PORTS = [
  { name: 'Douala', coordinates: { latitude: 4.0511, longitude: 9.7679 } },
  { name: 'Kribi', coordinates: { latitude: 2.9373, longitude: 9.9137 } },
];

/**
 * Region coordinates (fixed geographic positions)
 */
const REGION_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  eu: { latitude: 50.8503, longitude: 4.3517 },
  asia: { latitude: 35.8617, longitude: 104.1954 },
  usa: { latitude: 39.8283, longitude: -98.5795 },
  africa: { latitude: 9.082, longitude: 8.6753 },
  other: { latitude: -23.5505, longitude: -46.6333 },
};

/**
 * Region colors
 */
const REGION_COLORS: Record<string, string> = {
  eu: '#3B82F6',
  asia: '#EF4444',
  usa: '#10B981',
  africa: '#F59E0B',
  other: '#8B5CF6',
};

/**
 * Region names
 */
const REGION_NAMES: Record<string, string> = {
  eu: 'Europe',
  asia: 'Asie',
  usa: 'Amérique du Nord',
  africa: 'Afrique',
  other: 'Autres',
};

/**
 * Country coordinates for top destinations
 */
const COUNTRY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  NL: { latitude: 51.9225, longitude: 4.4792 },
  BE: { latitude: 51.2194, longitude: 4.4025 },
  DE: { latitude: 53.5511, longitude: 9.9937 },
  FR: { latitude: 49.4944, longitude: 0.1079 },
  CN: { latitude: 31.2304, longitude: 121.4737 },
  US: { latitude: 38.9072, longitude: -77.0369 },
  CA: { latitude: 45.4215, longitude: -75.6972 },
  IN: { latitude: 19.076, longitude: 72.8777 },
  VN: { latitude: 10.8231, longitude: 106.6297 },
  MY: { latitude: 3.139, longitude: 101.6869 },
  MA: { latitude: 33.5731, longitude: -7.5898 },
  SN: { latitude: 14.7167, longitude: -17.4677 },
  CI: { latitude: 5.3599, longitude: -4.0083 },
};

interface RegionData {
  region: 'eu' | 'asia' | 'usa' | 'africa' | 'other';
  percentage: number;
  countries: string[];
}

interface TopDestinationData {
  country: string;
  countryCode: string;
  percentage: number;
  port?: string;
}

interface ExportMapProps {
  mapboxToken?: string;
  showRegions?: boolean;
  showCountries?: boolean;
  className?: string;
  exportsByRegion?: RegionData[];
  topDestinations?: TopDestinationData[];
}

const DARK_MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

const INITIAL_VIEW_STATE = {
  latitude: 25,
  longitude: 20,
  zoom: 1.2,
};

export function ExportMap({
  mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  showRegions = true,
  showCountries = true,
  className = '',
  exportsByRegion,
  topDestinations,
}: ExportMapProps) {
  const t = useTranslations('statistics');
  const locale = useLocale() as 'fr' | 'en' | 'ru';
  const [selectedDestination, setSelectedDestination] = useState<ExportDestination | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<TopDestinationCountry | null>(null);

  // Build destinations from props or use defaults
  const destinations: ExportDestination[] = useMemo(() => {
    if (exportsByRegion && exportsByRegion.length > 0) {
      return exportsByRegion.map((r) => ({
        id: r.region,
        region: REGION_NAMES[r.region] || r.region,
        regionKey: r.region,
        percentage: r.percentage,
        coordinates: REGION_COORDINATES[r.region] || { latitude: 0, longitude: 0 },
        countries: r.countries,
        color: REGION_COLORS[r.region] || '#808080',
      }));
    }
    return EXPORT_DESTINATIONS;
  }, [exportsByRegion]);

  // Build top destinations from props or use defaults
  const topDests: TopDestinationCountry[] = useMemo(() => {
    if (topDestinations && topDestinations.length > 0) {
      return topDestinations.map((d) => ({
        country: d.country,
        countryCode: d.countryCode,
        percentage: d.percentage,
        port: d.port,
        coordinates: COUNTRY_COORDINATES[d.countryCode] || { latitude: 0, longitude: 0 },
      }));
    }
    return TOP_DESTINATIONS;
  }, [topDestinations]);

  const handleRegionClick = useCallback((dest: ExportDestination) => {
    setSelectedDestination(dest);
    setSelectedCountry(null);
  }, []);

  const handleCountryClick = useCallback((country: TopDestinationCountry) => {
    setSelectedCountry(country);
    setSelectedDestination(null);
  }, []);

  const handlePopupClose = useCallback(() => {
    setSelectedDestination(null);
    setSelectedCountry(null);
  }, []);

  // Fallback if no token
  if (!mapboxToken) {
    return (
      <div
        className={`h-[400px] bg-background rounded-lg flex items-center justify-center border border-border ${className}`}
      >
        <p className="text-foreground-muted">Carte non disponible - Token Mapbox non configuré</p>
      </div>
    );
  }

  return (
    <div
      className={`relative h-[400px] md:h-[500px] rounded-xl overflow-hidden border border-border ${className}`}
    >
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: '100%', height: '100%' }}
        mapStyle={DARK_MAP_STYLE}
        attributionControl={false}
        reuseMaps
      >
        <NavigationControl position="top-right" showCompass={false} />

        {/* Origin ports (Cameroon) */}
        {ORIGIN_PORTS.map((port) => (
          <Marker
            key={port.name}
            latitude={port.coordinates.latitude}
            longitude={port.coordinates.longitude}
            anchor="center"
          >
            <div className="relative group cursor-pointer">
              <div className="w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg animate-pulse" />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-background/90 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                {port.name}
              </div>
            </div>
          </Marker>
        ))}

        {/* Region bubbles */}
        {showRegions &&
          destinations.map((dest) => (
            <Marker
              key={dest.id}
              latitude={dest.coordinates.latitude}
              longitude={dest.coordinates.longitude}
              anchor="center"
              onClick={(e) => {
                e.originalEvent?.stopPropagation();
                handleRegionClick(dest);
              }}
            >
              <button
                type="button"
                className="cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
                aria-label={`${dest.region}: ${dest.percentage}%`}
                style={{
                  width: Math.max(40, dest.percentage * 1.2),
                  height: Math.max(40, dest.percentage * 1.2),
                }}
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-white/30"
                  style={{ backgroundColor: dest.color }}
                >
                  {dest.percentage}%
                </div>
              </button>
            </Marker>
          ))}

        {/* Top destination countries (smaller markers) */}
        {showCountries &&
          topDests.map((country) => (
            <Marker
              key={country.countryCode}
              latitude={country.coordinates.latitude}
              longitude={country.coordinates.longitude}
              anchor="center"
              onClick={(e) => {
                e.originalEvent?.stopPropagation();
                handleCountryClick(country);
              }}
            >
              <button
                type="button"
                className="cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                aria-label={`${country.country}: ${country.percentage}%`}
              >
                <div className="w-3 h-3 bg-primary rounded-full border border-white shadow-md" />
              </button>
            </Marker>
          ))}

        {/* Region popup */}
        {selectedDestination && (
          <Popup
            latitude={selectedDestination.coordinates.latitude}
            longitude={selectedDestination.coordinates.longitude}
            anchor="bottom"
            onClose={handlePopupClose}
            closeOnClick={false}
            offset={25}
          >
            <div className="p-3 min-w-[180px] bg-gray-900 text-white rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedDestination.color }}
                />
                <span className="font-semibold">{selectedDestination.region}</span>
              </div>
              <p className="text-2xl font-bold text-primary mb-2">
                {selectedDestination.percentage}%
              </p>
              <p className="text-xs text-gray-400 mb-1">{t('destinations.countries')}:</p>
              <p className="text-sm text-gray-300">{selectedDestination.countries.join(', ')}</p>
            </div>
          </Popup>
        )}

        {/* Country popup */}
        {selectedCountry && (
          <Popup
            latitude={selectedCountry.coordinates.latitude}
            longitude={selectedCountry.coordinates.longitude}
            anchor="bottom"
            onClose={handlePopupClose}
            closeOnClick={false}
            offset={15}
          >
            <div className="p-3 min-w-[160px] bg-gray-900 text-white rounded-lg">
              <p className="font-semibold mb-1">
                {getTranslatedCountryName(selectedCountry.countryCode, locale)}
              </p>
              <p className="text-xl font-bold text-primary mb-2">{selectedCountry.percentage}%</p>
              {selectedCountry.port && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Ship className="w-3 h-3" /> Port: {selectedCountry.port}
                </p>
              )}
            </div>
          </Popup>
        )}
      </Map>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 z-10">
        <p className="text-xs text-gray-400 mb-2 font-medium">{t('destinations.legend')}</p>
        <ul className="space-y-1.5">
          {destinations.slice(0, 4).map((dest) => (
            <li key={dest.id} className="flex items-center gap-2 text-xs text-gray-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dest.color }} />
              <span>{dest.region}</span>
              <span className="ml-auto font-medium">{dest.percentage}%</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Origin indicator */}
      <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 z-10">
        <p className="text-xs text-gray-400 flex items-center gap-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          {t('destinations.origin')}: Douala, Kribi
        </p>
      </div>
    </div>
  );
}

export default ExportMap;
