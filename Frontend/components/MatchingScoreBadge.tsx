'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle, ChevronDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchingScoreBadgeProps {
  score: number;
  jurusanRelevance?: number;
  sectorRelevance?: number;
  skillRelevance?: number;
  className?: string;
  showBreakdown?: boolean;
}

export const MatchingScoreBadge: React.FC<MatchingScoreBadgeProps> = ({
  score,
  jurusanRelevance = 40,
  sectorRelevance = 30,
  skillRelevance = score - 70 > 0 ? score - 70 : 20,
  className,
  showBreakdown = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getScoreTheme = (val: number) => {
    if (val >= 85) {
      return {
        badge: 'bg-emerald-600 text-white border-emerald-500 shadow-sm',
        label: 'Sangat Direkomendasikan',
        barColor: 'bg-emerald-500',
      };
    }
    if (val >= 70) {
      return {
        badge: 'bg-blue-600 text-white border-blue-500 shadow-sm',
        label: 'Sesuai Kompetensi',
        barColor: 'bg-blue-500',
      };
    }
    return {
      badge: 'bg-amber-600 text-white border-amber-500 shadow-sm',
      label: 'Cukup Relevan',
      barColor: 'bg-amber-500',
    };
  };

  const theme = getScoreTheme(score);

  return (
    <div className={cn('relative inline-block font-jakarta', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-transform hover:scale-105 select-none',
          theme.badge
        )}
        title="Klik untuk melihat rincian Smart-Matching Score"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{score}% Cocok</span>
        {showBreakdown && (
          <ChevronDown
            className={cn('w-3 h-3 transition-transform duration-200', isOpen && 'rotate-180')}
          />
        )}
      </button>

      {/* Breakdown Popup Card */}
      {isOpen && showBreakdown && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-navy-900 rounded-2xl p-3.5 shadow-2xl border border-slate-200 dark:border-navy-800 z-50 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-navy-800">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-navy-950 dark:text-white">
                Analisis Kesesuaian
              </span>
            </div>
            <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
              AI Match
            </span>
          </div>

          <div className="space-y-2.5 py-2.5">
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                <span>Kesesuaian Jurusan</span>
                <span>{jurusanRelevance}/40</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-navy-800 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(jurusanRelevance / 40) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                <span>Prioritas Sektor Desa</span>
                <span>{sectorRelevance}/30</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-navy-800 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(sectorRelevance / 30) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                <span>Portofolio & Skill Anggota</span>
                <span>{skillRelevance}/30</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-navy-800 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(skillRelevance / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-navy-800 flex items-center gap-1">
            <Info className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Kategori: {theme.label}</span>
          </p>
        </div>
      )}
    </div>
  );
};
