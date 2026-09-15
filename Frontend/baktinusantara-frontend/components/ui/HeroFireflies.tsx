'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface FireflyData {
  id: number;
  initialX: number; // percentage 0-100
  initialY: number; // percentage 0-100
  size: number; // px core size
  haloSize: number; // px glow halo
  depth: 'foreground' | 'midground' | 'background';
  color: {
    core: string;
    glowInner: string;
    glowOuter: string;
  };
  duration: number; // flight path cycle in seconds
  flashDuration: number; // pulse cycle in seconds
  flashDelay: number; // stagger delay
  keyframesX: number[]; // relative px movement
  keyframesY: number[]; // relative px movement
  blur: number; // px blur for depth of field
  baseOpacity: number;
}

const COLOR_PALETTES = [
  // Warm golden amber (classic Indonesian dusk firefly)
  {
    core: '#ffffff',
    glowInner: 'rgba(250, 204, 21, 0.95)',
    glowOuter: 'rgba(234, 179, 8, 0.45)',
  },
  // Bioluminescent lime green
  {
    core: '#fefce8',
    glowInner: 'rgba(163, 230, 53, 0.95)',
    glowOuter: 'rgba(132, 204, 22, 0.4)',
  },
  // Soft chartreuse yellow-green
  {
    core: '#ffffff',
    glowInner: 'rgba(217, 249, 157, 0.9)',
    glowOuter: 'rgba(190, 242, 100, 0.35)',
  },
];

interface HeroFirefliesProps {
  count?: number;
  className?: string;
  interactive?: boolean;
}

