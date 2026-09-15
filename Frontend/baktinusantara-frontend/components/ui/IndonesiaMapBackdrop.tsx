'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface HubPoint {
  id: string;
  name: string;
  province: string;
  x: number; // percentage % based on 1440x810 viewBox
  y: number; // percentage %
  delay: number; // animation delay (s)
  badge?: string;
  posCount?: number;
}

const KKN_HUBS: HubPoint[] = [
  { id: 'aceh', name: 'Banda Aceh', province: 'Aceh', x: 8.8, y: 28.5, delay: 0, badge: 'Pos Terbuka', posCount: 24 },
  { id: 'medan', name: 'Medan', province: 'Sumatera Utara', x: 13.2, y: 34.0, delay: 0.8, posCount: 38 },
  { id: 'padang', name: 'Padang', province: 'Sumatera Barat', x: 17.0, y: 48.0, delay: 1.4, posCount: 19 },
  { id: 'palembang', name: 'Palembang', province: 'Sumatera Selatan', x: 24.2, y: 55.5, delay: 2.1, posCount: 22 },
  { id: 'jakarta', name: 'DKI Jakarta', province: 'DKI Jakarta', x: 29.2, y: 66.0, delay: 0.3, badge: 'Hub Utama', posCount: 86 },
  { id: 'bandung', name: 'Bandung', province: 'Jawa Barat', x: 31.2, y: 67.2, delay: 1.1, posCount: 45 },
  { id: 'jogja', name: 'Yogyakarta', province: 'D.I. Yogyakarta', x: 35.4, y: 68.5, delay: 0.5, badge: 'Pos KKN', posCount: 52 },
  { id: 'surabaya', name: 'Surabaya', province: 'Jawa Timur', x: 40.2, y: 68.5, delay: 1.7, posCount: 60 },
  { id: 'bali', name: 'Denpasar', province: 'Bali', x: 44.5, y: 69.8, delay: 2.4, posCount: 28 },
  { id: 'mataram', name: 'Lombok', province: 'Nusa Tenggara Barat', x: 47.2, y: 69.8, delay: 0.9, posCount: 18 },
  { id: 'kupang', name: 'Kupang', province: 'Nusa Tenggara Timur', x: 55.5, y: 72.8, delay: 1.6, posCount: 21 },
  { id: 'pontianak', name: 'Pontianak', province: 'Kalimantan Barat', x: 32.6, y: 46.9, delay: 1.2, posCount: 26 },
  { id: 'banjarmasin', name: 'Banjarmasin', province: 'Kalimantan Selatan', x: 40.6, y: 59.8, delay: 2.0, posCount: 30 },
  { id: 'ikn', name: 'Nusantara / IKN', province: 'Kalimantan Timur', x: 44.0, y: 48.7, delay: 0.2, badge: 'Prioritas', posCount: 42 },
  { id: 'makassar', name: 'Makassar', province: 'Sulawesi Selatan', x: 48.2, y: 60.5, delay: 1.5, badge: 'Hub Timur', posCount: 37 },
  { id: 'manado', name: 'Manado', province: 'Sulawesi Utara', x: 55.2, y: 31.5, delay: 0.7, posCount: 16 },
  { id: 'ambon', name: 'Ambon', province: 'Maluku', x: 63.2, y: 54.9, delay: 2.2, posCount: 14 },
  { id: 'sorong', name: 'Sorong', province: 'Papua Barat Daya', x: 68.7, y: 45.0, delay: 1.0, posCount: 18 },
  { id: 'jayapura', name: 'Jayapura', province: 'Papua', x: 87.5, y: 45.6, delay: 0.4, badge: 'Perbatasan', posCount: 25 },
  { id: 'merauke', name: 'Merauke', province: 'Papua Selatan', x: 87.5, y: 70.3, delay: 1.8, badge: 'Terluar', posCount: 12 },
];

/**
 * IndonesiaMapBackdrop
 * Peta vektor Nusantara estetis, kontras, dan interaktif yang menjadi backdrop hero section.
 * Menggunakan teknik CSS Masked Gradients + Ambient Backplate Glow + Radar Sweep + 20 Bioluminescent Hub Nodes.
 */
