'use client';

import React from 'react';

interface BatikOrnamentProps {
  position?: 'left' | 'right' | 'both';
  className?: string;
  variant?: 'lung' | 'kawung' | 'full';
}

/**
 * BatikOrnament
 * High-definition, hand-crafted vector art of authentic Indonesian Batik Lung-lungan
 * (Jepara / Pekalongan floral carving vines, lotus blossoms, curled tendrils, and cecek-cecek dots).
 */
export const BatikOrnament: React.FC<BatikOrnamentProps> = ({
  position = 'both',
  className = '',
}) => {
  return (
    <>
      {/* ========================================================================= */}
      {/* LEFT ORNAMENT - Grand Floral Sulur Lung-lungan & Lotus Blossom */}
      {/* ========================================================================= */}
      {(position === 'left' || position === 'both') && (
        <div
          aria-hidden="true"
          className={`absolute left-0 top-0 bottom-0 w-44 sm:w-60 lg:w-72 pointer-events-none overflow-hidden select-none z-0 ${className}`}
        >
          <svg
            viewBox="0 0 280 440"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-cover object-left opacity-[0.16] dark:opacity-[0.18] text-amber-800 dark:text-amber-300 transition-opacity"
          >
            <defs>
              <linearGradient id="batikStemGradLeft" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
                <stop offset="50%" stopColor="currentColor" stopOpacity="0.95" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="batikPetalGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.75" />
              </linearGradient>
            </defs>

            {/* --- Corner Subtle Kawung Geometric Grid --- */}
            <g opacity="0.45" stroke="currentColor" strokeWidth="1.2">
              <ellipse cx="20" cy="420" rx="35" ry="18" fill="none" strokeDasharray="3 3" />
              <ellipse cx="20" cy="420" rx="18" ry="35" fill="none" strokeDasharray="3 3" />
              <ellipse cx="70" cy="440" rx="30" ry="15" fill="none" />
              <ellipse cx="70" cy="440" rx="15" ry="30" fill="none" />
            </g>

            {/* --- Main Sweeping Primary Spiral Stem (Batang Sulur Utama) --- */}
            <path
              d="M -20,440 C 20,380 90,340 75,260 C 60,180 -25,170 15,100 C 45,45 130,55 105,-20"
              stroke="url(#batikStemGradLeft)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* Parallel Inner Stem with Canting Dash Accent */}
            <path
              d="M -10,430 C 28,375 78,338 65,262 C 52,185 -15,175 22,108 C 50,55 120,62 98,-10"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeDasharray="4 4"
              opacity="0.7"
            />

            {/* --- Secondary Intertwined Spiral (Sulur Pendamping) --- */}
            <path
              d="M 75,260 C 130,275 165,225 135,175 C 105,125 40,150 65,200 C 82,235 120,225 115,195"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="115" cy="195" r="4.5" fill="currentColor" />

            {/* --- GRAND LOTUS BLOSSOM (Kembang Padma Megah di Tengah) --- */}
            <g transform="translate(145, 165) rotate(-15)">
              {/* Outer Layer 6 Petals */}
              <path
                d="M 0,-42 C 16,-32 24,-12 0,0 C -24,-12 -16,-32 0,-42 Z"
                fill="url(#batikPetalGradLeft)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M 36,-21 C 42,-4 32,14 0,0 C 14,-22 28,-30 36,-21 Z"
                fill="url(#batikPetalGradLeft)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M 36,21 C 28,36 10,34 0,0 C 24,6 38,10 36,21 Z"
                fill="url(#batikPetalGradLeft)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M 0,42 C -16,32 -24,12 0,0 C 24,12 16,32 0,42 Z"
                fill="url(#batikPetalGradLeft)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M -36,21 C -42,4 -32,-14 0,0 C -14,22 -28,30 -36,21 Z"
                fill="url(#batikPetalGradLeft)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M -36,-21 C -28,-36 -10,-34 0,0 C -24,-6 -38,-10 -36,-21 Z"
                fill="url(#batikPetalGradLeft)"
                stroke="currentColor"
                strokeWidth="1.5"
              />

              {/* Inner Petals Rosette */}
              <circle cx="0" cy="0" r="14" fill="currentColor" opacity="0.3" />
              <circle cx="0" cy="0" r="9" fill="currentColor" opacity="0.85" />
              <circle cx="0" cy="0" r="4" fill="#ffffff" opacity="0.9" />

              {/* Cecek-cecek Stamen Dots Ring */}
              <circle cx="0" cy="-22" r="2.2" fill="currentColor" />
              <circle cx="19" cy="-11" r="2.2" fill="currentColor" />
              <circle cx="19" cy="11" r="2.2" fill="currentColor" />
              <circle cx="0" cy="22" r="2.2" fill="currentColor" />
              <circle cx="-19" cy="11" r="2.2" fill="currentColor" />
              <circle cx="-19" cy="-11" r="2.2" fill="currentColor" />
            </g>

            {/* --- Upper Blooming Melati Blossom (Kembang Atas) --- */}
            <g transform="translate(100, 35) rotate(25) scale(0.75)">
              <path
                d="M 0,-32 C 12,-24 18,-8 0,0 C -18,-8 -12,-24 0,-32 Z"
                fill="url(#batikPetalGradLeft)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M 28,-14 C 32,-2 24,10 0,0 C 10,-16 22,-22 28,-14 Z"
                fill="url(#batikPetalGradLeft)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M 28,14 C 22,26 8,24 0,0 C 18,4 28,6 28,14 Z"
                fill="url(#batikPetalGradLeft)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M -28,14 C -32,2 -24,-10 0,0 C -10,16 -22,22 -28,14 Z"
                fill="url(#batikPetalGradLeft)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M -28,-14 C -22,-26 -8,-24 0,0 C -18,-4 -28,-6 -28,-14 Z"
                fill="url(#batikPetalGradLeft)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="0" cy="0" r="7" fill="currentColor" />
              <circle cx="0" cy="0" r="3" fill="#ffffff" opacity="0.8" />
            </g>

            {/* --- Intricate Carved Leaves (Ukiran Daun Lung Beruas) --- */}
            {/* Leaf 1 (Mid-Left Leaf) */}
            <path
              d="M 20,110 C 5,80 -10,75 -25,90 C -15,120 5,135 20,110 Z"
              fill="url(#batikPetalGradLeft)"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path d="M 20,110 C -2,95 -18,92 -25,90" stroke="currentColor" strokeWidth="1" />

            {/* Leaf 2 (Upper-Right Leaf) */}
            <path
              d="M 85,70 C 120,55 145,70 140,95 C 115,105 85,90 85,70 Z"
              fill="url(#batikPetalGradLeft)"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path d="M 85,70 C 115,75 135,85 140,95" stroke="currentColor" strokeWidth="1" />

            {/* Leaf 3 (Lower-Left Leaf) */}
            <path
              d="M 50,320 C 15,310 -5,335 5,360 C 35,365 55,345 50,320 Z"
              fill="url(#batikPetalGradLeft)"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path d="M 50,320 C 25,330 10,345 5,360" stroke="currentColor" strokeWidth="1" />

            {/* Leaf 4 (Mid-Right Serrated Frond) */}
            <path
              d="M 80,240 C 115,220 140,245 130,270 C 105,275 85,255 80,240 Z"
              fill="url(#batikPetalGradLeft)"
              stroke="currentColor"
              strokeWidth="1.2"
            />

            {/* --- Delicate Cecek-cecek (Dotted Canting Ornaments) --- */}
            <g fill="currentColor" opacity="0.8">
              <circle cx="160" cy="225" r="3" />
              <circle cx="172" cy="240" r="2.4" />
              <circle cx="180" cy="258" r="1.8" />

              <circle cx="50" cy="55" r="3" />
              <circle cx="62" cy="42" r="2.4" />
              <circle cx="76" cy="32" r="1.8" />

              <circle cx="105" cy="320" r="2.8" />
              <circle cx="120" cy="335" r="2.2" />
              <circle cx="132" cy="352" r="1.6" />
            </g>

            {/* --- Curled Tendril Tips (Ujung Pakis Melengkung) --- */}
            <path
              d="M 135,175 C 160,155 185,170 175,190 C 168,205 150,195 155,185"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="155" cy="185" r="3.5" fill="currentColor" />

            <path
              d="M 15,100 C -5,75 5,45 25,50 C 40,55 35,75 25,72"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="25" cy="72" r="3" fill="currentColor" />
          </svg>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RIGHT ORNAMENT - Mirrored High-Fidelity Indonesian Batik Art */}
      {/* ========================================================================= */}
      {(position === 'right' || position === 'both') && (
        <div
          aria-hidden="true"
          className={`absolute right-0 top-0 bottom-0 w-44 sm:w-60 lg:w-72 pointer-events-none overflow-hidden select-none z-0 ${className}`}
        >
          <svg
            viewBox="0 0 280 440"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full object-cover object-right opacity-[0.16] dark:opacity-[0.18] text-amber-800 dark:text-amber-300 transition-opacity transform scale-x-[-1]"
          >
            <defs>
              <linearGradient id="batikStemGradRight" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
                <stop offset="50%" stopColor="currentColor" stopOpacity="0.95" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="batikPetalGradRight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.75" />
              </linearGradient>
            </defs>

            {/* --- Corner Subtle Kawung Geometric Grid --- */}
            <g opacity="0.45" stroke="currentColor" strokeWidth="1.2">
              <ellipse cx="20" cy="420" rx="35" ry="18" fill="none" strokeDasharray="3 3" />
              <ellipse cx="20" cy="420" rx="18" ry="35" fill="none" strokeDasharray="3 3" />
              <ellipse cx="70" cy="440" rx="30" ry="15" fill="none" />
              <ellipse cx="70" cy="440" rx="15" ry="30" fill="none" />
            </g>

            {/* --- Main Sweeping Primary Spiral Stem --- */}
            <path
              d="M -20,440 C 20,380 90,340 75,260 C 60,180 -25,170 15,100 C 45,45 130,55 105,-20"
              stroke="url(#batikStemGradRight)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            <path
              d="M -10,430 C 28,375 78,338 65,262 C 52,185 -15,175 22,108 C 50,55 120,62 98,-10"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeDasharray="4 4"
              opacity="0.7"
            />

            {/* --- Secondary Intertwined Spiral --- */}
            <path
              d="M 75,260 C 130,275 165,225 135,175 C 105,125 40,150 65,200 C 82,235 120,225 115,195"
              stroke="currentColor"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="115" cy="195" r="4.5" fill="currentColor" />

            {/* --- GRAND LOTUS BLOSSOM --- */}
            <g transform="translate(145, 165) rotate(-15)">
              <path
                d="M 0,-42 C 16,-32 24,-12 0,0 C -24,-12 -16,-32 0,-42 Z"
                fill="url(#batikPetalGradRight)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M 36,-21 C 42,-4 32,14 0,0 C 14,-22 28,-30 36,-21 Z"
                fill="url(#batikPetalGradRight)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M 36,21 C 28,36 10,34 0,0 C 24,6 38,10 36,21 Z"
                fill="url(#batikPetalGradRight)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M 0,42 C -16,32 -24,12 0,0 C 24,12 16,32 0,42 Z"
                fill="url(#batikPetalGradRight)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M -36,21 C -42,4 -32,-14 0,0 C -14,22 -28,30 -36,21 Z"
                fill="url(#batikPetalGradRight)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M -36,-21 C -28,-36 -10,-34 0,0 C -24,-6 -38,-10 -36,-21 Z"
                fill="url(#batikPetalGradRight)"
                stroke="currentColor"
                strokeWidth="1.5"
              />

              <circle cx="0" cy="0" r="14" fill="currentColor" opacity="0.3" />
              <circle cx="0" cy="0" r="9" fill="currentColor" opacity="0.85" />
              <circle cx="0" cy="0" r="4" fill="#ffffff" opacity="0.9" />

              <circle cx="0" cy="-22" r="2.2" fill="currentColor" />
              <circle cx="19" cy="-11" r="2.2" fill="currentColor" />
              <circle cx="19" cy="11" r="2.2" fill="currentColor" />
              <circle cx="0" cy="22" r="2.2" fill="currentColor" />
              <circle cx="-19" cy="11" r="2.2" fill="currentColor" />
              <circle cx="-19" cy="-11" r="2.2" fill="currentColor" />
            </g>

            {/* --- Upper Blooming Melati Blossom --- */}
            <g transform="translate(100, 35) rotate(25) scale(0.75)">
              <path
                d="M 0,-32 C 12,-24 18,-8 0,0 C -18,-8 -12,-24 0,-32 Z"
                fill="url(#batikPetalGradRight)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M 28,-14 C 32,-2 24,10 0,0 C 10,-16 22,-22 28,-14 Z"
                fill="url(#batikPetalGradRight)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M 28,14 C 22,26 8,24 0,0 C 18,4 28,6 28,14 Z"
                fill="url(#batikPetalGradRight)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M -28,14 C -32,2 -24,-10 0,0 C -10,16 -22,22 -28,14 Z"
                fill="url(#batikPetalGradRight)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M -28,-14 C -22,-26 -8,-24 0,0 C -18,-4 -28,-6 -28,-14 Z"
                fill="url(#batikPetalGradRight)"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="0" cy="0" r="7" fill="currentColor" />
              <circle cx="0" cy="0" r="3" fill="#ffffff" opacity="0.8" />
            </g>

            {/* --- Intricate Carved Leaves --- */}
            <path
              d="M 20,110 C 5,80 -10,75 -25,90 C -15,120 5,135 20,110 Z"
              fill="url(#batikPetalGradRight)"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path d="M 20,110 C -2,95 -18,92 -25,90" stroke="currentColor" strokeWidth="1" />

            <path
              d="M 85,70 C 120,55 145,70 140,95 C 115,105 85,90 85,70 Z"
              fill="url(#batikPetalGradRight)"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path d="M 85,70 C 115,75 135,85 140,95" stroke="currentColor" strokeWidth="1" />

            <path
              d="M 50,320 C 15,310 -5,335 5,360 C 35,365 55,345 50,320 Z"
              fill="url(#batikPetalGradRight)"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path d="M 50,320 C 25,330 10,345 5,360" stroke="currentColor" strokeWidth="1" />

            <path
              d="M 80,240 C 115,220 140,245 130,270 C 105,275 85,255 80,240 Z"
              fill="url(#batikPetalGradRight)"
              stroke="currentColor"
              strokeWidth="1.2"
            />

            {/* --- Cecek-cecek Ornaments --- */}
            <g fill="currentColor" opacity="0.8">
              <circle cx="160" cy="225" r="3" />
              <circle cx="172" cy="240" r="2.4" />
              <circle cx="180" cy="258" r="1.8" />

              <circle cx="50" cy="55" r="3" />
              <circle cx="62" cy="42" r="2.4" />
              <circle cx="76" cy="32" r="1.8" />

              <circle cx="105" cy="320" r="2.8" />
              <circle cx="120" cy="335" r="2.2" />
              <circle cx="132" cy="352" r="1.6" />
            </g>

            {/* --- Curled Tendril Tips --- */}
            <path
              d="M 135,175 C 160,155 185,170 175,190 C 168,205 150,195 155,185"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="155" cy="185" r="3.5" fill="currentColor" />

            <path
              d="M 15,100 C -5,75 5,45 25,50 C 40,55 35,75 25,72"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <circle cx="25" cy="72" r="3" fill="currentColor" />
          </svg>
        </div>
      )}
    </>
  );
};

export default BatikOrnament;
