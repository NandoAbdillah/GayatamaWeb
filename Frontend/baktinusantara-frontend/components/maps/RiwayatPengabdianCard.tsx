'use client';

import React from 'react';
import Link from 'next/link';
import {
  Award,
  Calendar,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';

export interface RiwayatPengabdianItem {
  id: string;
  desa_nama: string;
  kabupaten: string;
  judul_program: string;
  nama_kelompok: string;
  universitas: string;
  univ_logo?: string;
  tahun: string;
  periode: string;
  jumlah_mahasiswa: number;
  rating: number;
  luaran_unggulan: string[];
  ringkasan_dampak: string;
  thumbnail: string;
  slug_portofolio?: string;
}

interface RiwayatPengabdianCardProps {
  item: RiwayatPengabdianItem;
  className?: string;
}

export const RiwayatPengabdianCard: React.FC<RiwayatPengabdianCardProps> = ({
  item,
  className = '',
}) => {
  return (
    <div
      className={`group rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between ${className}`}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-navy-950">
        <img
          src={item.thumbnail}
          alt="Dokumentasi Program KKN"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=80';
          }}
        />
        {/* Top Floating Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md bg-emerald-600/90 text-white border-emerald-400/40 shadow-xs">
          <Award className="w-3 h-3" />
          <span>Selesai • {item.tahun}</span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
          <Star className="w-3 h-3 fill-current" />
          <span>{item.rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="truncate">{item.universitas}</span>
          </div>

          <h4 className="text-sm font-bold text-navy-950 dark:text-white leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {item.judul_program}
          </h4>

          <p className="text-xs text-slate-600 dark:text-slate-300 font-jakarta line-clamp-2 leading-relaxed">
            {item.ringkasan_dampak}
          </p>

          <div className="pt-2 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Luaran Terverifikasi:
            </span>
            <div className="space-y-1">
              {item.luaran_unggulan.slice(0, 2).map((luaran, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="truncate">{luaran}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2.5 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {item.jumlah_mahasiswa} Mahasiswa Alumni
          </span>

          {item.slug_portofolio ? (
            <Link
              href={`/portofolio/${item.slug_portofolio}`}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
            >
              <span>Portofolio</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          ) : (
            <span className="text-[10px] text-slate-400 dark:text-slate-500">Arsip Resmi</span>
          )}
        </div>
      </div>
    </div>
  );
};
