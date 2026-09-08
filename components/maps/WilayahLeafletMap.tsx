'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Building, MapPin, Navigation, Sparkles } from 'lucide-react';

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

// Custom DivIcon Creators for rich styling without broken asset URLs
const createCampusIcon = () =>
  L.divIcon({
    className: 'custom-campus-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="width: 38px; height: 38px; border-radius: 9999px; background: #0284c7; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 10px 15px -3px rgba(2, 132, 199, 0.4);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>
        </div>
        <div style="background: #0f172a; color: #ffffff; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; margin-top: 3px; white-space: nowrap; border: 1px solid #38bdf8;">
          Pusat Kampus
        </div>
      </div>
    `,
    iconSize: [40, 50],
    iconAnchor: [20, 25],
  });

const createPosIcon = (isSelected: boolean, name: string, distanceKm?: number) =>
  L.divIcon({
    className: 'custom-pos-pin',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s ease;">
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
    };">
          ${name} ${distanceKm !== undefined ? `(${distanceKm} km)` : ''}
        </div>
      </div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 23],
  });

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
  markers = [],
  radiusKm,
  selectedMarkerId,
  onSelectMarker,
  isLoadingPolygon = false,
}: WilayahLeafletMapProps) {
  // Compute bounds if polygon exists
  let polyBounds: L.LatLngBounds | undefined = undefined;
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
      }
    } catch (e) {
      console.warn('Could not calculate polygon bounds', e);
    }
  }

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-navy-800">
      {/* Loading Overlay */}
      {isLoadingPolygon && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 dark:bg-navy-900/90 backdrop-blur-md px-3.5 py-2 rounded-full border border-slate-200 dark:border-navy-700 shadow-lg flex items-center gap-2 text-xs font-bold text-primary animate-pulse">
          <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Memuat Garis Batas Wilayah ({regionName})...</span>
        </div>
      )}

      {/* Campus Coordinate Badge */}
      <div className="absolute top-4 left-4 z-[1000] bg-white/90 dark:bg-navy-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200 dark:border-navy-800 text-xs font-semibold text-navy-950 dark:text-white shadow-md flex items-center gap-2">
        <Navigation className="w-3.5 h-3.5 text-primary" />
        <span>Pusat Kampus: Univ. Nusantara ({center[0].toFixed(4)}, {center[1].toFixed(4)})</span>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        style={{ height: '100%', width: '100%', minHeight: '550px' }}
      >
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
              <div className="p-1">
                <h4 className="font-bold text-xs text-navy-950">{regionName || 'Wilayah Terpilih'}</h4>
                <p className="text-[11px] text-slate-500">Batas Administrasi Resmi Kemendagri & BIG</p>
              </div>
            </Popup>
          </Polygon>
        )}

        {/* Campus Marker */}
        <Marker position={center} icon={createCampusIcon()}>
          <Popup>
            <div className="p-2 space-y-1">
              <h4 className="font-bold text-xs text-primary">Pusat Kampus Universitas Nusantara</h4>
              <p className="text-[11px] text-slate-600">Titik acuan radius perhitungan Haversine pos KKN.</p>
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
                    Pos Kebutuhan KKN
                  </span>
                  <h4 className="font-bold text-xs text-navy-950">{marker.name}</h4>
                  {marker.distanceKm !== undefined && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      Jarak dari kampus: <strong>{marker.distanceKm} km</strong>
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

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between bg-white/95 dark:bg-navy-950/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-navy-800 text-xs text-slate-700 dark:text-slate-300 shadow-lg gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Pusat Kampus
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-300" /> Pos Terpilih
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-2 rounded bg-emerald-400/40 border border-emerald-500" /> Batas Polygon Wilayah
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> API: emsifa.com/api-wilayah-indonesia v2
        </span>
      </div>
    </div>
  );
}
