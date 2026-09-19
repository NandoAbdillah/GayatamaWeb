'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Building, MapPin, Navigation, Sparkles, Compass, Landmark, Home, GraduationCap, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Custom Map Controller to auto flyTo center when coordinates change
function ChangeView({ center, zoom, bounds }: { center: [number, number]; zoom: number; bounds?: any }) {
  const map = useMap();
  const prevBoundsKeyRef = React.useRef<string>('');
  const prevCenterKeyRef = React.useRef<string>('');

  useEffect(() => {
    try {
      if (!map) return;
      const boundsKey = bounds && bounds.isValid && bounds.isValid() ? bounds.toBBoxString() : '';
      const centerKey = center ? `${center[0].toFixed(4)},${center[1].toFixed(4)},${zoom}` : '';

      if (boundsKey && boundsKey !== prevBoundsKeyRef.current) {
        prevBoundsKeyRef.current = boundsKey;
        prevCenterKeyRef.current = centerKey;
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      } else if (centerKey && centerKey !== prevCenterKeyRef.current) {
        prevCenterKeyRef.current = centerKey;
        map.flyTo(center, zoom, { duration: 1.2 });
      }
    } catch (e) {
      // ignore during unmount / navigation
    }
  }, [center, zoom, bounds, map]);

  return null;
}

// Invalidator to fix "teks menempel" bug when scrolling / container resize
// Without invalidateSize, Leaflet tiles/markers desync after page scroll or parent resize
function MapSizeInvalidator() {
  const map = useMap();
  useEffect(() => {
    const safeInvalidate = () => {
      try {
        if (map && map.getContainer()) {
          map.invalidateSize();
        }
      } catch (e) {
        // ignore if map is unmounted
      }
    };

    const tmaps = setTimeout(safeInvalidate, 150);
    window.addEventListener('resize', safeInvalidate);
    window.addEventListener('scroll', safeInvalidate, { passive: true });

    let ro: ResizeObserver | null = null;
    try {
      const container = map.getContainer();
      if (typeof ResizeObserver !== 'undefined' && container) {
        ro = new ResizeObserver(safeInvalidate);
        ro.observe(container);
      }
    } catch (e) {
      // ignore
    }

    return () => {
      clearTimeout(tmaps);
      window.removeEventListener('resize', safeInvalidate);
      window.removeEventListener('scroll', safeInvalidate);
      if (ro) ro.disconnect();
    };
  }, [map]);
  return null;
}

function ZoomTracker({ onZoomChange }: { onZoomChange: (z: number) => void }) {
  const map = useMap();
  useEffect(() => {
    try {
      if (!map) return;
      onZoomChange(map.getZoom());
      const onZoom = () => {
        try {
          if (map) onZoomChange(map.getZoom());
        } catch (e) {}
      };
      map.on('zoomend', onZoom);
      return () => {
        try {
          map.off('zoomend', onZoom);
        } catch (e) {}
      };
    } catch (e) {}
  }, [map, onZoomChange]);
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
        <div style="background: #0f172a; color: #ffffff; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 9999px; margin-top: 4px; white-space: nowrap; border: 1.5px solid #38bdf8; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transform: translateZ(0); display: flex; align-items: center; gap: 4px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-.838L12.83 2.18a2 2 0 0 0-1.66 0L2.6 10.084a1 1 0 0 0 0 1.832l8.57 7.908a2 2 0 0 0 1.66 0l8.57-7.908a1 1 0 0 0 .02-.994Z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>
          <span>${campusLabel}</span>
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
      <div class="pos-pin-wrapper" style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="display: flex; align-items: center; gap: 6px; background: ${
          isSelected ? '#064e3b' : '#ffffff'
        }; color: ${
          isSelected ? '#ffffff' : '#0f172a'
        }; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; box-shadow: ${
          isSelected ? '0 8px 20px rgba(16, 185, 129, 0.5), 0 0 0 2.5px #10b981' : '0 4px 12px rgba(0, 0, 0, 0.18)'
        }; border: 1.5px solid ${isSelected ? '#34d399' : '#cbd5e1'}; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
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

