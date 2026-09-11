'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, FileText, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DistanceWarningProps {
  distanceKm: number;
  thresholdKm?: number;
  className?: string;
  showAction?: boolean;
}

export const DistanceWarning: React.FC<DistanceWarningProps> = ({
  distanceKm,
  thresholdKm = 50,
  className,
  showAction = true,
}) => {
  const isExceeded = distanceKm > thresholdKm;

  if (!isExceeded) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300',
          className
        )}
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <p>
          <span className="font-bold">Radius Aman ({distanceKm} km):</span> Lokasi berada dalam radius operasional reguler kampus (&le;{thresholdKm} km).
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2.5',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-amber-900 dark:text-amber-100 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Peringatan Jarak Luar Radius ({distanceKm} km)</span>
          </p>
          <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-300">
            Lokasi KKN berjarak lebih dari {thresholdKm} km dari kampus induk. Sesuai Pedoman Tata Tertib LPPM, mahasiswa kelompok ini <strong className="font-bold underline">wajib mengunggah Surat Izin Orang Tua/Wali</strong> sebelum penerbitan Surat Tugas KKN.
          </p>
        </div>
      </div>

      {showAction && (
        <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/80 flex justify-end">
          <Link
            href="/mahasiswa/izin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Kelola Surat Izin Orang Tua</span>
          </Link>
        </div>
      )}
    </div>
  );
};
