'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  ExternalLink,
  ChevronRight,
  Copy,
  FileText,
  Sparkles,
  Layers,
  Landmark,
  Building2,
  TrendingUp,
  Award,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  Store,
  Compass,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';

export type SmartCardVariant =
  | 'village'
  | 'kkn'
  | 'umkm'
  | 'program'
  | 'major_match'
  | 'map_result'
  | 'proposal'
  | 'progress'
  | 'navigate';

export interface SmartCardProps {
  variant: SmartCardVariant | string;
  data: any;
  onSendMessage?: (prompt: string) => void;
  onCloseCopilot?: () => void;
}

export function ContextualSmartCard({
  variant,
  data,
  onSendMessage,
  onCloseCopilot,
}: SmartCardProps) {
  const router = useRouter();

  if (!data) return null;

  const handleNavigate = (path: string) => {
    router.push(path);
    if (onCloseCopilot) onCloseCopilot();
  };

  const copyToClipboard = (text: string, label: string = 'Data') => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin ke clipboard!`);
  };

  // 1. DESA CARD
  if (variant === 'village') {
    const desa = data;
    return (
      <div className="group rounded-2xl overflow-hidden bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-700/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
        {desa.foto_url && (
          <div className="relative h-28 w-full overflow-hidden bg-slate-100 dark:bg-navy-950">
            <Image
              src={desa.foto_url}
              alt={desa.nama || 'Desa'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-2 left-3 right-3 text-white">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 block">
                Profil Desa
              </span>
              <h4 className="font-bold text-sm leading-snug drop-shadow-sm truncate">
                {desa.nama}
              </h4>
            </div>
            {desa.pos_tersedia !== undefined && (
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-bold backdrop-blur-xs">
                {desa.pos_tersedia} Pos KKN
              </span>
            )}
          </div>
        )}

        <div className="p-3 space-y-2.5">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">
              {desa.kecamatan ? `Kec. ${desa.kecamatan}, ` : ''}{desa.kabupaten || 'Kabupaten'} • {desa.provinsi || 'Indonesia'}
            </span>
          </p>

          {desa.potensi_utama && desa.potensi_utama.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Potensi Utama:
              </span>
              <div className="flex flex-wrap gap-1">
                {desa.potensi_utama.map((p: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10.5px] font-medium border border-emerald-200/60 dark:border-emerald-800/60"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {desa.populasi && (
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-navy-800">
              <span>Populasi: <strong>{desa.populasi.toLocaleString('id-ID')} jiwa</strong></span>
              {desa.luas_km2 && <span>Luas: <strong>{desa.luas_km2} km²</strong></span>}
            </div>
          )}
        </div>

        <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-navy-800 flex items-center gap-2">
          <button
            onClick={() => handleNavigate(`/search?q=${encodeURIComponent(desa.nama || '')}`)}
            className="flex-1 py-1.5 px-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-600 transition-colors flex items-center justify-center gap-1 shadow-2xs"
          >
            <span>Lihat Pos Desa</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          {onSendMessage && (
            <button
              onClick={() => onSendMessage(`Bisa buatkan ide program kerja KKN untuk ${desa.nama}?`)}
              className="py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition-colors"
              title="Minta Ide Program"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. KKN / POS KKN CARD
  if (variant === 'kkn') {
    const pos = data;
    return (
      <div className="rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-700/80 p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-2.5">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary dark:text-primary-300 text-[10px] font-bold border border-primary-200 dark:border-primary-800 truncate">
              {pos.sektor || 'Pos KKN'}
            </span>
            {pos.distance_km !== undefined && (
              <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-rose-500" />
                {pos.distance_km} km
              </span>
            )}
          </div>
          <h4 className="font-bold text-xs text-navy-950 dark:text-white line-clamp-2 leading-snug">
            {pos.judul}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {pos.desa}{pos.kabupaten ? `, ${pos.kabupaten}` : ''}
          </p>
        </div>

        {pos.kriteria_jurusan && (
          <div className="text-[10.5px] text-slate-500 dark:text-slate-400 line-clamp-1">
            Jurusan: <strong className="text-slate-700 dark:text-slate-300">{pos.kriteria_jurusan.slice(0, 2).join(', ')}</strong>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-navy-800 gap-2">
          {pos.kuota && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Kuota: <strong>{pos.kuota}</strong>
            </span>
          )}
          <button
            onClick={() => handleNavigate(pos.id ? `/search/${pos.id}` : '/search')}
            className="py-1 px-3 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-600 transition-colors flex items-center gap-1 shadow-2xs ml-auto"
          >
            <span>Lamar & Detail</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // 3. UMKM CARD
  if (variant === 'umkm') {
    const umkm = data;
    return (
      <div className="group rounded-2xl overflow-hidden bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-700/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
        {umkm.foto_url && (
          <div className="relative h-24 w-full overflow-hidden bg-slate-100 dark:bg-navy-950">
            <Image
              src={umkm.foto_url}
              alt={umkm.nama || 'UMKM'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-2 left-3 right-3 text-white">
              <span className="text-[9.5px] uppercase font-bold tracking-wider text-amber-300 block">
                {umkm.kategori || 'UMKM Mitra'}
              </span>
              <h4 className="font-bold text-xs truncate leading-tight">
                {umkm.nama}
              </h4>
            </div>
          </div>
        )}

        <div className="p-3 space-y-1.5">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
            <Store className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">{umkm.desa}, {umkm.kabupaten || 'Kabupaten'}</span>
          </p>

          {umkm.produk_unggulan && (
            <p className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-1">
              Produk: <strong>{umkm.produk_unggulan}</strong>
            </p>
          )}

          {umkm.status_kkn && (
            <div className="p-1.5 rounded-lg bg-amber-50/70 dark:bg-navy-950 border border-amber-200/60 dark:border-amber-900/60 text-[10.5px] text-amber-800 dark:text-amber-300 leading-tight">
              {umkm.status_kkn}
            </div>
          )}
        </div>

        <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Mitra GayatamaWeb</span>
          <button
            onClick={() => handleNavigate('/katalog')}
            className="py-1 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
          >
            <span>Lihat Katalog</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // 4. PROGRAM KERJA / REKOMENDASI CARD
  if (variant === 'program') {
    const prog = data;
    return (
      <div className="rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/90 dark:border-navy-700/80 p-3.5 shadow-2xs hover:shadow-md transition-all space-y-2.5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 truncate">
              {prog.kategori || 'Program KKN'}
            </span>
            {prog.relevansi && (
              <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                {prog.relevansi}
              </span>
            )}
          </div>
          <h4 className="font-bold text-xs text-navy-950 dark:text-white leading-snug">
            {prog.nama_program}
          </h4>
          {prog.sasaran && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Sasaran: <strong>{prog.sasaran}</strong>
            </p>
          )}
        </div>

        {prog.alasan && (
          <p className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-navy-950 p-2 rounded-lg border border-slate-100 dark:border-navy-800">
            &quot;{prog.alasan}&quot;
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-navy-800 gap-2">
          {prog.durasi && (
            <span className="text-[10.5px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              {prog.durasi}
            </span>
          )}
          {onSendMessage && (
            <button
              onClick={() => onSendMessage(`Bisa bantu buatkan draf proposal KKN untuk program: ${prog.nama_program}?`)}
              className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs ml-auto"
            >
              <span>Buat Proposal Ini</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // 5. MAJOR / MATCHING SCORE CARD
  if (variant === 'major_match') {
    const match = data;
    return (
      <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-navy-900 border border-emerald-200 dark:border-emerald-800 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10.5px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Analisis Kecocokan Jurusan
            </span>
          </div>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {match.score}%
          </span>
        </div>

        <div>
          <h4 className="font-bold text-xs text-navy-950 dark:text-white">
            {match.student_major || 'Jurusan Mahasiswa'}
          </h4>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
            Predikat: {match.predikat}
          </p>
        </div>

        {match.analisis && (
          <ul className="text-[11px] text-slate-600 dark:text-slate-300 list-disc pl-4 space-y-1 bg-white/70 dark:bg-navy-950 p-2.5 rounded-xl border border-emerald-100 dark:border-navy-800">
            {match.analisis.map((r: string, idx: number) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        )}

        <div className="pt-2 border-t border-emerald-200/60 dark:border-navy-800 flex items-center justify-between">
          <button
            onClick={() => handleNavigate('/search')}
            className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
          >
            <span>Cari Pos yang Cocok</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 6. MAP / GEOSPATIAL RESULT CARD
  if (variant === 'map_result') {
    const map = data;
    const w = map.wilayah;
    return (
      <div className="p-3.5 rounded-2xl bg-sky-50/70 dark:bg-navy-900 border border-sky-200 dark:border-sky-800 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            Profil Geospasial Wilayah
          </span>
          <button
            onClick={() => handleNavigate('/maps')}
            className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline"
          >
            <span>Buka Peta</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {w && (
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-navy-950 dark:text-white">
              {w.name} {w.capital ? `(Ibukota: ${w.capital})` : ''}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/70 dark:bg-navy-950 p-2.5 rounded-xl border border-sky-100 dark:border-navy-800 text-slate-700 dark:text-slate-300">
              <div>Populasi: <strong>{w.population?.toLocaleString('id-ID') || '-'}</strong></div>
              <div>Luas: <strong>{w.total_area_km2?.toLocaleString('id-ID') || '-'} km²</strong></div>
              <div>Elevasi: <strong>{w.elevation_mdpl || '-'} mdpl</strong></div>
              <div>Polygon GPS: <strong>{w.has_polygon_boundary ? 'Tersedia' : 'Titik Saja'}</strong></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 7. PROPOSAL DRAFT CARD
  if (variant === 'proposal') {
    const draft = data.draft || data;
    return (
      <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-navy-900 border border-amber-200 dark:border-amber-800 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" />
            Draf Proposal KKN
          </span>
          <button
            onClick={() => copyToClipboard(JSON.stringify(draft, null, 2), 'Draf Proposal')}
            className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 hover:underline"
          >
            <Copy className="w-3 h-3" />
            <span>Salin Draf</span>
          </button>
        </div>

        <div>
          <h4 className="font-bold text-xs text-navy-950 dark:text-white">
            {draft.judul_program || draft.judul}
          </h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
            Desa: <strong>{draft.desa_tujuan || draft.nama_desa}</strong> • Metodologi: {draft.metodologi || 'PAR'}
          </p>
        </div>

        <div className="pt-2 border-t border-amber-200/60 dark:border-navy-800 flex items-center gap-2">
          <button
            onClick={() => handleNavigate('/mahasiswa/proposal')}
            className="w-full py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
          >
            <span>Buka di Halaman Proposal</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 8. PROGRESS & LOGBOOK CARD
  if (variant === 'progress') {
    const log = data.entry || data;
    return (
      <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-navy-900 border border-emerald-200 dark:border-emerald-800 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Draf Catatan Logbook KKN
          </span>
          {log.progres_persen !== undefined && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {log.progres_persen}% Selesai
            </span>
          )}
        </div>

        <div>
          <h4 className="font-bold text-xs text-navy-950 dark:text-white">
            {log.kegiatan_utama}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
            <span>Tanggal: <strong>{log.tanggal}</strong></span>
            <span>Durasi: <strong>{log.jam_kerja} Jam</strong></span>
          </p>
        </div>

        {log.output_tercapai && (
          <div className="text-[11px] bg-white/70 dark:bg-navy-950 p-2 rounded-lg border border-emerald-100 dark:border-navy-800 text-slate-700 dark:text-slate-300">
            Output: <strong>{log.output_tercapai}</strong>
          </div>
        )}

        <div className="pt-2 border-t border-emerald-200/60 dark:border-navy-800">
          <button
            onClick={() => handleNavigate('/mahasiswa/progress')}
            className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
          >
            <span>Lihat Logbook Harian</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 9. NAVIGATE CARD (DEFAULT FALLBACK)
  const nav = data;
  return (
    <div className="p-3.5 rounded-2xl bg-primary-50/70 dark:bg-navy-900 border border-primary-200 dark:border-primary-800 shadow-2xs flex items-center justify-between gap-3 text-slate-900 dark:text-white">
      <div>
        <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
          Rekomendasi Halaman
        </span>
        <h4 className="font-bold text-xs">{nav.title || 'Halaman'}</h4>
        {nav.reason && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{nav.reason}</p>}
      </div>
      <button
        onClick={() => handleNavigate(nav.path || '/')}
        className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1 shrink-0 hover:bg-primary-600 transition-colors shadow-2xs"
      >
        <span>Buka</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/**
 * SmartCardList Component - Renders 1-4 compact cards in responsive grid / carousel
 */
export function SmartCardList({
  variant,
  items,
  onSendMessage,
  onCloseCopilot,
}: {
  variant: SmartCardVariant | string;
  items: any[];
  onSendMessage?: (prompt: string) => void;
  onCloseCopilot?: () => void;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-navy-700/60">
      <div
        className={`grid gap-2.5 ${
          items.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {items.map((item, idx) => (
          <ContextualSmartCard
            key={item.id || idx}
            variant={variant}
            data={item}
            onSendMessage={onSendMessage}
            onCloseCopilot={onCloseCopilot}
          />
        ))}
      </div>
    </div>
  );
}