const createCollegeIcon = (
  name: string,
  shortName?: string,
  logoUrl?: string,
  jenis?: string,
  kelompok?: string,
  isSelected?: boolean
) => {
  const isPTN = kelompok?.toUpperCase() === 'PTN' || jenis?.toLowerCase().includes('negeri') || false;
  const borderColor = isSelected
    ? isPTN ? '#10b981' : '#6366f1'
    : isPTN ? '#059669' : '#4f46e5';
  const glow = isSelected
    ? `0 0 0 3px ${isPTN ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.4)'}, 0 6px 16px rgba(0,0,0,0.25)`
    : '0 3px 10px rgba(0, 0, 0, 0.14)';
  const labelBadge = isPTN ? 'PTN' : 'PTS';
  const badgeBg = isPTN ? '#047857' : '#4338ca';

  const displayName = shortName ? `${shortName} - ${name}` : name;

  const fallbackSvg = `
    <div class="campus-svg-fallback" style="display: ${logoUrl ? 'none' : 'flex'}; width: 100%; height: 100%; align-items: center; justify-content: center; color: ${isPTN ? '#047857' : '#4338ca'};">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.42 10.922a1 1 0 0 0-.019-.838L12.83 2.18a2 2 0 0 0-1.66 0L2.6 10.084a1 1 0 0 0 0 1.832l8.57 7.908a2 2 0 0 0 1.66 0l8.57-7.908a1 1 0 0 0 .02-.994Z"/>
        <path d="M22 10v6"/>
        <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
      </svg>
    </div>
  `;

  const logoImg = logoUrl
    ? `<img src="${logoUrl}" alt="${name}" style="width: 24px; height: 24px; object-fit: contain; border-radius: 4px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />`
    : '';

  return L.divIcon({
    className: 'custom-college-pin !bg-transparent !border-0 !shadow-none',
    html: `
      <div class="campus-pin-wrapper" style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <!-- Floating Hover Tooltip (Always pointer-events: none to prevent flicker) -->
        <div class="campus-tooltip" style="position: absolute; bottom: 100%; margin-bottom: 6px; left: 50%; transform: translateX(-50%); opacity: 0; pointer-events: none !important; transition: opacity 0.15s ease-out, transform 0.15s ease-out; background: #0f172a; color: #ffffff; padding: 4px 10px; border-radius: 9999px; font-size: 10px; font-weight: 700; white-space: nowrap; box-shadow: 0 6px 20px rgba(0,0,0,0.35); border: 1.5px solid ${isPTN ? '#34d399' : '#818cf8'}; z-index: 99999; display: flex; align-items: center; gap: 5px;">
          <span style="background: ${isPTN ? '#059669' : '#4f46e5'}; color: #ffffff; font-size: 8px; font-weight: 800; padding: 1px 5px; border-radius: 9999px; letter-spacing: 0.3px;">${labelBadge}</span>
          <span style="max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${displayName}</span>
          <div style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 5px solid #0f172a;"></div>
        </div>

        <!-- Disc Pin Icon (Compact 36px, zero stacking at normal zoom) -->
        <div class="campus-disc" style="width: 36px; height: 36px; border-radius: 9999px; background: #ffffff; border: 2.5px solid ${borderColor}; box-shadow: ${glow}; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 3px; position: relative;">
          ${logoImg}
          ${fallbackSvg}
        </div>

        <!-- Mini Status Pip (PTN / PTS) -->
        <div style="position: absolute; bottom: -5px; background: ${badgeBg}; color: #ffffff; font-size: 8px; font-weight: 900; padding: 1px 5px; border-radius: 9999px; border: 1.5px solid #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.2); letter-spacing: 0.5px; white-space: nowrap;">
          ${labelBadge}
        </div>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 38],
  });
};

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
        <div style="background: #064e3b; color: #6ee7b7; font-size: 10px; font-weight: 800; padding: 2.5px 10px; border-radius: 9999px; margin-top: 4px; white-space: nowrap; border: 1.5px solid #10b981; box-shadow: 0 4px 10px rgba(0,0,0,0.4); transform: translateZ(0); display: flex; align-items: center; gap: 4px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22h18"/><path d="M6 18V9"/><path d="M10 18V9"/><path d="M14 18V9"/><path d="M18 18V9"/><path d="M12 2 2 7v2h20V7Z"/></svg>
          <span>${name}</span>
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
  const { polyBounds, polyCenter } = React.useMemo(() => {
    let bounds: L.LatLngBounds | undefined = undefined;
    let centerPt: [number, number] | undefined = undefined;

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
          bounds = L.latLngBounds(flatCoords.map((c) => L.latLng(c[0], c[1])));
          centerPt = [bounds.getCenter().lat, bounds.getCenter().lng];
        }
      } catch (e) {
        console.warn('Could not calculate polygon bounds', e);
      }
    }
    return { polyBounds: bounds, polyCenter: centerPt };
  }, [polygonPath]);

  const effectiveLogoUrl =
    regionLogoUrl ||
    (regionCode ? `https://wilayah.smartartstudio.my.id/wilayah-logo/${regionCode}.png` : '');

  // Zoom-aware state for dynamic clutter prevention
  const [currentZoomLevel, setCurrentZoomLevel] = React.useState(zoom);

  React.useEffect(() => {
    setCurrentZoomLevel(zoom);
  }, [zoom]);

  // Compute displayed markers with intelligent anti-stacking logic when zoomed out
  const displayedMarkers = React.useMemo(() => {
    const posMarkers = markers.filter((m) => m.type !== 'campus');
    const campusMarkers = markers.filter((m) => m.type === 'campus');

    let activeCampuses = campusMarkers;

    // When zoomed out at province or national level (zoom < 10), prevent clustering blob
    // by prioritizing prominent universities (PTN, selected, or high-profile) up to 18 max
    if (currentZoomLevel < 10 && campusMarkers.length > 18) {
      const selected = campusMarkers.filter((m) => m.id === selectedMarkerId);
      const others = campusMarkers.filter((m) => m.id !== selectedMarkerId);

      const ptns = others.filter(
        (m) =>
          m.data?.kelompok === 'PTN' ||
          String(m.data?.id || '').toLowerCase().startsWith('ptn') ||
          m.data?.jenis?.toLowerCase().includes('negeri')
      );
      const pts = others.filter(
        (m) =>
          m.data?.kelompok !== 'PTN' &&
          !String(m.data?.id || '').toLowerCase().startsWith('ptn') &&
          !m.data?.jenis?.toLowerCase().includes('negeri')
      );

      // Prioritize top PTNs and top PTS across the region
      activeCampuses = [...selected, ...ptns.slice(0, 12), ...pts.slice(0, 6)];
    }

    // Micro-spacing offset to ensure two universities sharing exact same coordinate do not stack
    const placedPositions: Array<{ lat: number; lng: number }> = [];
    const spacedCampuses = activeCampuses.map((cm, idx) => {
      let lat = cm.lat;
      let lng = cm.lng;
      const overlap = placedPositions.find(
        (p) => Math.abs(p.lat - lat) < 0.0035 && Math.abs(p.lng - lng) < 0.0035
      );
      if (overlap) {
        const angle = ((idx * 45) % 360) * (Math.PI / 180);
        const dist = 0.004; // ~400 meters offset
        lat += Math.sin(angle) * dist;
        lng += Math.cos(angle) * dist;
      }
      placedPositions.push({ lat, lng });
      return { ...cm, lat, lng };
    });

    return [...posMarkers, ...spacedCampuses];
  }, [markers, currentZoomLevel, selectedMarkerId]);

  return (
    <div className={className}>
      {/* Global CSS for Stable, Shake-Free Campus Badges & Hover Tooltips */}
      <style>{`
        .custom-college-pin {
          z-index: 250 !important;
        }
        .custom-college-pin:hover {
          z-index: 99999 !important;
        }
        .custom-college-pin .campus-pin-wrapper {
          transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: center bottom;
        }
        .custom-college-pin:hover .campus-pin-wrapper {
          transform: translateY(-2px);
        }
        .custom-college-pin .campus-disc {
          transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.15s ease;
          transform-origin: center center;
        }
        .custom-college-pin:hover .campus-disc {
          transform: scale(1.08);
          box-shadow: 0 8px 18px rgba(0,0,0,0.25) !important;
        }
        .custom-college-pin .campus-tooltip {
          pointer-events: none !important;
          opacity: 0;
          transform: translateX(-50%) translateY(0);
          transition: opacity 0.15s ease-out, transform 0.15s ease-out;
        }
        .custom-college-pin:hover .campus-tooltip {
          opacity: 1 !important;
          transform: translateX(-50%) translateY(-4px) !important;
          pointer-events: none !important;
        }
        .custom-pos-pin {
          z-index: 240 !important;
        }
        .custom-pos-pin:hover {
          z-index: 99998 !important;
        }
        .custom-pos-pin .pos-pin-wrapper {
          transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: center bottom;
        }
        .custom-pos-pin:hover .pos-pin-wrapper {
          transform: scale(1.05) translateY(-1px);
        }
      `}</style>

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
            ) : regionCode.split('.').length >= 4 ? (
              <Home className="w-5 h-5 text-emerald-600" />
            ) : regionCode.split('.').length >= 3 ? (
              <Landmark className="w-5 h-5 text-emerald-600" />
            ) : (
              <Building className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {regionCode.split('.').length >= 4
                  ? 'Desa / Kelurahan'
                  : regionCode.split('.').length >= 3
                  ? 'Kecamatan / Distrik'
                  : regionCode.includes('.')
                  ? tLeaflet('regencyCity')
                  : tLeaflet('province')}
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
        <ZoomTracker onZoomChange={setCurrentZoomLevel} />
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

        {/* Real Boundary Polygons from Emsifa API with sharp, high-contrast, and clear border */}
        {polygonPath && polygonPath.length > 0 && (
          <Polygon
            positions={polygonPath as any}
            pathOptions={{
              color: '#047857',
              weight: regionCode.includes('.') && regionCode.split('.').length >= 3 ? 4.5 : 3.5,
              opacity: 1,
              fillColor: '#10b981',
              fillOpacity: 0.24,
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

        {/* Village / Pos KKN & Campus Markers */}
        {displayedMarkers.map((marker) => {
          const isSelected = marker.id === selectedMarkerId;
          const isCollege = marker.type === 'campus';
          const isPTN = isCollege && (marker.data?.kelompok === 'PTN' || String(marker.data?.id || '').toLowerCase().startsWith('ptn') || marker.data?.jenis?.toLowerCase().includes('negeri') || false);

          return (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={
                isCollege
                  ? createCollegeIcon(
                      marker.name,
                      marker.data?.short_name,
                      marker.data?.logo_url,
                      marker.data?.jenis,
                      marker.data?.kelompok,
                      isSelected
                    )
                  : createPosIcon(isSelected, marker.name, marker.distanceKm)
              }
              eventHandlers={{
                click: () => onSelectMarker && onSelectMarker(marker),
              }}
            >
              <Popup>
                {isCollege ? (
                  <div className="p-3 space-y-2.5 max-w-[280px] font-sans">
                    <div className="flex items-start gap-2.5 pb-2 border-b border-slate-100">
                      {marker.data?.logo_url ? (
                        <img
                          src={marker.data.logo_url}
                          alt={marker.name}
                          className="w-10 h-10 object-contain shrink-0 p-1 bg-slate-50 rounded-xl border border-slate-200 shadow-xs"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`w-10 h-10 rounded-xl ${
                          isPTN ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                        } border flex items-center justify-center shrink-0 ${marker.data?.logo_url ? 'hidden' : 'flex'}`}
                      >
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isPTN
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                            }`}
                          >
                            {isPTN ? 'PTN (Negeri)' : 'PTS (Swasta)'}
                          </span>
                          {marker.data?.jenis && (
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full border border-slate-200 capitalize">
                              {marker.data.jenis}
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-xs text-navy-950 leading-snug mt-1">
                          {marker.name}
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      {marker.data?.regency_name && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Wilayah:</span>
                          <strong className="text-navy-900 font-semibold">{marker.data.regency_name}</strong>
                        </div>
                      )}
                      {marker.data?.accreditation && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Akreditasi:</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {marker.data.accreditation}
                          </span>
                        </div>
                      )}
                    </div>

                    {marker.data?.website && (
                      <a
                        href={marker.data.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full gap-1.5 text-xs font-bold py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                      >
                        <span>Portal Kampus</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ) : (
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
                )}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay - compact non-intrusive badge */}
      <div className="absolute bottom-4 left-4 sm:left-6 z-[300] inline-flex items-center gap-3 bg-white/95 dark:bg-navy-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-200/90 dark:border-navy-800 text-[11px] text-slate-700 dark:text-slate-300 shadow-lg pointer-events-none select-none">
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-emerald-300" /> PTN
        </span>
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-indigo-300" /> PTS
        </span>
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-300" /> Pos Terpilih
        </span>
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="w-2.5 h-1.5 rounded bg-emerald-400/40 border border-emerald-500" /> Batas Wilayah
        </span>
      </div>

    </div>
  );
}
