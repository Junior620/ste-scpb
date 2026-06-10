'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

export interface TraceabilityZone {
  id: string;
  nameKey: string;
  latitude: number;
  longitude: number;
  producers: number;
}

const DEFAULT_ZONES: TraceabilityZone[] = [
  { id: 'centre', nameKey: 'centre', latitude: 4.05, longitude: 11.5, producers: 180 },
  { id: 'sud', nameKey: 'sud', latitude: 2.9, longitude: 11.2, producers: 145 },
  { id: 'littoral', nameKey: 'littoral', latitude: 4.6, longitude: 10.1, producers: 95 },
  { id: 'est', nameKey: 'est', latitude: 4.0, longitude: 13.5, producers: 80 },
];

export interface TraceabilityMapProps {
  className?: string;
  zones?: TraceabilityZone[];
}

export function TraceabilityMap({ className = '', zones = DEFAULT_ZONES }: TraceabilityMapProps) {
  const t = useTranslations('traceability.map');
  const [selectedZone, setSelectedZone] = useState<TraceabilityZone | null>(null);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const initialViewState = useMemo(
    () => ({
      latitude: 4.5,
      longitude: 11.5,
      zoom: 5.5,
    }),
    []
  );

  const handleMarkerClick = useCallback((zone: TraceabilityZone) => {
    setSelectedZone(zone);
  }, []);

  if (!mapboxToken) {
    return (
      <div
        className={`rounded-xl border border-border bg-background-secondary p-8 text-center ${className}`}
      >
        <p className="text-foreground-muted">{t('unavailable')}</p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border ${className}`}>
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '480px' }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        attributionControl={false}
      >
        <NavigationControl position="top-right" />

        {zones.map((zone) => (
          <Marker
            key={zone.id}
            latitude={zone.latitude}
            longitude={zone.longitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleMarkerClick(zone);
            }}
          >
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg ring-2 ring-white/80 hover:scale-110 transition-transform"
              aria-label={t(`zones.${zone.nameKey}`)}
            >
              {zone.producers > 99 ? '99+' : zone.producers}
            </button>
          </Marker>
        ))}

        {selectedZone && (
          <Popup
            latitude={selectedZone.latitude}
            longitude={selectedZone.longitude}
            anchor="top"
            onClose={() => setSelectedZone(null)}
            closeButton
            closeOnClick={false}
          >
            <div className="p-1 min-w-[160px]">
              <p className="font-semibold text-sm">{t(`zones.${selectedZone.nameKey}`)}</p>
              <p className="text-xs text-gray-600 mt-1">
                {t('producers', { count: selectedZone.producers })}
              </p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

export default TraceabilityMap;
