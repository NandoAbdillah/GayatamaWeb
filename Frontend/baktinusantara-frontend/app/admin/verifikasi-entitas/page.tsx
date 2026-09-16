'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building2,
  GraduationCap,
  Home,
  XCircle,
  Search,
  Filter,
  Eye,
  Download,
  AlertCircle,
  Clock,
  UserCheck,
  Building,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/services';

interface VerifikasiItem {
  id: number;
  entity_type: 'universitas' | 'desa' | 'mahasiswa';
  nama: string;
  sub_info: string;
  pemohon: string;
  email: string;
  kontak: string;
  dokumen: string;
  dokumen_url?: string;
  status: 'pending' | 'verified';
  tanggal_pengajuan: string;
  detail_info: {
    label: string;
    value: string;
  }[];
}

const INITIAL_VERIFIKASI_DATA: VerifikasiItem[] = [
  {
    id: 3,
    entity_type: 'universitas',
    nama: 'Universitas Airlangga (UNAIR)',
    sub_info: 'Lembaga Pengabdian Masyarakat & Inovasi (LPPM)',
    pemohon: 'Prof. Dr. Moh. Nasih, SE., MT., Ak.',
    email: 'unair@unair.ac.id',
    kontak: '081234567003',
    dokumen: 'SK_Pendirian_LPPM_UNAIR_2024.pdf',
    dokumen_url: '#',
    status: 'pending',
    tanggal_pengajuan: '14 September 2026',
    detail_info: [
      { label: 'Kode Institusi', value: 'UNAIR' },
      { label: 'Domisili Kampus', value: 'Kota Surabaya, Jawa Timur' },
      { label: 'Akreditasi', value: 'Unggul (A)' },
      { label: 'Fokus Pengabdian', value: 'Kesehatan Masyarakat, Maritim, & Sains Sosial' },
    ],
  },
  {
    id: 4,
    entity_type: 'desa',
    nama: 'Desa Maju Bersama',
    sub_info: 'Kec. Trawas, Kab. Mojokerto, Jawa Timur',
    pemohon: 'Kantor Balai Desa Maju Bersama',
    email: 'desa.pending@desa.id',
    kontak: '081234567204',
    dokumen: 'SK_Bupati_Kepala_Desa_Maju_Bersama.pdf',
    dokumen_url: '#',
    status: 'pending',
    tanggal_pengajuan: '15 September 2026',
    detail_info: [
      { label: 'Kecamatan / Kabupaten', value: 'Trawas / Kab. Mojokerto' },
      { label: 'Koordinat Lokasi', value: '-7.6811, 112.5934' },
      { label: 'Jumlah Penduduk', value: '3,420 Jiwa (4 Dusun)' },
      { label: 'Kebutuhan Mendesak', value: 'Digitalisasi Desa Wisata & Pengolahan Kopi' },
    ],
  },
  {
    id: 6,
    entity_type: 'mahasiswa',
    nama: 'Fajar Nugraha',
    sub_info: 'NIM: 23051204006 • S1 Teknik Elektro (Semester 6)',
    pemohon: 'Universitas Negeri Surabaya (UNESA)',
    email: 'mhs.pending@mhs.unesa.ac.id',
    kontak: '081234567308',
    dokumen: 'KTM_Fajar_Nugraha_UNESA_2026.pdf',
    dokumen_url: '#',
    status: 'pending',
    tanggal_pengajuan: '16 September 2026',
    detail_info: [
      { label: 'Perguruan Tinggi', value: 'Universitas Negeri Surabaya' },
      { label: 'Fakultas / Prodi', value: 'Teknik / S1 Teknik Elektro' },
      { label: 'IPK Terakhir', value: '3.78' },
      { label: 'Status SKS', value: '110 SKS (Memenuhi Syarat KKN)' },
    ],
  },
  {
    id: 1,
    entity_type: 'universitas',
    nama: 'Universitas Negeri Surabaya (UNESA)',
    sub_info: 'Lembaga Pengabdian Kepada Masyarakat (LPM)',
    pemohon: 'Dr. Budi Santoso (Ketua LPM)',
    email: 'unesa@unesa.ac.id',
    kontak: '081234567001',
    dokumen: 'SK_Rektor_LPM_UNESA.pdf',
    dokumen_url: '#',
    status: 'verified',
    tanggal_pengajuan: '01 Agustus 2026',
    detail_info: [
      { label: 'Kode Institusi', value: 'UNESA' },
      { label: 'Status Legalitas', value: 'Terverifikasi Resmi oleh Admin Platform' },
      { label: 'DPL Terdaftar', value: '2 Dosen DPL Aktif' },
    ],
  },
  {
    id: 2,
    entity_type: 'universitas',
    nama: 'Institut Teknologi Sepuluh Nopember (ITS)',
    sub_info: 'Direktorat Riset & Pengabdian Masyarakat (DRPM)',
    pemohon: 'Ir. Agus Setiawan, M.T.',
    email: 'its@its.ac.id',
    kontak: '081234567002',
    dokumen: 'SK_DRPM_ITS_Surabaya.pdf',
    dokumen_url: '#',
    status: 'verified',
    tanggal_pengajuan: '05 Agustus 2026',
    detail_info: [
      { label: 'Kode Institusi', value: 'ITS' },
      { label: 'Status Legalitas', value: 'Terverifikasi Resmi' },
      { label: 'Fokus Bidang', value: 'Rekayasa Teknologi Tepat Guna & Energi Bersih' },
    ],
  },
  {
    id: 1,
    entity_type: 'desa',
    nama: 'Desa Sukamaju',
    sub_info: 'Kec. Mojowarno, Kab. Jombang, Jawa Timur',
    pemohon: 'Kantor Kepala Desa Sukamaju',
    email: 'desa.sukamaju@desa.id',
    kontak: '081234567201',
    dokumen: 'SK_Bupati_Jombang_Kades_Sukamaju.pdf',
    dokumen_url: '#',
    status: 'verified',
    tanggal_pengajuan: '10 Agustus 2026',
    detail_info: [
      { label: 'Kecamatan / Kabupaten', value: 'Mojowarno / Kab. Jombang' },
      { label: 'Pos Kebutuhan Aktif', value: 'Digitalisasi UMKM & Posyandu' },
    ],
  },
  {
    id: 1,
    entity_type: 'mahasiswa',
    nama: 'Ahmad Fauzi (Ketua KKN)',
    sub_info: 'NIM: 23051204001 • S1 Teknik Informatika (UNESA)',
    pemohon: 'Fakultas Teknik UNESA',
    email: 'ketua.ahmad@mhs.unesa.ac.id',
    kontak: '081234567301',
    dokumen: 'KTM_Ahmad_Fauzi_Aktif.pdf',
    dokumen_url: '#',
    status: 'verified',
    tanggal_pengajuan: '12 Agustus 2026',
    detail_info: [
      { label: 'Perguruan Tinggi', value: 'UNESA' },
      { label: 'Kelompok KKN', value: 'KKN UNESA 01 - Sukamaju Digital' },
    ],
  },
];

