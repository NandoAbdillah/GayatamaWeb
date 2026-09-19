'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/services';
import { MOCK_ASPIRASI } from '@/lib/mock-data';
import { Aspirasi } from '@/lib/types';
import { MessageSquare, Plus, Send, AlertCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function PerangkatDesaAspirasiPage() {
  const [aspirasiList, setAspirasiList] = useState<Aspirasi[]>(MOCK_ASPIRASI);
  const [activeRejectId, setActiveRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [expandedReject, setExpandedReject] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAspirasi = () => {
    api.aspirasi
      .getByDesa()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          setAspirasiList(res);
        }
      })
      .catch((err) => {
        console.warn('Could not load desa aspirasi, keeping fallback:', err);
      });
  };

  useEffect(() => {
    fetchAspirasi();
  }, []);

  const getStatusBadgeProps = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'rejected') return { status: 'rejected' as const, label: 'Ditolak' };
    if (s === 'verified' || s === 'converted_to_pos') return { status: 'verified' as const, label: 'Diverifikasi' };
    return { status: 'pending' as const, label: 'Menunggu' };
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'menunggu' | 'ditolak' | 'diverifikasi'>('semua');

  const filterOptions: { value: typeof filterStatus; label: string }[] = [
    { value: 'semua', label: 'Semua' },
    { value: 'menunggu', label: 'Menunggu' },
    { value: 'ditolak', label: 'Ditolak' },
    { value: 'diverifikasi', label: 'Diverifikasi' },
  ];

  const filteredAspirasi = useMemo(() => {
    return aspirasiList.filter((item) => {
      const badge = getStatusBadgeProps(item.status);
      const label = badge.label.toLowerCase() as typeof filterStatus;
      if (filterStatus !== 'semua' && label !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const haystack = [item.judul, item.deskripsi, item.nama_pengadu, item.ticket_number, item.nomor_kontak || '']
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [aspirasiList, searchQuery, filterStatus]);

  const toggleReject = (id: number) => {
    setExpandedReject((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCancelReject = () => {
    setActiveRejectId(null);
    setRejectReason('');
  };

  const handleRejectSubmit = async (e: React.FormEvent, item: Aspirasi) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      try {
        await api.aspirasi.decide(item.id, {
          action: 'reject',
          alasan_tolak: rejectReason,
        });
      } catch (err) {
        console.warn('Mock reject fallback:', err);
      }
      setAspirasiList((prev) =>
        prev.map((a) => (a.id === item.id ? { ...a, status: 'rejected' as const, tanggapan_desa: rejectReason } : a))
      );
      toast.success('Aspirasi ditolak dengan alasan.');
      setActiveRejectId(null);
      setRejectReason('');
      // tetap tertutup default, user buka manual jika ingin lihat
    } catch {
      toast.error('Gagal menolak aspirasi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Verifikasi Aspirasi Warga Desa">
      <div className="space-y-6 font-jakarta">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">Daftar Aspirasi Masuk dari Warga</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tinjau usulan warga, verifikasi kebenaran lapangan, dan integrasikan menjadi pos kebutuhan KKN resmi desa.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul, deskripsi, pengusul, atau tiket..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  filterStatus === opt.value ? 'bg-navy-950 dark:bg-primary text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAspirasi.length === 0 ? (
            <div className="col-span-full">
              <Card className="p-10 text-center bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada aspirasi yang sesuai pencarian / filter.</p>
              </Card>
            </div>
          ) : (
            filteredAspirasi.map((item) => {
            const badge = getStatusBadgeProps(item.status);
            const isRejectActive = activeRejectId === item.id;
            const isExpanded = expandedReject.has(item.id);
            const isMenunggu = badge.label === 'Menunggu';

            return (
              <Card key={item.id} className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-navy-800 pb-3">
                  <span className="font-mono text-[11px] font-bold text-navy-900 dark:text-primary-300 bg-slate-100 dark:bg-navy-800 px-2.5 py-1 rounded-full w-fit">
                    {item.ticket_number || `ASP-2026-#${item.id}`}
                  </span>
                  <StatusBadge status={badge.status} label={badge.label} size="sm" className="shrink-0" />
                </div>

                <div className="flex-1 space-y-3 pt-3">
                  <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue leading-snug line-clamp-2">{item.judul}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">{item.deskripsi}</p>

                  {/* Info pengusul dengan background abu muda masing-masing */}
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400 mr-1.5">Pengusul:</span>
                      <strong className="text-navy-900 dark:text-white font-semibold">{item.nama_pengadu || 'Warga'}</strong>
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400 mr-1.5">Kontak:</span>
                      <strong className="text-navy-900 dark:text-white font-semibold">{item.nomor_kontak || '-'}</strong>
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs text-slate-600 dark:text-slate-300">
                      <span className="text-slate-400 mr-1.5">Tanggal:</span>
                      <strong className="text-navy-900 dark:text-white font-semibold">{item.created_at || 'Hari ini'}</strong>
                    </span>
                  </div>

                  {/* Inline input tolak — smooth */}
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${isRejectActive ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <form
                        onSubmit={(e) => handleRejectSubmit(e, item)}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 space-y-3"
                      >
                        <label className="block text-xs font-semibold text-navy-900 dark:text-white">
                          Alasan Penolakan <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          required
                          autoFocus={isRejectActive}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Contoh: Aspirasi belum menjadi prioritas pembangunan desa tahun ini karena keterbatasan anggaran dan SDM..."
                          className="w-full p-3 bg-white dark:bg-navy-900 border border-slate-300 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={handleCancelReject} disabled={isSubmitting}>
                            Batal
                          </Button>
                          <Button type="submit" variant="danger" size="sm" isLoading={isSubmitting} className="gap-1.5 font-bold">
                            <Send className="w-3.5 h-3.5" />
                            <span>Kirim</span>
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Dropdown hasil penolakan — smooth, default tertutup */}
                  {item.status === 'rejected' && item.tanggapan_desa && !isRejectActive && (
                    <div className="rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleReject(item.id)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-rose-100/50 dark:hover:bg-rose-950/60 transition-colors"
                      >
                        <span className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300 text-xs">
                          <AlertCircle className="w-4 h-4" />
                          Alasan Penolakan:
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-rose-700 dark:text-rose-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                      >
                        <div className="overflow-hidden">
                          <div className="px-4 pb-3">
                            <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed whitespace-pre-line">{item.tanggapan_desa}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* 2 button kanan bawah */}
                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-navy-800">
                  {isMenunggu && (
                    <>
                      <Button
                        onClick={() => {
                          setActiveRejectId(item.id);
                          setRejectReason('');
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold"
                      >
                        Tolak
                      </Button>
                      <Link href={`/perangkat-desa/aspirasi/${item.id}/buat-pos`}>
                        <Button variant="emerald" size="sm" className="text-xs font-bold gap-1.5 shadow-glow-secondary">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Jadikan Pos Kebutuhan</span>
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </Card>
            );
          })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
