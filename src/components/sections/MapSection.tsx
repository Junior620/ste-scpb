'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Map, { Marker, Popup, NavigationControl, type MarkerEvent } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

/**
 * Location types for different marker categories
 */
export type LocationType = 'headquarters' | 'regional' | 'export';

/**
 * Location data structure
 */
export interface MapLocation {
  id: string;
  name: string;
  type: LocationType;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  contact?: {
    address?: string;
    phone?: string;
    email?: string;
  };
}

/**
 * Props for MapSection component
 */
export interface MapSectionProps {
  mapboxToken?: string;
  className?: string;
}

/**
 * Default locations for STE-SCPB
 * Headquarters: Douala-Akwa (4.054097, 9.698748)
 * Regional offices and export destinations
 */
export const DEFAULT_LOCATIONS: MapLocation[] = [
  // Headquarters
  {
    id: 'hq-douala',
    name: 'Douala-Akwa',
    type: 'headquarters',
    coordinates: {
      latitude: 4.054097,
      longitude: 9.698748,
    },
    contact: {
      address: 'Douala-Akwa, Cameroun',
      phone: '+237 676 905 938',
      email: 'scpb@ste-scpb.com',
    },
  },
  // Regional offices in Cameroon
  {
    id: 'regional-yaounde',
    name: 'Yaoundé',
    type: 'regional',
    coordinates: {
      latitude: 3.848,
      longitude: 11.5021,
    },
    contact: {
      address: 'Yaoundé, Cameroun',
      phone: '+237 222 XX XX XX',
    },
  },
  {
    id: 'regional-bafoussam',
    name: 'Bafoussam',
    type: 'regional',
    coordinates: {
      latitude: 5.4737,
      longitude: 10.4179,
    },
    contact: {
      address: 'Bafoussam, Cameroun',
    },
  },
  // Export destinations
  {
    id: 'export-usa',
    name: 'USA',
    type: 'export',
    coordinates: {
      latitude: 38.9072,
      longitude: -77.0369,
    },
  },
  {
    id: 'export-eu',
    name: 'Europe (Rotterdam)',
    type: 'export',
    coordinates: {
      latitude: 51.9225,
      longitude: 4.4792,
    },
  },
  {
    id: 'export-asia',
    name: 'Asia (Singapore)',
    type: 'export',
    coordinates: {
      latitude: 1.3521,
      longitude: 103.8198,
    },
  },
  {
    id: 'export-africa',
    name: 'Africa (Lagos)',
    type: 'export',
    coordinates: {
      latitude: 6.5244,
      longitude: 3.3792,
    },
  },
];

/**
 * Get marker color based on location type
 */
export function getMarkerColor(type: LocationType): string {
  switch (type) {
    case 'headquarters':
      return '#FFD700'; // Gold for headquarters
    case 'regional':
      return '#4CAF50'; // Green for regional offices
    case 'export':
      return '#2196F3'; // Blue for export destinations
    default:
      return '#9E9E9E';
  }
}

/**
 * Get marker size based on location type
 */
export function getMarkerSize(type: LocationType): number {
  switch (type) {
    case 'headquarters':
      return 24;
    case 'regional':
      return 18;
    case 'export':
      return 16;
    default:
      return 14;
  }
}

/**
 * Custom marker component
 */
function LocationMarker({
  location,
  onClick,
}: {
  location: MapLocation;
  onClick: (location: MapLocation) => void;
}) {
  const size = getMarkerSize(location.type);
  const color = getMarkerColor(location.type);

  return (
    <Marker
      latitude={location.coordinates.latitude}
      longitude={location.coordinates.longitude}
      anchor="center"
      onClick={(e: MarkerEvent<MouseEvent>) => {
        e.originalEvent?.stopPropagation();
        onClick(location);
      }}
    >
      <button
        type="button"
        className="cursor-pointer transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
        aria-label={`View details for ${location.name}`}
        style={{
          width: size,
          height: size,
        }}
      >
        {location.type === 'headquarters' ? (
          // Star marker for headquarters
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
            stroke="#000"
            strokeWidth="1"
          >
            <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
          </svg>
        ) : location.type === 'regional' ? (
          // Circle marker for regional offices
          <svg width={size} height={size} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill={color} stroke="#000" strokeWidth="1" />
          </svg>
        ) : (
          // Diamond marker for export destinations
          <svg width={size} height={size} viewBox="0 0 24 24">
            <polygon points="12,2 22,12 12,22 2,12" fill={color} stroke="#000" strokeWidth="1" />
          </svg>
        )}
      </button>
    </Marker>
  );
}


/**
 * Location popup component
 */
