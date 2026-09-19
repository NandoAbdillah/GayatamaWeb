"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  MOCK_KELOMPOK_14,
  MOCK_LOGBOOKS,
  MOCK_POS_KEBUTUHAN,
} from "@/lib/mock-data";
import {
  ArrowLeft,
  Users,
  MapPin,
  GraduationCap,
  Layers,
  Target,
  Calendar,
  Clock,
  Award,
  FileCheck2,
  TrendingUp,
  Building2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// Reuse same list as induk page (keep sinkron)
const KELOMPOK_LIST = [
  MOCK_KELOMPOK_14,
  {
    id: 15,
    nama_kelompok: "Kelompok 15 - Sukamaju Sejahtera",
    kode_kelompok: "KKN-2026-SKM-015",
    ketua_id: 102,
    ketua_nama: "Salsabila Putri",
    dosen_id: 301,
    dosen_nama: "Dr. Ir. Hendra Gunawan, M.T.",
    pos_kebutuhan_id: 3,
    pos_kebutuhan_judul:
      "Pemberdayaan Posyandu Digital & Pencegahan Stunting Balita",
    desa_nama: "Desa Sukamaju, Bogor",
    total_anggota: 4,
    status_program: "pelaksanaan" as const,
    progres_persen: 45,
    anggota: [
      {
        id: 2,
        user_id: 102,
        nama: "Salsabila Putri",
        nim: "21051204045",
        jurusan: "Agribisnis",
        role_kelompok: "Ketua" as const,
        avatar_url:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      },
      {
        id: 6,
        user_id: 106,
        nama: "Rizki Maulana",
        nim: "21051204077",
        jurusan: "Gizi",
        role_kelompok: "Anggota" as const,
        avatar_url:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      },
      {
        id: 7,
        user_id: 107,
        nama: "Anisa Rahma",
        nim: "21051204111",
        jurusan: "Kesehatan Masyarakat",
        role_kelompok: "Anggota" as const,
        avatar_url:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
      },
      {
        id: 8,
        user_id: 108,
        nama: "Fajar Nugroho",
        nim: "21051204099",
        jurusan: "Sistem Informasi",
        role_kelompok: "Anggota" as const,
        avatar_url:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      },
    ],
  },
  {
    id: 11,
    nama_kelompok: "Kelompok 11 - Sukamaju Kreatif",
    kode_kelompok: "KKN-2026-SKM-011",
    ketua_id: 103,
    ketua_nama: "Dimas Arya Pamungkas",
    dosen_id: 301,
    dosen_nama: "Dr. Ir. Hendra Gunawan, M.T.",
    pos_kebutuhan_id: 4,
    pos_kebutuhan_judul:
      "Digitalisasi Sentra Bunga & Edukasi Sains Literasi Anak Lereng",
    desa_nama: "Desa Sukamaju, Bogor",
    total_anggota: 6,
    status_program: "perencanaan" as const,
    progres_persen: 18,
    anggota: [
      {
        id: 3,
        user_id: 103,
        nama: "Dimas Arya Pamungkas",
        nim: "21051204088",
        jurusan: "Ilmu Komunikasi",
        role_kelompok: "Ketua" as const,
        avatar_url:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      },
      {
        id: 9,
        user_id: 109,
        nama: "Maya Sari",
        nim: "21051204120",
        jurusan: "PGSD",
        role_kelompok: "Anggota" as const,
        avatar_url:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
      },
      {
        id: 10,
        user_id: 110,
        nama: "Andi Wijaya",
        nim: "21051204131",
        jurusan: "Biologi",
        role_kelompok: "Anggota" as const,
        avatar_url:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      },
      {
        id: 11,
        user_id: 111,
        nama: "Lestari Dewi",
        nim: "21051204142",
        jurusan: "DKV",
        role_kelompok: "Anggota" as const,
        avatar_url:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      },
      {
        id: 12,
        user_id: 112,
        nama: "Budi Santoso",
        nim: "21051204153",
        jurusan: "Sistem Informasi",
        role_kelompok: "Anggota" as const,
        avatar_url:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      },
      {
        id: 13,
        user_id: 113,
        nama: "Citra Lestari",
        nim: "21051204164",
        jurusan: "Pendidikan",
        role_kelompok: "Anggota" as const,
        avatar_url:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
      },
    ],
  },
];

// Mock periode & logbook tambahan untuk kelompok selain 14 (agar tidak kosong)
const EXTRA_LOGBOOKS: typeof MOCK_LOGBOOKS = [
  {
    id: 101,
    kelompok_id: 15,
    mahasiswa_id: 102,
    mahasiswa_nama: "Salsabila Putri",
    mahasiswa_nim: "21051204045",
    mahasiswa_jurusan: "Agribisnis",
    tanggal: "2026-09-03",
    minggu_ke: 4,
    durasi_jam: 6,
    judul_kegiatan:
      "Penyuluhan MPASI Pangan Lokal & Demo Masak di Posyandu Dusun 1",
    deskripsi:
      "Edukasi 18 ibu balita tentang pengolahan MPASI berbasis singkong dan daun kelor, dilanjutkan pengukuran BB/TB balita dan input ke dashboard posyandu.",
    target_program_terkait: "Dashboard Gizi & Modul MPASI",
    foto_dokumentasi_urls: [
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&auto=format&fit=crop&q=80",
    ],
    status: "approved",
    disahkan_pada: "2026-09-04 09:00:00",
  },
  {
    id: 102,
    kelompok_id: 15,
    mahasiswa_id: 107,
    mahasiswa_nama: "Anisa Rahma",
    mahasiswa_nim: "21051204111",
    mahasiswa_jurusan: "Kesehatan Masyarakat",
    tanggal: "2026-08-30",
    minggu_ke: 3,
    durasi_jam: 5,
    judul_kegiatan:
      "Pendataan Balita Stunting & Instalasi Filter Air Bersih Dusun 2",
    deskripsi:
      "Survei door-to-door 24 rumah, pemasangan 2 unit filter air sederhana, dan sosialisasi PHBS keluarga.",
    target_program_terkait: "Filter Air & Sanitasi",
    foto_dokumentasi_urls: [
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=500&auto=format&fit=crop&q=80",
    ],
    status: "submitted",
  },
  {
    id: 103,
    kelompok_id: 11,
    mahasiswa_id: 103,
    mahasiswa_nama: "Dimas Arya Pamungkas",
    mahasiswa_nim: "21051204088",
    mahasiswa_jurusan: "Ilmu Komunikasi",
    tanggal: "2026-09-01",
    minggu_ke: 2,
    durasi_jam: 4,
    judul_kegiatan:
      "Observasi Lahan Florikultura & Pemetaan Titik Pojok Literasi",
    deskripsi:
      "Mapping 12 petak bunga krisan & mawar, wawancara 6 petani, dan survei lokasi SD untuk pojok baca.",
    target_program_terkait: "Website Florikultura & Pojok Literasi",
    foto_dokumentasi_urls: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80",
    ],
    status: "revision",
    catatan_revisi_dpl:
      "Tambahkan foto before-after lahan dan daftar nama petani yang diwawancarai.",
  },
];