export const HeroFireflies: React.FC<HeroFirefliesProps> = ({
  count = 26,
  className = '',
  interactive = true,
}) => {
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const mousePos = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate realistic, randomized fireflies on client-side to prevent SSR hydration mismatch
  const fireflies: FireflyData[] = useMemo(() => {
    if (!mounted) return [];

    const items: FireflyData[] = [];
    const actualCount = shouldReduceMotion ? Math.min(count, 10) : count;

    for (let i = 0; i < actualCount; i++) {
      // Stratify across 3 depth planes for rich cinematic depth
      const depthRoll = Math.random();
      let depth: 'foreground' | 'midground' | 'background';
      let size: number;
      let haloSize: number;
      let blur: number;
      let baseOpacity: number;

      if (depthRoll < 0.25) {
        // Foreground: Close, crisp, larger glow, lively movement
        depth = 'foreground';
        size = 3.5 + Math.random() * 2; // 3.5 - 5.5px
        haloSize = 16 + Math.random() * 10;
        blur = 0;
        baseOpacity = 0.95;
      } else if (depthRoll < 0.7) {
        // Midground: Ambient, standard size
        depth = 'midground';
        size = 2.5 + Math.random() * 1.5; // 2.5 - 4px
        haloSize = 10 + Math.random() * 6;
        blur = 0.3;
        baseOpacity = 0.8;
      } else {
        // Background: Far distant shimmer with slight depth blur
        depth = 'background';
        size = 1.5 + Math.random() * 1.2; // 1.5 - 2.7px
        haloSize = 6 + Math.random() * 4;
        blur = 1.2;
        baseOpacity = 0.55;
      }

      // Zone distribution:
      // Zone 0: Upper atmosphere & mountains (x: 5-95%, y: 8-42%)
      // Zone 1: Left landscape & Rumah Adat (x: 2-24%, y: 20-88%)
      // Zone 2: Right landscape & trees (x: 76-98%, y: 20-88%)
      // Zone 3: Bottom foreground grass & water (x: 4-96%, y: 84-96%)
      const zoneRoll = Math.random();
      let initialX: number;
      let initialY: number;

      if (zoneRoll < 0.4) {
        // Upper atmosphere
        initialX = 4 + Math.random() * 92;
        initialY = 8 + Math.random() * 34;
      } else if (zoneRoll < 0.68) {
        // Left landscape / village
        initialX = 2 + Math.random() * 22;
        initialY = 20 + Math.random() * 66;
      } else if (zoneRoll < 0.88) {
        // Right landscape / hills
        initialX = 76 + Math.random() * 22;
        initialY = 20 + Math.random() * 66;
      } else {
        // Bottom grassy riverbanks
        initialX = 4 + Math.random() * 92;
        initialY = 84 + Math.random() * 12;
      }

      // Realistic meandering flight paths with smooth bezier curves (4-5 keyframe points)
      const flightRange = depth === 'foreground' ? 55 : depth === 'midground' ? 40 : 25;
      const keyframesX = [
        0,
        (Math.random() - 0.5) * flightRange,
        (Math.random() - 0.5) * flightRange * 1.3,
        (Math.random() - 0.5) * flightRange * 0.7,
        0,
      ];
      const keyframesY = [
        0,
        -10 - Math.random() * flightRange * 0.5,
        -4 + (Math.random() - 0.5) * flightRange * 0.7,
        -18 - Math.random() * flightRange * 0.4,
        0,
      ];

      const color = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
      const duration = 16 + Math.random() * 16; // 16s - 32s flight loop
      const flashDuration = 2.8 + Math.random() * 3.5; // 2.8s - 6.3s natural pulse rhythm
      const flashDelay = Math.random() * 5;

      items.push({
        id: i,
        initialX,
        initialY,
        size,
        haloSize,
        depth,
        color,
        duration,
        flashDuration,
        flashDelay,
        keyframesX,
        keyframesY,
        blur,
        baseOpacity,
      });
    }

    return items;
  }, [mounted, count, shouldReduceMotion]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Subtle interactive breeze on mouse move
  useEffect(() => {
    if (!interactive || !mounted) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mousePos.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [interactive, mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}
      style={{ contain: 'layout paint' }}
    >
      {fireflies.map((fly) => {
        return (
          <motion.div
            key={fly.id}
            className="absolute rounded-full"
            style={{
              left: `${fly.initialX}%`,
              top: `${fly.initialY}%`,
              width: `${fly.size}px`,
              height: `${fly.size}px`,
              filter: fly.blur > 0 ? `blur(${fly.blur}px)` : 'none',
              willChange: 'transform, opacity',
            }}
            initial={{
              x: 0,
              y: 0,
              scale: 0.8,
              opacity: 0,
            }}
            animate={
              shouldReduceMotion
                ? {
                    opacity: [0.3, fly.baseOpacity, 0.4],
                    transition: {
                      duration: fly.flashDuration,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                    },
                  }
                : {
                    // Flight wandering trajectory
                    x: fly.keyframesX,
                    y: fly.keyframesY,
                    // Bioluminescent pulsing & breathing rhythm
                    opacity: [
                      0.05,
                      fly.baseOpacity * 0.8,
                      fly.baseOpacity,
                      fly.baseOpacity * 0.35,
                      fly.baseOpacity * 0.9,
                      0.1,
                      0.05,
                    ],
                    scale: [0.7, 1.15, 1.25, 0.9, 1.2, 0.75, 0.7],
                  }
            }
            transition={{
              x: {
                duration: fly.duration,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
              },
              y: {
                duration: fly.duration * 0.9,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
              },
              opacity: {
                duration: fly.flashDuration,
                delay: fly.flashDelay,
                repeat: Infinity,
                ease: 'easeInOut',
              },
              scale: {
                duration: fly.flashDuration,
                delay: fly.flashDelay,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          >
            {/* Firefly glowing light core & ambient aura */}
            <div
              className="w-full h-full rounded-full"
              style={{
                backgroundColor: fly.color.core,
                boxShadow: `
                  0 0 ${fly.size * 2}px ${fly.size}px ${fly.color.glowInner},
                  0 0 ${fly.haloSize}px ${fly.haloSize * 0.5}px ${fly.color.glowOuter},
                  0 0 ${fly.haloSize * 1.6}px ${fly.haloSize * 0.8}px rgba(250, 204, 21, 0.15)
                `,
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
};

export default HeroFireflies;
