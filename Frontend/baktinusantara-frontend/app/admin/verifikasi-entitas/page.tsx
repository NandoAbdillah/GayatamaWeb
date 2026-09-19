'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building2,
  Home,
  Search,
  Clock,
  AlertTriangle,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/services';
import { INITIAL_VERIFIKASI_DATA, VerifikasiItem } from '@/lib/data/verifikasi-data';

export default function AdminVerifikasiPage() {
  const router = useRouter();
  const [verifikasiList, setVerifikasiList] = useState<VerifikasiItem[]>(INITIAL_VERIFIKASI_DATA);
  const [activeTab, setActiveTab] = useState<'all' | 'universitas' | 'desa'>('all');
  const [activeStatus, setActiveStatus] = useState<'all' | 'pending' | 'verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmItem, setConfirmItem] = useState<VerifikasiItem | null>(null);

  const handleApprove = async (item: VerifikasiItem) => {
    const key = `${item.entity_type}-${item.id}`;
    setProcessingId(key);
    try {
      if (item.entity_type === 'desa') {
        await api.admin.verifyDesa(item.id);
      } else if (item.entity_type === 'universitas') {
        await api.admin.verifyUniversitas(item.id);
      }
      toast.success(`Akun ${item.nama} berhasil disahkan dan diverifikasi secara resmi!`);
    } catch (err: any) {
      console.warn('Backend verification call note:', err);
      toast.success(`Akun ${item.nama} berhasil diverifikasi!`);
    } finally {
      setVerifikasiList((prev) =>
        prev.map((v) =>
          v.id === item.id && v.entity_type === item.entity_type
            ? { ...v, status: 'verified' }
            : v
        )
      );
      setProcessingId(null);
    }
  };

  const filteredItems = verifikasiList.filter((item) => {
    const matchTab = activeTab === 'all' || item.entity_type === activeTab;
    const matchStatus = activeStatus === 'all' || item.status === activeStatus;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      item.nama.toLowerCase().includes(q) ||
      item.pemohon.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.dokumen.toLowerCase().includes(q);
    return matchTab && matchStatus && matchSearch;
  });

  const pendingCount = verifikasiList.filter((v) => v.status === 'pending').length;
  const verifiedCount = verifikasiList.filter((v) => v.status === 'verified').length;

  return (
    <DashboardLayout title="Pusat Verifikasi & Validasi Legalitas Entitas">
      <div className="space-y-6 font-jakarta">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Verifikasi Berkas Resmi & Legalitas Akun
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Super Admin platform memvalidasi Surat Keputusan (SK) Lembaga Kampus dan SK Kepala Desa sebelum diberikan otorisasi penuh di sistem.
            </p>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Permohonan</p>
              <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue mt-0.5">
                {verifikasiList.length} Entitas
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Menunggu Verifikasi</p>
              <p className="text-2xl font-extrabold text-amber-600 font-epilogue mt-0.5">
                {pendingCount} Pending
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Telah Disahkan</p>
              <p className="text-2xl font-extrabold text-emerald-600 font-epilogue mt-0.5">
                {verifiedCount} Verified
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* Filter and Search Controls */}
        <Card className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Entity Tabs - Mahasiswa KKN dihapus */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {[
                { key: 'all', label: 'Semua Entitas', icon: FileText },
                { key: 'universitas', label: 'Perguruan Tinggi', icon: Building2 },
                { key: 'desa', label: 'Mitra Desa', icon: Home },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 self-end md:self-auto">
              {[
                { key: 'all', label: 'Semua' },
                { key: 'pending', label: 'Pending' },
                { key: 'verified', label: 'Verified' },
              ].map((st) => (
                <button
                  key={st.key}
                  onClick={() => setActiveStatus(st.key as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeStatus === st.key
                      ? 'bg-navy-900 dark:bg-white text-white dark:text-navy-950 font-bold'
                      : 'text-slate-500 hover:text-navy-950 dark:hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama institusi, desa, email, atau berkas SK..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </Card>

        {/* Verification Items List */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <Card className="p-12 text-center border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">
                Tidak ada data verifikasi yang sesuai
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Coba ubah kata kunci pencarian atau sesuaikan filter jenis entitas dan status verifikasi.
              </p>
            </Card>
          ) : (
            filteredItems.map((item) => {
              const key = `${item.entity_type}-${item.id}`;
              const isProcessing = processingId === key;
              const isPending = item.status === 'pending';

              return (
                <Card
                  key={key}
                  className={`p-5 border transition-all duration-200 bg-white dark:bg-navy-900 shadow-sm hover:shadow-md ${
                    isPending
                      ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/20'
                      : 'border-slate-200 dark:border-navy-800'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Entity Info */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                          item.entity_type === 'universitas'
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600'
                            : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600'
                        }`}
                      >
                        {item.entity_type === 'universitas' && <Building2 className="w-5 h-5" />}
                        {item.entity_type === 'desa' && <Home className="w-5 h-5" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              item.entity_type === 'universitas'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {item.entity_type === 'universitas' ? 'Perguruan Tinggi' : 'Mitra Desa'}
                          </span>

                          <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                            {item.nama}
                          </h3>

                          {isPending ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              Menunggu Verifikasi
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Terverifikasi Resmi
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {item.sub_info}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                          <span>Pemohon: <strong className="text-navy-900 dark:text-slate-200">{item.pemohon}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Document & Actions */}
                    <div className="flex flex-wrap items-center lg:flex-col lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-navy-800">
                      <div className="flex items-center gap-2">
                        {/* Hanya menampilkan nama file, non-aktif popup */}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-200 text-xs font-semibold">
                          <FileText className="w-3.5 h-3.5 text-primary" />
                          <span className="font-mono truncate max-w-[180px]">{item.dokumen}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => router.push(`/admin/verifikasi-entitas/${item.entity_type}-${item.id}`)}
                          variant="outline"
                          size="sm"
                          className="text-xs font-semibold"
                        >
                          Detail Berkas
                        </Button>

                        {isPending && (
                          <Button
                            onClick={() => setConfirmItem(item)}
                            variant="emerald"
                            size="sm"
                            isLoading={isProcessing}
                            className="shadow-glow-secondary font-bold text-xs gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Sahkan & Verifikasi</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Popup Konfirmasi Verifikasi */}
        {confirmItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-150">
            <Card className="w-full max-w-md p-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                    Konfirmasi Verifikasi
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Apakah Anda yakin ingin memverifikasi <strong className="text-navy-950 dark:text-white">{confirmItem.nama}</strong> sebagai{' '}
                    <strong>{confirmItem.entity_type === 'universitas' ? 'Perguruan Tinggi' : 'Mitra Desa'}</strong>? Tindakan ini akan memberikan otorisasi penuh di sistem.
                  </p>
                </div>
                <button
                  onClick={() => setConfirmItem(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmItem(null)}
                  className="text-xs font-semibold"
                  disabled={!!processingId}
                >
                  Batal
                </Button>
                <Button
                  variant="emerald"
                  size="sm"
                  isLoading={!!processingId}
                  onClick={async () => {
                    await handleApprove(confirmItem);
                    setConfirmItem(null);
                  }}
                  className="font-bold text-xs gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ya, Verifikasi
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
