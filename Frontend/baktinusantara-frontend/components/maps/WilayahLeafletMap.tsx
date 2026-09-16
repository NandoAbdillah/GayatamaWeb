'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Building, MapPin, Navigation, Sparkles, Compass } from 'lucide-react';
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

function MapFloatingControls({ polyCenter }: { polyCenter?: [number, number] }) {
  const map = useMap();
  return (
    <div className="absolute left-4 sm:left-6 bottom-20 z-[400] flex flex-col gap-2 pointer-events-auto">
      <div className="flex flex-col bg-white/95 dark:bg-navy-900/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 dark:border-navy-700 overflow-hidden divide-y divide-slate-100 dark:divide-navy-800">
        <button
          type="button"
          onClick={() => map.zoomIn()}
          aria-label="Zoom in"
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-navy-950 dark:text-white hover:bg-emerald-50 dark:hover:bg-navy-800 font-bold text-lg transition-colors"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => map.zoomOut()}
          aria-label="Zoom out"
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-navy-950 dark:text-white hover:bg-emerald-50 dark:hover:bg-navy-800 font-bold text-lg transition-colors"
        >
          −
        </button>
      </div>

      {polyCenter && (
        <button
          type="button"
          onClick={() => map.flyTo(polyCenter, 11, { duration: 1.2 })}
          aria-label="Fokus Wilayah"
          title="Fokus ke Pusat Wilayah"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/95 dark:bg-navy-900/95 backdrop-blur-md shadow-xl border border-emerald-300 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-navy-800 transition-all hover:scale-105"
        >
          <Compass className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Custom DivIcon Creators for rich styling without broken asset URLs
const createCampusIcon = (campusLabel: string) =>
  L.divIcon({
    className: 'custom-campus-pin !bg-transparent !border-0 !shadow-none',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate3d(0,0,0);">
        <div style="width: 40px; height: 40px; border-radius: 9999px; background: #0284c7; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 10px 20px -3px rgba(2, 132, 199, 0.5);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
        </div>
        <div style="background: #0f172a; color: #ffffff; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; margin-top: 4px; white-space: nowrap; border: 1.5px solid #38bdf8; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transform: translateZ(0);">
          🎓 ${campusLabel}
        </div>
      </div>
    `,
    iconSize: [130, 60],
    iconAnchor: [65, 30],
  });

const createPosIcon = (isSelected: boolean, name: string, distanceKm?: number) =>
  L.divIcon({
    className: 'custom-pos-pin !bg-transparent !border-0 !shadow-none',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate3d(0,0,0); transition: all 0.2s ease;">
        <div style="display: flex; align-items: center; gap: 6px; background: ${
          isSelected ? '#064e3b' : '#ffffff'
        }; color: ${
          isSelected ? '#ffffff' : '#0f172a'
        }; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; box-shadow: ${
          isSelected ? '0 8px 20px rgba(16, 185, 129, 0.5), 0 0 0 2.5px #10b981' : '0 4px 12px rgba(0, 0, 0, 0.18)'
        }; border: 1.5px solid ${isSelected ? '#34d399' : '#cbd5e1'}; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transform: translateZ(0);">
          <span style="width: 7px; height: 7px; border-radius: 9999px; background: ${
            isSelected ? '#34d399' : '#10b981'
          }; display: inline-block; flex-shrink: 0;"></span>
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${name}</span>
          ${distanceKm !== undefined ? `<span style="opacity: 0.8; font-size: 9px; font-weight: 600; flex-shrink: 0;">• ${distanceKm}k</span>` : ''}
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${
          isSelected ? '#064e3b' : '#ffffff'
        }; margin-top: -1px;"></div>
      </div>
    `,
    iconSize: [140, 36],
    iconAnchor: [70, 36],
  });

// Custom DivIcon for Region Centroid with Official Logo
const createRegionCentroidIcon = (name: string, code: string, logoUrl?: string) => {
  const logoSrc = logoUrl || `https://wilayah.smartartstudio.my.id/wilayah-logo/${code}.png`;
  return L.divIcon({
    className: 'custom-region-pin !bg-transparent !border-0 !shadow-none',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate3d(0,0,0);">
        <div style="width: 48px; height: 48px; border-radius: 9999px; border: 3px solid #10b981; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 0 30px rgba(16, 185, 129, 0.7); padding: 3px; background: white;">
          <img src="${logoSrc}" alt="${name}" style="width: 100%; height: 100%; object-fit: contain;" onerror="this.style.display='none'" />
        </div>
        <div style="background: #064e3b; color: #6ee7b7; font-size: 10px; font-weight: 800; padding: 2.5px 10px; border-radius: 9999px; margin-top: 4px; white-space: nowrap; border: 1.5px solid #10b981; box-shadow: 0 4px 10px rgba(0,0,0,0.4); transform: translateZ(0);">
          🏛️ ${name}
        </div>
      </div>
    `,
    iconSize: [150, 70],
    iconAnchor: [75, 35],
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
  className?: string;
  showFloatingBadges?: boolean;
  controlsBottomOffset?: string;
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
  className = 'w-full h-full relative isolate',
  showFloatingBadges = false,
  controlsBottomOffset = 'bottom-28',
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
    <div className={className}>
      {/* Loading Overlay - pointer-events-none so map remains interactive */}
      {isLoadingPolygon && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-[400] bg-white/90 dark:bg-navy-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200 dark:border-navy-700 shadow-xl flex items-center gap-2 text-xs font-bold text-primary animate-pulse pointer-events-none isolate">
          <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>{tLeaflet('loadingBoundary', { regionName })}</span>
        </div>
      )}

      {/* Optional Floating Active Region Crest Badge */}
      {showFloatingBadges && regionName && !isLoadingPolygon && (
        <div className="absolute top-28 left-6 z-[400] bg-white/95 dark:bg-navy-950/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-300 dark:border-emerald-800/80 shadow-xl flex items-center gap-3 select-none pointer-events-auto isolate">
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

      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <MapSizeInvalidator />
        <ChangeView center={center} zoom={zoom} bounds={polyBounds} />
        <MapFloatingControls polyCenter={polyCenter} />

        {/* Modern Map Tile Layer (CartoDB Positron / OSM) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          // url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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

      {/* Map Legend Overlay - compact non-intrusive badge */}
      <div className="absolute bottom-4 left-4 sm:left-6 z-[300] inline-flex items-center gap-3 bg-white/95 dark:bg-navy-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-200/90 dark:border-navy-800 text-[11px] text-slate-700 dark:text-slate-300 shadow-lg pointer-events-none select-none">
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="w-2 h-2 rounded-full bg-primary" /> {tLeaflet('legendCampus')}
        </span>
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-300" /> {tLeaflet('legendSelectedPos')}
        </span>
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="w-2.5 h-1.5 rounded bg-emerald-400/40 border border-emerald-500" /> {tLeaflet('legendPolygon')}
        </span>
      </div>
    </div>
  );
}
