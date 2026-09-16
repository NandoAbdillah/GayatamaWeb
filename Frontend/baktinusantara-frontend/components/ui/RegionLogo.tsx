'use client';

import React, { useState, useEffect } from 'react';
import { WilayahService } from '@/lib/wilayah-api';
import { Landmark, Shield } from 'lucide-react';

export interface RegionLogoProps {
  code?: string;
  name?: string;
  provId?: string;
  customUrl?: string;
  fallbackUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBadge?: boolean;
}

const SIZE_MAP = {
  xs: { box: 'w-6 h-6', img: 'w-5 h-5', text: 'text-[9px]', icon: 'w-3 h-3' },
  sm: { box: 'w-8 h-8', img: 'w-6 h-6', text: 'text-[10px]', icon: 'w-3.5 h-3.5' },
  md: { box: 'w-11 h-11', img: 'w-8 h-8', text: 'text-xs', icon: 'w-4 h-4' },
  lg: { box: 'w-16 h-16', img: 'w-12 h-12', text: 'text-sm font-bold', icon: 'w-6 h-6' },
  xl: { box: 'w-20 h-20', img: 'w-16 h-16', text: 'text-base font-extrabold', icon: 'w-8 h-8' },
  '2xl': { box: 'w-28 h-28', img: 'w-24 h-24', text: 'text-xl font-black', icon: 'w-10 h-10' },
};

export const RegionLogo: React.FC<RegionLogoProps> = ({
  code = '',
  name = '',
  provId,
  customUrl,
  fallbackUrl,
  size = 'md',
  className = '',
  showBadge = true,
}) => {
  const [failStage, setFailStage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Derive URLs
  const cleanCode = code.trim();
  const isProv = cleanCode.length === 2 && !cleanCode.includes('.');

  const primarySrc =
    customUrl ||
    (isProv
      ? WilayahService.getProvinceLogoUrl(cleanCode)
      : WilayahService.getRegencyLogoUrl(cleanCode));

  const secondarySrc =
    fallbackUrl ||
    (isProv
      ? WilayahService.getProvinceFallbackLogoUrl(cleanCode)
      : WilayahService.getRegencyFallbackLogoUrl(cleanCode, provId));

  // Reset error state when code or URL changes
  useEffect(() => {
    setFailStage(0);
    if (imgRef.current && imgRef.current.complete) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [cleanCode, customUrl]);

  const handleError = () => {
    if (failStage === 0 && secondarySrc && secondarySrc !== primarySrc) {
      // Try fallback to GitHub Raw
      setFailStage(1);
    } else {
      // Final fallback to styled shield initials
      setFailStage(2);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const currentSrc = failStage === 0 ? primarySrc : failStage === 1 ? secondarySrc : null;
  const currentSize = SIZE_MAP[size] || SIZE_MAP.md;

  // Extract initials for fallback shield (e.g. "Jawa Barat" -> "JB", "Kabupaten Bogor" -> "KB")
  const initials = name
    ? name
        .replace(/^(Kabupaten|Kota|Provinsi)\s+/i, '')
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : cleanCode || 'ID';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${
        showBadge
          ? `rounded-2xl bg-white/90 dark:bg-navy-900/90 shadow-sm border border-slate-200/80 dark:border-navy-700/80 backdrop-blur-sm p-1 ${currentSize.box}`
          : currentSize.box
      } ${className}`}
      title={name ? `Lambang Resmi: ${name}` : 'Lambang Wilayah'}
    >
      {/* Skeleton Loading Shimmer */}
      {isLoading && failStage < 2 && currentSrc && (
        <div className="absolute inset-1 rounded-xl bg-slate-200 dark:bg-navy-800 animate-pulse flex items-center justify-center">
          <Shield className={`${currentSize.icon} text-slate-300 dark:text-navy-600 animate-pulse`} />
        </div>
      )}

      {/* Render Image (Tier 0 or Tier 1) */}
      {failStage < 2 && currentSrc ? (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={name ? `Logo ${name}` : 'Logo Wilayah'}
          className={`${currentSize.img} object-contain transition-all duration-300 hover:scale-105 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        /* Render Tier 2: Shield Emblem Badge with Initials */
        <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-navy-900 text-white flex flex-col items-center justify-center shadow-inner p-0.5">
          <Landmark className={`${currentSize.icon} text-emerald-200 opacity-90`} />
          <span className={`${currentSize.text} tracking-wider font-mono drop-shadow-sm`}>
            {initials}
          </span>
        </div>
      )}
    </div>
  );
};

export default RegionLogo;
