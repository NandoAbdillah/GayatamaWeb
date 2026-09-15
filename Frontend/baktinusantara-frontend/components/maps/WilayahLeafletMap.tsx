'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Building, MapPin, Navigation, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Custom Map Controller to auto flyTo center when coordinates change
function ChangeView({ center, zoom, bounds }: { center: [number, number]; zoom: number; bounds?: any }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.isValid && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    } else if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, bounds, map]);

  return null;
}

// Invalidator to fix "teks menempel" bug when scrolling / container resize
// Without invalidateSize, Leaflet tiles/markers desync after page scroll or parent resize
function MapSizeInvalidator() {
  const map = useMap();
  useEffect(() => {
    // Initial invalidate after mount (tiles + pane positions)
    const tmaps = setTimeout(() => map.invalidateSize(), 150);
    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    const container = map.getContainer();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(container);
    }
    // Also invalidate on scroll (fixes sticky overlay text due to composited layer)
    window.addEventListener('scroll', onResize, { passive: true });
    return () => {
      clearTimeout(tmaps);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize);
      if (ro) ro.disconnect();
    };
  }, [map]);
  return null;
}

// Custom DivIcon Creators for rich styling without broken asset URLs
const createCampusIcon = (campusLabel: string) =>
  L.divIcon({
    className: 'custom-campus-pin !bg-transparent !border-0 !shadow-none',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate3d(0,0,0);">
        <div style="width: 38px; height: 38px; border-radius: 9999px; background: #0284c7; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 10px 15px -3px rgba(2, 132, 199, 0.4);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
        </div>
        <div style="background: #0f172a; color: #ffffff; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; margin-top: 3px; white-space: nowrap; border: 1px solid #38bdf8; transform: translateZ(0);">
          ${campusLabel}
        </div>
      </div>
    `,
    iconSize: [120, 56],
    iconAnchor: [60, 28],
  });

const createPosIcon = (isSelected: boolean, name: string, distanceKm?: number) =>
  L.divIcon({
    className: 'custom-pos-pin !bg-transparent !border-0 !shadow-none',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate3d(0,0,0);">
        <div style="width: 32px; height: 32px; border-radius: 9999px; background: ${
          isSelected ? '#10b981' : '#1e293b'
        }; border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; box-shadow: ${
      isSelected ? '0 0 20px rgba(16, 185, 129, 0.7)' : '0 4px 6px -1px rgba(0,0,0,0.3)'
    };">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div style="background: ${
          isSelected ? '#10b981' : 'rgba(15, 23, 42, 0.92)'
        }; color: #ffffff; font-size: 10px; font-weight: ${
      isSelected ? '800' : '600'
    }; padding: 2px 8px; border-radius: 9999px; margin-top: 2px; white-space: nowrap; box-shadow: 0 2px 5px rgba(0,0,0,0.3); border: 1px solid ${
      isSelected ? '#34d399' : '#334155'
    }; transform: translateZ(0);">
          ${name} ${distanceKm !== undefined ? `(${distanceKm} km)` : ''}
        </div>
      </div>
    `,
    iconSize: [140, 50],
    iconAnchor: [70, 16],
  });