export const IndonesiaMapBackdrop: React.FC = () => {
  const [activeHub, setActiveHub] = useState<HubPoint | null>(null);

  return (
    <div
      aria-hidden="false"
      className="absolute inset-0 flex items-center justify-center overflow-hidden select-none z-0 pointer-events-none"
    >
      {/* 1. Ambient Backplate Halo Glow (Memastikan pulau kontras & tidak tenggelam di background terang) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[1200px] h-[350px] sm:h-[450px] bg-gradient-to-r from-emerald-500/15 via-teal-400/12 to-sky-500/15 dark:from-emerald-500/25 dark:via-cyan-500/20 dark:to-blue-500/25 blur-3xl rounded-full pointer-events-none" />

      {/* 2. Container Utama Peta dengan Radial Masking Halus */}
      <div
        className="relative w-full max-w-[1440px] h-[480px] sm:h-[580px] lg:h-[660px] mx-auto px-4"
        style={{
          maskImage:
            'radial-gradient(ellipse 85% 75% at 50% 50%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.5) 75%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 85% 75% at 50% 50%, rgba(0,0,0,1) 45%, rgba(0,0,0,0.5) 75%, transparent 100%)',
        }}
      >
        {/* 3. LAYER A: Rich Gradient Map Mask (Bentuk pulau berkontras tinggi) */}
        <div
          className="absolute inset-0 w-full h-full opacity-35 sm:opacity-40 dark:opacity-50 transition-opacity duration-500"
          style={{
            maskImage: "url('/indonesia.svg')",
            WebkitMaskImage: "url('/indonesia.svg')",
            maskSize: 'contain',
            WebkitMaskSize: 'contain',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            filter: 'drop-shadow(0 4px 14px rgba(4, 120, 87, 0.45)) drop-shadow(0 1px 3px rgba(15, 23, 42, 0.3))',
          }}
        >
          {/* Vibrant Emerald-Teal-Navy in Light Mode, Bright Emerald-Cyan in Dark Mode */}
          <div className="w-full h-full bg-gradient-to-r from-emerald-800 via-teal-700 to-navy-800 dark:from-emerald-400 dark:via-cyan-300 dark:to-sky-400" />

          {/* Radar Sheen / Light Scanline that sweeps from Sabang to Merauke */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 dark:via-emerald-200/90 to-transparent w-1/3 h-full animate-map-sweep" />
        </div>

        {/* 4. LAYER B: Secondary Crisp Coastline Silhouette */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-25 sm:opacity-30 dark:opacity-35 transition-opacity duration-300">
          <Image
            src="/indonesia.svg"
            alt="Peta Sebaran KKN Nusantara"
            width={1440}
            height={810}
            priority
            className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(5,150,105,0.35)] dark:invert dark:drop-shadow-[0_0_20px_rgba(16,185,129,0.55)]"
          />
        </div>

        {/* 5. LAYER C: Glowing Connecting Arcs (Garis Pelayanan Pengabdian Antar-Pulau) */}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full opacity-60 dark:opacity-80 pointer-events-none"
        >
          <defs>
            <linearGradient id="arcGradSumateraJawa" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#0d9488" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="arcGradJawaIKN" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="arcGradIKNPapua" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
              <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="arcGradBaliNusra" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Sumatera (Aceh -> Medan -> Padang -> Jakarta) */}
          <path
            d="M 8.8 28.5 Q 13.2 34 17.0 48 Q 24.2 55.5 29.2 66"
            fill="none"
            stroke="url(#arcGradSumateraJawa)"
            strokeWidth="0.25"
            strokeDasharray="1.2 1.5"
          />

          {/* Jawa -> IKN Kalimantan */}
          <path
            d="M 29.2 66 Q 36 54 44.0 48.7"
            fill="none"
            stroke="url(#arcGradJawaIKN)"
            strokeWidth="0.3"
            strokeDasharray="1.5 2"
          />

          {/* IKN -> Makassar -> Ambon -> Jayapura */}
          <path
            d="M 44.0 48.7 Q 48.2 60.5 63.2 54.9 Q 75 48 87.5 45.6"
            fill="none"
            stroke="url(#arcGradIKNPapua)"
            strokeWidth="0.25"
            strokeDasharray="1.2 1.5"
          />

          {/* Jawa -> Bali -> Kupang */}
          <path
            d="M 40.2 68.5 Q 44.5 69.8 47.2 69.8 Q 51 71 55.5 72.8"
            fill="none"
            stroke="url(#arcGradBaliNusra)"
            strokeWidth="0.25"
            strokeDasharray="1 1.2"
          />
        </svg>

        {/* 6. LAYER D: 20 Bioluminescent Interactive KKN Hub Nodes */}
        {KKN_HUBS.map((hub) => (
          <div
            key={hub.id}
            onMouseEnter={() => setActiveHub(hub)}
            onMouseLeave={() => setActiveHub(null)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group pointer-events-auto cursor-pointer"
            style={{
              left: `${hub.x}%`,
              top: `${hub.y}%`,
            }}
          >
            {/* Outer Sonar Ping Ripple */}
            <span
              className="absolute -inset-2.5 rounded-full bg-emerald-500/30 dark:bg-emerald-400/40 animate-ping pointer-events-none"
              style={{
                animationDuration: '3.2s',
                animationDelay: `${hub.delay}s`,
              }}
            />

            {/* Glowing Hub Point Core with Crisp Outer Ring */}
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-600 dark:bg-emerald-400 opacity-80 shadow-md" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-white border border-emerald-700/30 dark:border-emerald-300 shadow-sm" />
            </span>

            {/* Micro Badge for Key Strategic Cities (Always Visible on Desktop) */}
            {hub.badge && (
              <span
                className="hidden lg:inline-flex items-center gap-1 absolute left-3.5 -top-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-white/95 dark:bg-navy-900/95 text-emerald-800 dark:text-emerald-300 rounded-md border border-emerald-600/30 dark:border-emerald-500/40 shadow-sm whitespace-nowrap backdrop-blur-sm transition-transform duration-200 group-hover:scale-105"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {hub.name}
              </span>
            )}

            {/* Interactive Tooltip on Hover */}
            <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
              <div className="bg-navy-950/95 text-white rounded-lg px-2.5 py-1.5 text-xs shadow-xl border border-emerald-500/40 whitespace-nowrap backdrop-blur-md">
                <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {hub.name}
                </p>
                <p className="text-[10px] text-slate-300">
                  {hub.province} • <strong className="text-white">{hub.posCount} Pos Terbuka</strong>
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* 7. Bottom Watermark Pill */}
        <div className="absolute bottom-1 sm:bottom-3 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-navy-950/70 border border-slate-200/80 dark:border-navy-700/60 shadow-xs backdrop-blur-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[10px] sm:text-[11px] font-medium tracking-wide text-slate-700 dark:text-slate-300 uppercase">
              1,280+ Pos Pengabdian KKN • Sabang s/d Merauke
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndonesiaMapBackdrop;
