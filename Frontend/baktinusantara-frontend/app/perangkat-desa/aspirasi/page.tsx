'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/services';
import { Aspirasi } from '@/lib/types';
import { MessageSquare, Plus, Send, AlertCircle, ChevronDown, ChevronUp, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PerangkatDesaAspirasiPage() {
  const [aspirasiList, setAspirasiList] = useState<Aspirasi[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRejectId, setActiveRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [expandedReject, setExpandedReject] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'semua' | 'menunggu' | 'ditolak' | 'diverifikasi'>('semua');

  const fetchAspirasi = async () => {
    try {
      setLoading(true);
      const res = await api.aspirasi.getByDesa();
      if (Array.isArray(res)) {
        setAspirasiList(res);
      } else {
        setAspirasiList([]);
      }
    } catch (err) {
      console.error('Gagal mengambil data aspirasi desa:', err);
      toast.error('Gagal memuat aspirasi dari server.');
      setAspirasiList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAspirasi();
  }, []);

  const getStatusBadgeProps = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'rejected' || s === 'ditolak') return { status: 'rejected' as const, label: 'Ditolak' };
    if (s === 'verified' || s === 'terverifikasi' || s === 'converted_to_pos') return { status: 'verified' as const, label: 'Diverifikasi' };
    return { status: 'pending' as const, label: 'Menunggu' };
  };

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
        const haystack = [item.judul, item.deskripsi, item.nama_pengadu || (item as any).pelapor_nama || '', item.ticket_number || '', item.nomor_kontak || (item as any).pelapor_wa || '']
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
    if (!rejectReason.trim()) {
      toast.error('Harap masukkan alasan penolakan aspirasi');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.aspirasi.decide(item.id, {
        action: 'reject',
        alasan_tolak: rejectReason.trim(),
      });
      toast.success('Aspirasi berhasil ditolak dengan alasan resmi.');
      setActiveRejectId(null);
      setRejectReason('');
      await fetchAspirasi();
    } catch (err: any) {
      console.error('Gagal menolak aspirasi:', err);
      const errMsg = err?.response?.data?.message || 'Gagal memproses penolakan aspirasi.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Verifikasi Aspirasi Warga Desa">
      <div className="space-y-6 font-jakarta">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
            Verifikasi Aspirasi Masyarakat Desa
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tinjau usulan dari warga masyarakat. Aspirasi yang disetujui dapat langsung diterbitkan menjadi Pos Kebutuhan KKN mahasiswa.
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
              placeholder="Cari judul, deskripsi, pengusul, atau nomor tiket..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl text-sm text-navy-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-2xl p-1.5 shadow-sm overflow-x-auto">
            {filterOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  filterStatus === opt.value
                    ? 'bg-navy-950 dark:bg-primary text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm">Memuat usulan aspirasi warga...</p>
          </div>
        ) : filteredAspirasi.length === 0 ? (
          <Card className="p-12 text-center bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-navy-950 dark:text-white">Tidak Ada Aspirasi Warga</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Belum ada usulan aspirasi dari warga masyarakat untuk desa Anda pada status filter ini.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredAspirasi.map((item) => {
              const badge = getStatusBadgeProps(item.status);
              const isRejectActive = activeRejectId === item.id;
              const isExpanded = expandedReject.has(item.id);
              const isMenunggu = badge.label === 'Menunggu';
              const namaPengadu = item.nama_pengadu || (item as any).pelapor_nama || 'Warga Desa';
              const nomorKontak = item.nomor_kontak || (item as any).pelapor_wa || '-';
              const alasanTolak = item.tanggapan_desa || (item as any).alasan_tolak || '';

              return (
                <Card
                  key={item.id}
                  className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-navy-800 pb-3">
                      <span className="font-mono text-[11px] font-bold text-navy-900 dark:text-primary-300 bg-slate-100 dark:bg-navy-800 px-2.5 py-1 rounded-full w-fit">
                        {item.ticket_number || `ASP-#${item.id}`}
                      </span>
                      <StatusBadge status={badge.status} size="sm" />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue leading-snug">
                        {item.judul}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                        {item.deskripsi}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-surface-subtle dark:bg-navy-950 border border-slate-100 dark:border-navy-800 space-y-1 text-[11px]">
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Pengusul:</span>
                        <span className="font-semibold text-navy-950 dark:text-white">{namaPengadu}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500">
                        <span>Kontak WA:</span>
                        <span className="font-semibold text-navy-950 dark:text-white">{nomorKontak}</span>
                      </div>
                    </div>

                    {/* Jika ditolak, tampilkan accordion alasan */}
                    {alasanTolak && (
                      <div className="border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleReject(item.id)}
                          className="w-full flex items-center justify-between p-2.5 text-left text-xs font-bold text-rose-800 dark:text-rose-300"
                        >
                          <span className="flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Alasan Penolakan
                          </span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        {isExpanded && (
                          <div className="p-2.5 pt-0 text-xs text-rose-900 dark:text-rose-200 leading-relaxed border-t border-rose-200/60 dark:border-rose-900/40">
                            {alasanTolak}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Form Tolak Inline */}
                    {isRejectActive && (
                      <form
                        onSubmit={(e) => handleRejectSubmit(e, item)}
                        className="space-y-2.5 p-3 rounded-xl bg-surface-subtle dark:bg-navy-950 border border-slate-200 dark:border-navy-800 animate-fadeIn"
                      >
                        <textarea
                          rows={2}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Tulis alasan penolakan agar warga mendapat kejelasan..."
                          className="w-full p-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-xl text-xs text-navy-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                          autoFocus
                          required
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleCancelReject}
                            className="text-xs"
                            disabled={isSubmitting}
                          >
                            Batal
                          </Button>
                          <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            className="text-xs gap-1"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            <span>Kirim Alasan</span>
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {isMenunggu && !isRejectActive && (
                    <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveRejectId(item.id);
                          setRejectReason('');
                        }}
                        className="text-xs flex-1 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        Tolak
                      </Button>
                      <Link href={`/perangkat-desa/aspirasi/${item.id}/buat-pos`} className="flex-1">
                        <Button
                          variant="emerald"
                          size="sm"
                          className="text-xs w-full gap-1 shadow-glow-secondary"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Buat Pos</span>
                        </Button>
                      </Link>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