const ALL_LOGBOOKS = [...MOCK_LOGBOOKS, ...EXTRA_LOGBOOKS];

export default function PerangkatDesaProgressDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);
  const kelompok = KELOMPOK_LIST.find((k) => k.id === id);
  const pos = kelompok
    ? MOCK_POS_KEBUTUHAN.find((p) => p.id === kelompok.pos_kebutuhan_id)
    : null;

  const logs = useMemo(() => {
    if (!kelompok) return [];
    return ALL_LOGBOOKS.filter((l) => l.kelompok_id === kelompok.id).sort(
      (a, b) => a.minggu_ke - b.minggu_ke || a.tanggal.localeCompare(b.tanggal),
    );
  }, [kelompok]);

  const logsByWeek = useMemo(() => {
    const map = new Map<number, typeof logs>();
    logs.forEach((l) => {
      if (!map.has(l.minggu_ke)) map.set(l.minggu_ke, []);
      map.get(l.minggu_ke)!.push(l);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [logs]);

  const totalJam = logs.reduce((a, b) => a + b.durasi_jam, 0);
  const approvedCount = logs.filter((l) => l.status === "approved").length;
  const pendingCount = logs.filter((l) => l.status === "submitted").length;
  const revisionCount = logs.filter((l) => l.status === "revision").length;

  // Dropdown state per minggu — default tertutup, buka hanya saat diklik
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());

  const toggleWeek = (minggu: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(minggu)) next.delete(minggu);
      else next.add(minggu);
      return next;
    });
  };

  // Pagination anggota — dinamis berpatok tinggi card Projek
  const projekRef = useRef<HTMLDivElement>(null);
  const [dynamicPerPage, setDynamicPerPage] = useState(6);
  const [anggotaPage, setAnggotaPage] = useState(0);

  useEffect(() => {
    const el = projekRef.current;
    if (!el) return;
    const calc = () => {
      const h = el.offsetHeight;
      // overhead: header anggota (~48) + table header (~40) + pagination (~36) + padding/gap (~48) = ~172
      const overhead = 172;
      const rowH = 45; // py-3 ~44px
      const available = Math.max(0, h - overhead);
      const rows = Math.max(3, Math.floor(available / rowH));
      // batasi 4..8 agar tidak terlalu pendek/panjang
      const perPage = Math.min(8, Math.max(4, rows));
      setDynamicPerPage(perPage);
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    window.addEventListener('resize', calc);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', calc);
    };
  }, [kelompok?.id, pos]);

  const basePerPage = dynamicPerPage;
  const totalAnggota = kelompok?.anggota.length || 0;
  const rawPages = Math.ceil(totalAnggota / basePerPage);
  // hindari halaman terakhir hanya 1 baris → sebar rata (7 → 4+3, bukan 6+1)
  const anggotaPerPage =
    rawPages > 1 && totalAnggota % basePerPage === 1 ? Math.ceil(totalAnggota / rawPages) : basePerPage;
  const totalAnggotaPages = Math.ceil(totalAnggota / anggotaPerPage);
  const paginatedAnggota = useMemo(() => {
    if (!kelompok) return [];
    const start = anggotaPage * anggotaPerPage;
    return kelompok.anggota.slice(start, start + anggotaPerPage);
  }, [kelompok, anggotaPage, anggotaPerPage]);

  useEffect(() => {
    setAnggotaPage(0);
  }, [id]);

  // reset halaman jika perPage berubah dan halaman sekarang out of range
  useEffect(() => {
    if (anggotaPage >= totalAnggotaPages && totalAnggotaPages > 0) {
      setAnggotaPage(totalAnggotaPages - 1);
    }
  }, [anggotaPage, totalAnggotaPages]);

  if (!kelompok) {
    return (
      <DashboardLayout title="Detail Kelompok KKN">
        <div className="space-y-6 font-jakarta">
          <Link href="/perangkat-desa/progress">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-bold bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-700 text-navy-950 dark:text-slate-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar
            </Button>
          </Link>
          <Card className="p-8 text-center bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <p className="text-sm font-bold text-navy-950 dark:text-white">
              Kelompok tidak ditemukan
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              ID {params?.id} tidak ada di Desa Sukamaju.
            </p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const statusInfo: Record<string, { label: string; color: string }> = {
    perencanaan: { label: "Persiapan", color: "bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300" },
    pelaksanaan: { label: "Pelaksanaan", color: "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300" },
    penyusunan_luaran: {
      label: "Penyusunan Luaran",
      color: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300",
    },
    selesai: { label: "Selesai", color: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300" },
  };
  const st = statusInfo[kelompok.status_program] ?? statusInfo.pelaksanaan;

  return (
    <DashboardLayout title={`Detail ${kelompok.nama_kelompok}`}>
      <div className="space-y-6 font-jakarta w-full">
        {/* Back */}
        <Link href="/perangkat-desa/progress">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-bold bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-700 text-navy-950 dark:text-slate-100"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </Button>
        </Link>

        {/* Header full-width */}
        <div className="rounded-3xl bg-gradient-to-r from-navy-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 shadow-ambient-lg border border-slate-800 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden lg:flex items-center justify-end pr-8">
            <Layers className="w-56 h-56" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/15 text-xs font-mono font-bold">
                {kelompok.kode_kelompok}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${st.color}`}
              >
                {st.label}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs">
                <Users className="w-3.5 h-3.5" />
                {kelompok.total_anggota} Anggota
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                04 Agu – 06 Sep 2026
              </span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold font-epilogue leading-tight">
                {kelompok.nama_kelompok}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-300" />
                {kelompok.desa_nama}
              </p>
            </div>
            <div className="flex items-center gap-3 max-w-md">
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${kelompok.progres_persen}%` }}
                />
              </div>
              <span className="text-xs font-bold whitespace-nowrap">
                {kelompok.progres_persen}% Progres
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Projek - kiri */}
          <Card ref={projekRef} className="p-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-sm space-y-4 h-full flex flex-col">
            <h2 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary dark:text-primary-400" />
              Projek yang Dikerjakan
            </h2>
            <div>
              <p className="text-sm font-bold text-navy-950 dark:text-white leading-snug">{kelompok.pos_kebutuhan_judul}</p>
              {pos && (
                <span className="inline-flex mt-1 px-2.5 py-0.5 rounded-full bg-primary/10 dark:bg-primary-950/70 text-primary dark:text-primary-300 text-[11px] font-bold">
                  {pos.kategori_sektor}
                </span>
              )}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-3 whitespace-pre-line">
                {pos?.deskripsi || 'Deskripsi projek belum tersedia.'}
              </p>
            </div>
            {pos?.target_luaran && pos.target_luaran.length > 0 && (
              <div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  Tujuan / Target Luaran
                </p>
                <ul className="mt-2 space-y-1.5">
                  {pos.target_luaran.map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {pos?.kriteria_jurusan && (
              <div className="pt-3 border-t border-slate-100 dark:border-navy-800 mt-auto">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Keahlian Dibutuhkan</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {pos.kriteria_jurusan.map((j) => (
                    <span key={j} className="px-2.5 py-1 rounded-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      {j}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs mt-3">
              <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-slate-700 dark:text-slate-300">
                Dosen Pembimbing: <strong className="text-navy-900 dark:text-white">{kelompok.dosen_nama}</strong>
              </span>
            </div>
          </Card>

          {/* Anggota - kanan */}
          <Card className="p-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-sm h-full flex flex-col">
            <h2 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Daftar Anggota Kelompok
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{kelompok.total_anggota} Anggota</p>

            <div className="flex-1 flex flex-col mt-4">
              <div className="border border-slate-200 dark:border-navy-700 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-navy-950/80 border-b border-slate-200 dark:border-navy-700 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="px-3 py-2.5 text-left font-bold">Nama</th>
                      <th className="px-3 py-2.5 text-left font-bold">NIM</th>
                      <th className="px-3 py-2.5 text-left font-bold">Jurusan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-navy-700">
                    {paginatedAnggota.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-navy-800/60 transition-colors">
                        <td className="px-3 py-3 text-xs font-semibold text-navy-950 dark:text-white">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate">{a.nama}</span>
                            {a.role_kelompok === 'Ketua' && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[9px] font-bold">Ketua</span>
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs font-mono text-slate-600 dark:text-slate-300">{a.nim}</td>
                        <td className="px-3 py-3 text-xs text-slate-600 dark:text-slate-300">{a.jurusan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex-1" />

              {/* Pagination ikon < > */}
              {totalAnggotaPages > 1 ? (
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Halaman {anggotaPage + 1} dari {totalAnggotaPages}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setAnggotaPage((p) => Math.max(0, p - 1))}
                      disabled={anggotaPage === 0}
                      className="w-7 h-7 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1 mx-1">
                      {Array.from({ length: totalAnggotaPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setAnggotaPage(i)}
                          className={`w-2 h-2 rounded-full transition-all ${i === anggotaPage ? 'bg-navy-950 dark:bg-primary-400 w-4' : 'bg-slate-300 dark:bg-navy-700'}`}
                          aria-label={`Halaman ${i + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => setAnggotaPage((p) => Math.min(totalAnggotaPages - 1, p + 1))}
                      disabled={anggotaPage === totalAnggotaPages - 1}
                      className="w-7 h-7 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Berikutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </Card>
        </div>

        {/* Logbook Mingguan */}
        <Card className="p-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Logbook Mingguan — Laporan Kegiatan Lapangan
            </h2>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{logs.length} catatan</span>
          </div>

          {logs.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-slate-200 dark:border-navy-700 rounded-2xl bg-slate-50 dark:bg-navy-950">
              <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-2">Belum ada logbook</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kelompok ini belum mengunggah laporan mingguan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logsByWeek.map(([minggu, items]) => {
                const isExpanded = expandedWeeks.has(minggu);
                return (
                  <div key={minggu} className="rounded-2xl border border-slate-200 dark:border-navy-800 overflow-hidden bg-white dark:bg-navy-900 shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleWeek(minggu)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-navy-800/60 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-navy-950 dark:bg-primary-600 text-white text-xs font-bold shrink-0">Minggu {minggu}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{items.length} kegiatan</span>
                      </div>
                      <span
                        className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isExpanded ? 'bg-navy-950 dark:bg-primary-600 text-white border-navy-950 dark:border-primary-600 rotate-180' : 'bg-white dark:bg-navy-800 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-navy-700'
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    </button>

                    <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <div className="overflow-hidden">
                        <div className="p-4 pt-0 space-y-4 bg-slate-50/60 dark:bg-navy-950/60 border-t border-slate-100 dark:border-navy-800">
                          {items.map((log) => (
                            <div key={log.id} className="p-4 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 space-y-3 mt-4 shadow-sm">
                              <div className="flex items-start justify-between gap-3">
                                <h3 className="text-sm font-bold text-navy-950 dark:text-white leading-snug flex-1 pr-2">{log.judul_kegiatan}</h3>
                                <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 px-2.5 py-1 rounded-full font-medium whitespace-nowrap">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {log.tanggal}
                                </span>
                              </div>
                              <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Target: {log.target_program_terkait}</p>

                              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">{log.deskripsi}</p>

                              {(log.foto_dokumentasi_urls?.length ?? 0) > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                  {log.foto_dokumentasi_urls!.map((url, i) => (
                                    <img key={i} src={url} alt="Dokumentasi" className="w-24 h-24 rounded-xl object-cover border border-slate-200 dark:border-navy-700 shrink-0" />
                                  ))}
                                </div>
                              )}

                              {log.catatan_revisi_dpl && (
                                <div className="flex items-start gap-2 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-xs">
                                  <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-bold text-orange-800 dark:text-orange-300">Catatan Revisi DPL:</p>
                                    <p className="text-orange-900 dark:text-orange-200 leading-relaxed mt-0.5">{log.catatan_revisi_dpl}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