function LocationPopup({
  location,
  onClose,
}: {
  location: MapLocation;
  onClose: () => void;
}) {
  const t = useTranslations('map');
  const color = getMarkerColor(location.type);

  const typeLabel = useMemo(() => {
    switch (location.type) {
      case 'headquarters':
        return t('headquarters');
      case 'regional':
        return t('regionalOffices');
      case 'export':
        return t('exportDestinations');
      default:
        return '';
    }
  }, [location.type, t]);

  return (
    <Popup
      latitude={location.coordinates.latitude}
      longitude={location.coordinates.longitude}
      anchor="bottom"
      onClose={onClose}
      closeOnClick={false}
      className="map-popup"
      offset={20}
    >
      <div className="p-3 min-w-[200px] bg-gray-900 text-white rounded-lg">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
          <span className="text-xs text-gray-400 uppercase tracking-wide">
            {typeLabel}
          </span>
        </div>

        {/* Location name */}
        <h3 className="text-lg font-semibold text-white mb-2">{location.name}</h3>

        {/* Contact information */}
        {location.contact && (
          <div className="space-y-1 text-sm text-gray-300">
            {location.contact.address && (
              <p className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{location.contact.address}</span>
              </p>
            )}
            {location.contact.phone && (
              <p className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <a
                  href={`tel:${location.contact.phone.replace(/\s/g, '')}`}
                  className="hover:text-primary transition-colors"
                >
                  {location.contact.phone}
                </a>
              </p>
            )}
            {location.contact.email && (
              <p className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href={`mailto:${location.contact.email}`}
                  className="hover:text-primary transition-colors"
                >
                  {location.contact.email}
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </Popup>
  );
}


/**
 * Legend component for the map
 */
function MapLegend() {
  const t = useTranslations('map');

  const legendItems = [
    { type: 'headquarters' as LocationType, label: t('headquarters') },
    { type: 'regional' as LocationType, label: t('regionalOffices') },
    { type: 'export' as LocationType, label: t('exportDestinations') },
  ];

  return (
    <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-3 z-10">
      <ul className="space-y-2">
        {legendItems.map((item) => (
          <li key={item.type} className="flex items-center gap-2 text-sm text-gray-300">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getMarkerColor(item.type) }}
              aria-hidden="true"
            />
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Dark map style for Mapbox
 * Using Mapbox's dark style for consistency with the site's dark theme
 */
const DARK_MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

/**
 * Initial view state centered on Africa to show all locations
 */
const INITIAL_VIEW_STATE = {
  latitude: 15,
  longitude: 10,
  zoom: 1.5,
};

/**
 * MapSection component - Interactive map showing headquarters and export destinations
 * Validates: Requirements 12.1, 12.2, 12.3, 12.4
 */
export function MapSection({
  mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  className = '',
}: MapSectionProps) {
  const t = useTranslations('map');
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  const handleMarkerClick = useCallback((location: MapLocation) => {
    setSelectedLocation(location);
  }, []);

  const handlePopupClose = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  // If no token, show a placeholder
  if (!mapboxToken) {
    return (
      <section className={`py-16 md:py-24 px-4 md:px-8 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {t('title')}
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </header>
          <div className="h-[400px] md:h-[500px] bg-gray-800 rounded-xl flex items-center justify-center">
            <p className="text-muted-foreground">
              Map unavailable - Mapbox token not configured
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 md:py-24 px-4 md:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('title')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </header>

        {/* Map container */}
        <div className="relative h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden border border-gray-700">
          <Map
            mapboxAccessToken={mapboxToken}
            initialViewState={INITIAL_VIEW_STATE}
            style={{ width: '100%', height: '100%' }}
            mapStyle={DARK_MAP_STYLE}
            attributionControl={true}
            reuseMaps
          >
            {/* Navigation controls */}
            <NavigationControl position="top-right" />

            {/* Markers */}
            {DEFAULT_LOCATIONS.map((location) => (
              <LocationMarker
                key={location.id}
                location={location}
                onClick={handleMarkerClick}
              />
            ))}

            {/* Popup for selected location */}
            {selectedLocation && (
              <LocationPopup location={selectedLocation} onClose={handlePopupClose} />
            )}
          </Map>

          {/* Legend */}
          <MapLegend />
        </div>
      </div>
    </section>
  );
}

/**
 * Get all locations for testing
 */
export function getMapLocations(): MapLocation[] {
  return DEFAULT_LOCATIONS;
}

/**
 * Get locations by type for testing
 */
export function getLocationsByType(type: LocationType): MapLocation[] {
  return DEFAULT_LOCATIONS.filter((loc) => loc.type === type);
}