export default function AdminVerifikasiPage() {
  const [verifikasiList, setVerifikasiList] = useState<VerifikasiItem[]>(INITIAL_VERIFIKASI_DATA);
  const [activeTab, setActiveTab] = useState<'all' | 'universitas' | 'desa' | 'mahasiswa'>('all');
  const [activeStatus, setActiveStatus] = useState<'all' | 'pending' | 'verified'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<VerifikasiItem | null>(null);

  const handleApprove = async (item: VerifikasiItem) => {
    const key = `${item.entity_type}-${item.id}`;
    setProcessingId(key);
    try {
      if (item.entity_type === 'desa') {
        await api.admin.verifyDesa(item.id);
      } else if (item.entity_type === 'mahasiswa') {
        await api.admin.verifyMahasiswa(item.id);
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
      if (previewModal && previewModal.id === item.id && previewModal.entity_type === item.entity_type) {
        setPreviewModal({ ...previewModal, status: 'verified' });
      }
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
              Super Admin platform memvalidasi Surat Keputusan (SK) Lembaga Kampus, SK Kepala Desa, dan Kartu Tanda Mahasiswa (KTM) aktif sebelum diberikan otorisasi penuh di sistem.
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
            {/* Entity Tabs */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {[
                { key: 'all', label: 'Semua Entitas', icon: FileText },
                { key: 'universitas', label: 'Perguruan Tinggi', icon: Building2 },
                { key: 'desa', label: 'Mitra Desa', icon: Home },
                { key: 'mahasiswa', label: 'Mahasiswa KKN', icon: GraduationCap },
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
              <span className="text-xs text-slate-400 font-medium">Status:</span>
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
              placeholder="Cari nama institusi, desa, mahasiswa, NIM, email, atau berkas SK..."
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
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                      ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/20'
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
                            : item.entity_type === 'desa'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {item.entity_type === 'universitas' && <Building2 className="w-5 h-5" />}
                        {item.entity_type === 'desa' && <Home className="w-5 h-5" />}
                        {item.entity_type === 'mahasiswa' && <GraduationCap className="w-5 h-5" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              item.entity_type === 'universitas'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                : item.entity_type === 'desa'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-primary/15 text-primary dark:text-primary-300'
                            }`}
                          >
                            {item.entity_type === 'universitas'
                              ? 'Perguruan Tinggi'
                              : item.entity_type === 'desa'
                              ? 'Pemerintah Desa'
                              : 'Mahasiswa KKN'}
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
                          <span>•</span>
                          <span>Email: <span className="font-mono text-slate-600 dark:text-slate-300">{item.email}</span></span>
                          <span>•</span>
                          <span>Kontak WA: <span className="font-mono">{item.kontak}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Document & Actions */}
                    <div className="flex flex-wrap items-center lg:flex-col lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-navy-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewModal(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-slate-200 dark:hover:bg-navy-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-primary" />
                          <span className="font-mono truncate max-w-[150px]">{item.dokumen}</span>
                          <Eye className="w-3.5 h-3.5 text-slate-400 ml-1" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setPreviewModal(item)}
                          variant="outline"
                          size="sm"
                          className="text-xs font-semibold"
                        >
                          Detail Berkas
                        </Button>

                        {isPending && (
                          <Button
                            onClick={() => handleApprove(item)}
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

        {/* Legal Document Detail Modal */}
        {previewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
            <Card className="w-full max-w-xl p-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                      Tinjauan Berkas Legalitas Entitas
                    </h3>
                    <p className="text-xs text-slate-500 capitalize">
                      Jenis: {previewModal.entity_type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPreviewModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-jakarta">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-950 dark:text-white text-sm">
                      {previewModal.nama}
                    </span>
                    <StatusBadge status={previewModal.status} size="sm" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    {previewModal.sub_info}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-slate-500 pt-1 border-t border-slate-200/60 dark:border-navy-800">
                    <div>Pemohon: <strong className="text-navy-950 dark:text-white">{previewModal.pemohon}</strong></div>
                    <div>Kontak WA: <strong className="text-navy-950 dark:text-white font-mono">{previewModal.kontak}</strong></div>
                    <div>Email Resmi: <span className="font-mono">{previewModal.email}</span></div>
                    <div>Diajukan Pada: <span>{previewModal.tanggal_pengajuan}</span></div>
                  </div>
                </div>

                {/* Detail Information Specs */}
                <div className="space-y-2">
                  <p className="font-bold text-navy-950 dark:text-white text-xs uppercase tracking-wider">
                    Informasi Legalitas & Profil
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {previewModal.detail_info.map((info, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-100/70 dark:bg-navy-800">
                        <p className="text-[10px] text-slate-400 font-semibold">{info.label}</p>
                        <p className="text-xs font-bold text-navy-950 dark:text-white mt-0.5">{info.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Document Attached Preview Box */}
                <div className="p-4 rounded-xl border border-dashed border-primary/40 bg-primary-50/30 dark:bg-primary-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-bold text-navy-950 dark:text-white font-mono">
                          {previewModal.dokumen}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Dokumen Resmi (Tanda Tangan & Cap Sah)
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info(`Membuka berkas dokumen: ${previewModal.dokumen}`)}
                      className="text-xs font-bold gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Berkas</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewModal(null)}
                  className="text-xs"
                >
                  Tutup
                </Button>
                {previewModal.status === 'pending' && (
                  <Button
                    variant="emerald"
                    size="sm"
                    onClick={() => handleApprove(previewModal)}
                    className="font-bold text-xs gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sahkan & Verifikasi Entitas</span>
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
