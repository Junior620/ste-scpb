'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DEMO_PARCELS, type DemoParcel } from '@/data/cocoatrack-demo';

const RISK_COLORS = {
  low: '#10B981',
  medium: '#F59E0B',
  verified: '#3B82F6',
};

export function CocoaTrackDemoMap() {
  const t = useTranslations('cocoatrackDemo.map');
  const [selected, setSelected] = useState<DemoParcel | null>(null);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const initialViewState = useMemo(() => ({ latitude: 4.2, longitude: 11.4, zoom: 6.2 }), []);

  const handleSelect = useCallback((parcel: DemoParcel) => {
    setSelected(parcel);
  }, []);

  if (!mapboxToken) {
    return (
      <div className="rounded-xl border border-border bg-background-secondary p-8 text-center text-foreground-muted">
        {t('unavailable')}
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-border">
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '520px' }}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        attributionControl={false}
      >
        <NavigationControl position="top-right" />

        {DEMO_PARCELS.map((parcel) => (
          <Marker
            key={parcel.id}
            latitude={parcel.latitude}
            longitude={parcel.longitude}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleSelect(parcel);
            }}
          >
            <button
              type="button"
              className="h-3 w-3 rounded-full ring-2 ring-white shadow-md hover:scale-125 transition-transform"
              style={{ backgroundColor: RISK_COLORS[parcel.riskLevel] }}
              aria-label={parcel.id}
            />
          </Marker>
        ))}

        {selected && (
          <Popup
            latitude={selected.latitude}
            longitude={selected.longitude}
            anchor="top"
            onClose={() => setSelected(null)}
            closeButton
          >
            <div className="p-1 text-sm min-w-[180px]">
              <p className="font-semibold">{selected.id}</p>
              <p className="text-gray-600">{t(`zones.${selected.zoneKey}`)}</p>
              <p className="text-gray-600">{t('area', { ha: selected.areaHa })}</p>
              <p className="text-gray-600">{t(`risk.${selected.riskLevel}`)}</p>
            </div>
          </Popup>
        )}
      </Map>

      <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 rounded-lg bg-background/90 px-3 py-2 text-xs border border-border">
        {(Object.keys(RISK_COLORS) as Array<keyof typeof RISK_COLORS>).map((key) => (
          <span key={key} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: RISK_COLORS[key] }}
            />
            {t(`risk.${key}`)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default CocoaTrackDemoMap;
