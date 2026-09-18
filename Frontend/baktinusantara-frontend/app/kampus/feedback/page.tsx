'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  AlertCircle,
  Filter,
  User,
  Building,
  Heart,
  Calendar,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Reply,
} from 'lucide-react';
import { toast } from 'sonner';

interface Feedback {
  id: number;
  sender_role: string;
  sender_name: string;
  target: string;
  rating: number;
  kategori: string;
  isi: string;
  tanggal: string;
  status: 'pending' | 'selesai';
  tanggapan?: string;
  tanggapan_at?: string;
}

function stripRoleSuffix(name: string) {
  // "Dr. Ir. Hendra Gunawan, M.T. (DPL)" -> "Dr. Ir. Hendra Gunawan, M.T."
  return name.split(' (')[0].trim();
}

export default function AdminFeedbackPage() {
  const [activeRoleFilter, setActiveRoleFilter] = useState('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'pending' | 'selesai'>('all');

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: 1,
      sender_role: 'warga_desa',
      sender_name: 'Bpk. Suryanto',
      target: 'Kelompok 14 — Otomatisasi Irigasi IoT',
      rating: 5,
      kategori: 'Apresiasi Kemanfaatan',
      isi: 'Alat sensor irigasi yang dipasang adik-adik mahasiswa sangat membantu pembagian air sawah. Sekarang warga tidak perlu berjaga malam di pintu air.',
      tanggal: '06 Sep 2026, 14:20 WIB',
      status: 'pending',
    },
    {
      id: 2,
      sender_role: 'perangkat_desa',
      sender_name: 'Bpk. Mulyadi',
      target: 'Kelompok 08 — Digitalisasi UMKM',
      rating: 4,
      kategori: 'Saran Keberlanjutan',
      isi: 'Mohon agar admin sistem di desa diberikan pelatihan tambahan sebelum mahasiswa ditarik kembali ke kampus agar website UMKM tetap terupdate.',
      tanggal: '05 Sep 2026, 10:15 WIB',
      status: 'pending',
    },
    {
      id: 3,
      sender_role: 'dosen',
      sender_name: 'Dr. Ir. Hendra Gunawan, M.T.',
      target: 'Fasilitas & Transportasi LPPM',
      rating: 4,
      kategori: 'Evaluasi Logistik',
      isi: 'Koordinasi dengan Pemdes Sukamaju berjalan sangat baik. Mohon untuk periode berikutnya bantuan akomodasi monitoring dosen dipercepat pencairannya.',
      tanggal: '04 Sep 2026, 16:30 WIB',
      status: 'pending',
    },
    {
      id: 4,
      sender_role: 'mahasiswa',
      sender_name: 'Muhammad Raihan Pratama',
      target: 'Kurikulum & Konversi SKS',
      rating: 5,
      kategori: 'Refleksi Lapangan',
      isi: 'Pengalaman pengabdian di Desa Sukamaju membuka wawasan teknis nyata. Modul pengesahan BAST digital sangat mempermudah proses legalitas luaran kami.',
      tanggal: '03 Sep 2026, 19:40 WIB',
      status: 'selesai',
      tanggapan: 'Terima kasih atas refleksinya, Raihan. LPPM mencatat masukan terkait BAST digital untuk penyempurnaan periode berikutnya.',
      tanggapan_at: '04 Sep 2026, 09:00 WIB',
    },
  ]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [verifyId, setVerifyId] = useState<number | null>(null);

  const handleSendTanggapan = (id: number) => {
    if (!draft.trim()) {
      toast.error('Tanggapan tidak boleh kosong');
      return;
    }
    setFeedbacks((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              status: 'selesai' as const,
              tanggapan: draft.trim(),
              tanggapan_at: new Date().toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }) + ' WIB',
            }
          : f
      )
    );
    toast.success('Tanggapan berhasil dikirim dan status menjadi Selesai');
    setEditingId(null);
    setDraft('');
    setExpandedId(id);
  };

  const handleTandaiSelesai = (id: number) => {
    setFeedbacks((prev) => prev.map((f) => (f.id === id ? { ...f, status: 'selesai' as const } : f)));
    toast.success('Umpan balik ditandai Selesai');
    setVerifyId(null);
  };

  const filtered = feedbacks.filter((f) => {
    const matchRole = activeRoleFilter === 'all' || f.sender_role === activeRoleFilter;
    const matchStatus = activeStatusFilter === 'all' || f.status === activeStatusFilter;
    return matchRole && matchStatus;
  });

  return (
    <DashboardLayout title="Pusat Umpan Balik Stakeholder KKN">
      <div className="space-y-6 font-jakarta">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Pusat Umpan Balik & Evaluasi Multi-Stakeholder
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Evaluasi berkelanjutan dari warga desa, perangkat desa, dosen DPL, dan mahasiswa pelaksana KKN.
            </p>
          </div>
        </div>

        {/* Filter Kategori Pengirim + Status - sejajar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { key: 'all', label: 'Semua Umpan Balik' },
              { key: 'warga_desa', label: 'Masyarakat' },
              { key: 'perangkat_desa', label: 'Pemerintah Desa' },
              { key: 'dosen', label: 'Dosen Pembimbing' },
              { key: 'mahasiswa', label: 'Mahasiswa' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveRoleFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  activeRoleFilter === tab.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none lg:shrink-0 lg:justify-end">
            {[
              { key: 'all', label: 'Semua' },
              { key: 'pending', label: 'Perlu Respon' },
              { key: 'selesai', label: 'Selesai' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveStatusFilter(tab.key as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                  activeStatusFilter === tab.key
                    ? tab.key === 'pending'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : tab.key === 'selesai'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-navy-900 text-white shadow-sm'
                    : 'bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-800 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List Umpan Balik - Masonry 2 Kolom Independen (kolom tidak saling tarik tinggi) */}
        <div className="columns-1 lg:columns-2 gap-4">
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-400">
              Tidak ada umpan balik untuk filter ini.
            </div>
          )}
          {filtered.map((item) => {
            const displayName = stripRoleSuffix(item.sender_name);
            const isPending = item.status === 'pending';
            const isEditing = editingId === item.id;
            const isExpanded = expandedId === item.id;

            return (
              <Card
                key={item.id}
                className="p-6 space-y-4 border-slate-200 dark:border-navy-800 hover:shadow-md transition-shadow flex flex-col break-inside-avoid mb-4 inline-block w-full align-top"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-navy-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-navy-950 dark:text-white">{displayName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 capitalize">
                        {item.sender_role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${star <= item.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        isPending
                          ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900'
                      }`}
                    >
                      {isPending ? 'Perlu Respon' : 'Selesai'}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">"{item.isi}"</p>

                {/* Input Beri Tanggapan - di bawah komentar, masih dalam card */}
                {isEditing && (
                  <div className="rounded-xl bg-primary-50/60 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900 p-4 space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary">
                      <Reply className="w-3.5 h-3.5" />
                      <span>Tanggapan LPPM Kampus</span>
                    </div>
                    <textarea
                      rows={3}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Tuliskan tanggapan resmi LPPM untuk pengirim..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(null);
                          setDraft('');
                        }}
                        className="text-xs bg-white"
                      >
                        Batal
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSendTanggapan(item.id)}
                        className="text-xs gap-1.5 font-bold"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Hasil tanggapan - dropdown hidden */}
                {item.tanggapan && (
                  <div className="space-y-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-600 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      <span>{isExpanded ? 'Sembunyikan Tanggapan' : 'Lihat Tanggapan LPPM'}</span>
                      <span className="text-[11px] font-normal text-slate-400">({item.tanggapan_at})</span>
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 p-3.5 space-y-1">
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                            {item.tanggapan}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 mt-auto border-t border-slate-100 dark:border-navy-800">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {item.tanggal}
                  </span>

                  {/* Buttons: hanya saat pending */}
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingId(item.id);
                          setDraft('');
                        }}
                        className="text-xs font-bold gap-1.5 border-primary-200 text-primary hover:bg-primary-50 bg-white"
                        disabled={isEditing}
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>Beri Tanggapan</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="emerald"
                        onClick={() => setVerifyId(item.id)}
                        className="text-xs font-bold gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tandai Selesai</span>
                      </Button>
                    </div>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Selesai ditindaklanjuti
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Popup Verifikasi Tandai Selesai */}
      {verifyId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-700 shadow-2xl space-y-4">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">Tandai Selesai?</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Umpan balik akan ditandai <span className="font-bold">Selesai</span> tanpa mengirim tanggapan. Pastikan Anda sudah meninjau isinya.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" onClick={() => setVerifyId(null)} className="w-1/2 text-xs bg-white">
                <X className="w-3.5 h-3.5 mr-1" />
                <span>Batal</span>
              </Button>
              <Button
                variant="emerald"
                onClick={() => {
                  const id = verifyId!;
                  handleTandaiSelesai(id);
                }}
                className="w-1/2 text-xs font-bold gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ya, Selesai</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
