'use client';

import React from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  User,
} from 'lucide-react';

export interface LiveReportItem {
  id: string;
  desa_nama: string;
  kabupaten: string;
  penulis: string;
  role: string;
  avatar_url?: string;
  waktu: string;
  minggu_ke: number;
  persentase: number;
  aktivitas: string;
  foto_dokumentasi: string;
  dpl_verified: boolean;
  dpl_nama?: string;
}

interface LiveReportCardProps {
  report: LiveReportItem;
  className?: string;
}

export const LiveReportCard: React.FC<LiveReportCardProps> = ({ report, className = '' }) => {
  return (
    <div
      className={`group rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between ${className}`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-navy-950">
        <img
          src={report.foto_dokumentasi}
          alt="Dokumentasi Lapangan"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Live Pulse Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md bg-navy-950/80 text-white border-emerald-400/40 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Lapangan • Minggu ke-{report.minggu_ke}</span>
        </div>

        {/* Progress Bar Badge */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center justify-between text-white text-[11px] font-bold">
          <span>Progres Lapangan</span>
          <span className="text-emerald-400 font-mono">{report.persentase}%</span>
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Author Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {report.avatar_url ? (
                <img
                  src={report.avatar_url}
                  alt={report.penulis}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-navy-700 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-navy-950 dark:text-white truncate">
                  {report.penulis}
                </h5>
                <p className="text-[10px] text-slate-400 truncate">
                  {report.role}
                </p>
              </div>
            </div>

            <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-slate-400" />
              {report.waktu}
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 font-jakarta leading-relaxed line-clamp-3">
            {report.aktivitas}
          </p>
        </div>

        {/* Footer Verification Tag */}
        <div className="pt-2.5 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1 text-slate-500 truncate">
            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
            <span className="truncate">{report.desa_nama}, {report.kabupaten}</span>
          </div>

          {report.dpl_verified && (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Divalidasi DPL
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