// Custom DivIcon for Region Centroid with Official Logo
const createRegionCentroidIcon = (name: string, code: string, logoUrl?: string) => {
  const logoSrc = logoUrl || `https://wilayah.smartartstudio.my.id/wilayah-logo/${code}.png`;
  return L.divIcon({
    className: 'custom-region-pin !bg-transparent !border-0 !shadow-none',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate3d(0,0,0);">
        <div style="width: 44px; height: 44px; border-radius: 9999px; border: 3px solid #10b981; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 0 25px rgba(16, 185, 129, 0.6); padding: 3px; background: white;">
          <img src="${logoSrc}" alt="${name}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.style.display='none'" />
        </div>
        <div style="background: #064e3b; color: #6ee7b7; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 9999px; margin-top: 3px; white-space: nowrap; border: 1px solid #10b981; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4); transform: translateZ(0);">
          🏛️ ${name}
        </div>
      </div>
    `,
    iconSize: [140, 64],
    iconAnchor: [70, 32],
  });
};

export interface MapMarkerItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'campus' | 'pos' | 'capital';
  description?: string;
  distanceKm?: number;
  data?: any;
}

interface WilayahLeafletMapProps {
  center: [number, number];
  zoom?: number;
  polygonPath?: [number, number][][] | [number, number][][][];
  regionName?: string;
  regionCode?: string;
  regionLogoUrl?: string;
  regionCapital?: string;
  regionPopulation?: number;
  regionArea?: number;
  markers?: MapMarkerItem[];
  radiusKm?: number;
  selectedMarkerId?: string;
  onSelectMarker?: (marker: MapMarkerItem) => void;
  isLoadingPolygon?: boolean;
}

export default function WilayahLeafletMap({
  center,
  zoom = 10,
  polygonPath = [],
  regionName = '',
  regionCode = '',
  regionLogoUrl = '',
  regionCapital = '',
  regionPopulation,
  regionArea,
  markers = [],
  radiusKm,
  selectedMarkerId,
  onSelectMarker,
  isLoadingPolygon = false,
}: WilayahLeafletMapProps) {
  const tLeaflet = useTranslations('maps.leaflet');
  const tmaps = useTranslations('maps');
  // Compute bounds and centroid if polygon exists
  let polyBounds: L.LatLngBounds | undefined = undefined;
  let polyCenter: [number, number] | undefined = undefined;

  if (polygonPath && polygonPath.length > 0) {
    try {
      const flatCoords: [number, number][] = [];
      const flatten = (arr: any[]) => {
        if (typeof arr[0] === 'number') {
          flatCoords.push(arr as [number, number]);
        } else {
          arr.forEach(flatten);
        }
      };
      flatten(polygonPath);

      if (flatCoords.length > 0) {
        polyBounds = L.latLngBounds(flatCoords.map((c) => L.latLng(c[0], c[1])));
        polyCenter = [polyBounds.getCenter().lat, polyBounds.getCenter().lng];
      }
    } catch (e) {
      console.warn('Could not calculate polygon bounds', e);
    }
  }

  const effectiveLogoUrl =
    regionLogoUrl ||
    (regionCode ? `https://wilayah.smartartstudio.my.id/wilayah-logo/${regionCode}.png` : '');

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-navy-800 isolate transform-gpu">
      {/* Loading Overlay - pointer-events-none so map remains interactive, isolated stacking */}
      {isLoadingPolygon && (
        <div className="absolute top-4 right-4 z-[400] bg-white/90 dark:bg-navy-900/90 backdrop-blur-md px-3.5 py-2 rounded-full border border-slate-200 dark:border-navy-700 shadow-lg flex items-center gap-2 text-xs font-bold text-primary animate-pulse pointer-events-none isolate">
          <div className="w-3.5 h-3.5 border-2 border-primary border-tmaps-transparent rounded-full animate-spin" />
          <span>{tLeaflet('loadingBoundary', { regionName })}</span>
        </div>
      )}

      {/* Floating Active Region Official Crest Badge (Top Right) - inside isolate container, not fixed */}
      {regionName && !isLoadingPolygon && (
        <div className="absolute top-4 right-4 z-[400] bg-white/95 dark:bg-navy-950/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-300 dark:border-emerald-800/80 shadow-xl flex items-center gap-3 transition-all hover:scale-[1.02] select-none pointer-events-auto isolate">
          <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-navy-900 border border-slate-200 dark:border-navy-800 flex items-center justify-center p-0.5 shadow-sm shrink-0 overflow-hidden">
            {effectiveLogoUrl ? (
              <img
                src={effectiveLogoUrl}
                alt={regionName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Building className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {regionCode.length === 2 ? tLeaflet('province') : tLeaflet('regencyCity')}
              </span>
              {regionCode && (
                <span className="text-[9px] font-mono bg-slate-100 dark:bg-navy-900 text-slate-500 px-1 rounded">
                  ID: {regionCode}
                </span>
              )}
            </div>
            <h4 className="font-extrabold text-xs text-navy-950 dark:text-white leading-tight truncate max-w-[140px]">
              {regionName}
            </h4>
          </div>
        </div>
      )}

      {/* Campus Coordinate Badge (Top Left) */}
      <div className="absolute top-4 left-4 z-[400] bg-white/90 dark:bg-navy-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 dark:border-navy-800 text-xs font-semibold text-navy-950 dark:text-white shadow-md flex items-center gap-2 pointer-events-none isolate max-w-[60%]">
        <Navigation className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="truncate">{tLeaflet('campusCoordinate', { lat: center[0].toFixed(4), lng: center[1].toFixed(4) })}</span>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ height: '100%', width: '100%', minHeight: '550px' }}
      >
        <MapSizeInvalidator />
        <ChangeView center={center} zoom={zoom} bounds={polyBounds} />

        {/* Modern Map Tile Layer (CartoDB Positron / OSM) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Radius Circle from Campus */}
        {radiusKm && (
          <Circle
            center={center}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#0284c7',
              fillColor: '#38bdf8',
              fillOpacity: 0.08,
              weight: 2,
              dashArray: '6, 6',
            }}
          />
        )}

        {/* Real Boundary Polygons from Emsifa API */}
        {polygonPath && polygonPath.length > 0 && (
          <Polygon
            positions={polygonPath as any}
            pathOptions={{
              color: '#10b981',
              weight: 3,
              opacity: 0.9,
              fillColor: '#34d399',
              fillOpacity: 0.18,
            }}
          >
            <Popup>
              <div className="p-2 space-y-2 max-w-[240px]">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1 shrink-0 shadow-sm">
                    {effectiveLogoUrl ? (
                      <img
                        src={effectiveLogoUrl}
                        alt={regionName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Building className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                      {regionCode.length === 2 ? tLeaflet('provinceGov') : tLeaflet('regencyGov')}
                    </span>
                    <h4 className="font-extrabold text-xs text-navy-950 leading-tight">
                      {regionName || tLeaflet('wilayahTerpilih')}
                    </h4>
                    {regionCode && (
                      <span className="text-[10px] font-mono text-slate-500 block">{tLeaflet('code')} {regionCode}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600">
                  {regionCapital && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">{tLeaflet('capital')}</span>
                      <strong className="text-navy-900">{regionCapital}</strong>
                    </div>
                  )}
                  {regionPopulation && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">{tLeaflet('population')}</span>
                      <strong className="text-navy-900">{regionPopulation.toLocaleString('id-ID')} {tmaps('region.populationUnit')}</strong>
                    </div>
                  )}
                  {regionArea && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">{tLeaflet('area')}</span>
                      <strong className="text-navy-900">{regionArea.toLocaleString('id-ID')} {tmaps('region.areaUnit')}</strong>
                    </div>
                  )}
                  <p className="text-[10px] text-emerald-700 pt-1 italic font-medium">
                    {tLeaflet('officialBoundary')}
                  </p>
                </div>
              </div>
            </Popup>
          </Polygon>
        )}

        {/* Region Centroid Marker with Official Logo Badge */}
        {polyCenter && regionName && (
          <Marker
            position={polyCenter}
            icon={createRegionCentroidIcon(regionName, regionCode || 'ID', effectiveLogoUrl)}
          >
            <Popup>
              <div className="p-2 space-y-1 text-center">
                <div className="w-12 h-12 mx-auto mb-1">
                  <img src={effectiveLogoUrl} alt={regionName} className="w-full h-full object-contain" />
                </div>
                <h4 className="font-extrabold text-xs text-navy-950">{regionName}</h4>
                <p className="text-[10px] text-slate-500">{tLeaflet('centroidPoint')}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Campus Marker */}
        <Marker position={center} icon={createCampusIcon(tLeaflet('campusLabel'))}>
          <Popup>
            <div className="p-2 space-y-1">
              <h4 className="font-bold text-xs text-primary">{tLeaflet('campusTitle')}</h4>
              <p className="text-[11px] text-slate-600">{tLeaflet('campusDesc')}</p>
            </div>
          </Popup>
        </Marker>

        {/* Village / Pos KKN Markers */}
        {markers.map((marker) => {
          const isSelected = marker.id === selectedMarkerId;
          return (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={createPosIcon(isSelected, marker.name, marker.distanceKm)}
              eventHandlers={{
                click: () => onSelectMarker && onSelectMarker(marker),
              }}
            >
              <Popup>
                <div className="p-2 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    {tLeaflet('posNeed')}
                  </span>
                  <h4 className="font-bold text-xs text-navy-950">{marker.name}</h4>
                  {marker.distanceKm !== undefined && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      {tLeaflet('distanceFromCampus', { distance: marker.distanceKm })}
                    </p>
                  )}
                  {marker.description && (
                    <p className="text-[11px] text-slate-600 line-clamp-2">{marker.description}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay - isolated, pointer-events-none wrapper */}
      <div className="absolute bottom-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between bg-white/95 dark:bg-navy-950/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-800 text-xs text-slate-700 dark:text-slate-300 shadow-lg gap-2 pointer-events-none isolate">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" /> {tLeaflet('legendCampus')}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-300" /> {tLeaflet('legendSelectedPos')}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-2 rounded bg-emerald-400/40 border border-emerald-500" /> {tLeaflet('legendPolygon')}
          </span>
          <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> {tLeaflet('legendLogo')}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> API: edopandoyo/wilayah-indonesia-api & emsifa v2
        </span>
      </div>
    </div>
  );
}
