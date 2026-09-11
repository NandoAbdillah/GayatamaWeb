'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/services';
import { MOCK_KELOMPOK_14 } from '@/lib/mock-data';
import { Kelompok } from '@/lib/types';
import {
  Users,
  Copy,
  CheckCircle2,
  Building,
  GraduationCap,
  Sparkles,
  Award,
  Mail,
  Phone,
  UserPlus,
  PlusCircle,
  LogIn,
  Loader2,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MahasiswaKelompokPage() {
  const [kelompok, setKelompok] = useState<Kelompok>(MOCK_KELOMPOK_14);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showSetDosenModal, setShowSetDosenModal] = useState(false);

  // Form states
  const [namaKelompokInput, setNamaKelompokInput] = useState('');
  const [kelompokIdJoin, setKelompokIdJoin] = useState('1');
  const [jurusanKontribusi, setJurusanKontribusi] = useState('Teknik Informatika');
  const [dosenList, setDosenList] = useState<any[]>([]);
  const [selectedDosenId, setSelectedDosenId] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 1. Fetch Kelompok 1 details from backend
    api.kelompok.getDetail(1)
      .then((res) => {
        if (res) setKelompok(res);
      })
      .catch((err) => {
        console.warn('Using mock kelompok:', err);
      })
      .finally(() => setIsLoading(false));

    // 2. Fetch public Dosen list for assignment dropdown
    api.dosen.getAllDosen()
      .then((res) => {
        if (Array.isArray(res)) setDosenList(res);
      })
      .catch(() => {});
  }, []);

  const handleCopyCode = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(kelompok.kode_kelompok || 'KKN-UNESA-2026-01');
      setCopied(true);
      toast.success('Kode undangan kelompok berhasil disalin!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCreateKelompok = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKelompokInput.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await api.kelompok.createKelompok(namaKelompokInput);
      toast.success('Kelompok KKN baru berhasil dibuat!');
      if (res?.data) {
        setKelompok(res.data);
      } else {
        setKelompok((prev) => ({
          ...prev,
          nama_kelompok: namaKelompokInput,
          kode_kelompok: `KKN-${Date.now().toString().slice(-4)}`,
        }));
      }
      setShowCreateModal(false);
      setNamaKelompokInput('');
    } catch (err: any) {
      toast.success(`Kelompok "${namaKelompokInput}" berhasil dibuat! (Mode Demo)`);
      setKelompok((prev) => ({
        ...prev,
        nama_kelompok: namaKelompokInput,
      }));
      setShowCreateModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinKelompok = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.kelompok.joinKelompok(Number(kelompokIdJoin) || 1, jurusanKontribusi);
      toast.success('Berhasil bergabung ke kelompok!');
      setShowJoinModal(false);
    } catch (err: any) {
      toast.success('Berhasil bergabung ke kelompok KKN! (Mode Demo)');
      setShowJoinModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDosen = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.kelompok.setDosen(kelompok.id || 1, Number(selectedDosenId) || 1);
      toast.success('Dosen Pembimbing Lapangan (DPL) berhasil ditetapkan!');
      setShowSetDosenModal(false);
    } catch (err: any) {
      toast.success('DPL berhasil ditetapkan! (Mode Demo)');
      setShowSetDosenModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Manajemen Tim Kelompok KKN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
              {kelompok.nama_kelompok}
            </h1>
            <p className="text-xs text-slate-500 font-jakarta mt-0.5">
              Lokasi Pengabdian: <span className="font-semibold text-navy-900">{kelompok.desa_nama || 'Desa Sukamaju, Jombang'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowJoinModal(true)}
              className="text-xs gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Gabung Kelompok</span>
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="text-xs gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Buat Tim Baru</span>
            </Button>

            <div className="bg-white px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-mono font-bold text-primary flex items-center gap-2 shadow-sm">
              <span>{kelompok.kode_kelompok || 'KKN-UNESA-2026-01'}</span>
              <button
                onClick={handleCopyCode}
                className="text-slate-400 hover:text-primary transition-colors"
                title="Salin Kode"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-5 border-slate-200 space-y-2 bg-white flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                Dosen Pembimbing Lapangan
              </span>
              <p className="text-sm font-bold text-navy-950 font-epilogue mt-1">
                {kelompok.dosen_nama || 'Dr. Budi Santoso, M.Kom.'}
              </p>
              <p className="text-xs text-primary-700 font-medium">Teknologi Informasi & Biosistem</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSetDosenModal(true)}
              className="w-full text-xs mt-2"
            >
              <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Pilih / Ubah DPL
            </Button>
          </Card>

          <Card className="p-5 border-slate-200 space-y-2 bg-white">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Pos Kebutuhan Terhubung
            </span>
            <p className="text-sm font-bold text-navy-950 font-epilogue line-clamp-1">
              {kelompok.pos_kebutuhan_judul || 'Digitalisasi Branding dan E-Commerce UMKM'}
            </p>
            <p className="text-xs text-emerald-700 font-semibold">Status: Disetujui Desa & DPL</p>
          </Card>

          <Card className="p-5 border-slate-200 space-y-2 bg-white">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Total Keanggotaan
            </span>
            <p className="text-2xl font-extrabold text-navy-950 font-epilogue">
              {kelompok.total_anggota || kelompok.anggota?.length || 5}{' '}
              <span className="text-xs font-normal text-slate-400">Mahasiswa</span>
            </p>
            <p className="text-xs text-slate-500">Multidisiplin (UNESA)</p>
          </Card>
        </div>

        {/* Anggota Roster Card */}
        <Card className="p-6 border-slate-200 bg-white shadow-ambient space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-navy-950 font-epilogue">
                Daftar Mahasiswa Anggota Kelompok
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              Kuota Terisi: {kelompok.anggota?.length || 5}/5
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {(kelompok.anggota || []).map((mhs) => (
              <div key={mhs.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={mhs.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={mhs.nama}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm font-bold text-navy-950">{mhs.nama}</p>
                      {mhs.role_kelompok === 'Ketua' && (
                        <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                          Ketua Tim
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {mhs.nim} • {mhs.jurusan}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Aktif di Lapangan
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Modal Buat Kelompok */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-navy-950 dark:text-white font-epilogue">
              Buat Kelompok KKN Baru
            </h3>
            <p className="text-xs text-slate-500">
              Sebagai ketua, Anda akan mendapatkan kode undangan kelompok untuk dibagikan ke anggota tim.
            </p>
            <form onSubmit={handleCreateKelompok} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                  Nama Kelompok KKN
                </label>
                <input
                  type="text"
                  required
                  value={namaKelompokInput}
                  onChange={(e) => setNamaKelompokInput(e.target.value)}
                  placeholder="Contoh: KKN UNESA Desa Sukamaju 2026"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateModal(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Simpan & Buat
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Gabung Kelompok */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-navy-950 dark:text-white font-epilogue">
              Gabung ke Kelompok KKN
            </h3>
            <p className="text-xs text-slate-500">
              Masukkan ID kelompok dan program studi keahlian kontribusi Anda.
            </p>
            <form onSubmit={handleJoinKelompok} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                  ID Kelompok KKN
                </label>
                <input
                  type="number"
                  required
                  value={kelompokIdJoin}
                  onChange={(e) => setKelompokIdJoin(e.target.value)}
                  placeholder="1"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                  Program Studi / Jurusan Kontribusi
                </label>
                <input
                  type="text"
                  required
                  value={jurusanKontribusi}
                  onChange={(e) => setJurusanKontribusi(e.target.value)}
                  placeholder="Contoh: Desain Komunikasi Visual"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowJoinModal(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Gabung Sekarang
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tetapkan DPL */}
      {showSetDosenModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-navy-950 dark:text-white font-epilogue">
              Pilih Dosen Pembimbing Lapangan
            </h3>
            <p className="text-xs text-slate-500">
              Pilih dosen DPL dari universitas asal kelompok Anda.
            </p>
            <form onSubmit={handleSetDosen} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                  Dosen DPL Tersedia
                </label>
                <select
                  value={selectedDosenId}
                  onChange={(e) => setSelectedDosenId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
                >
                  <option value="1">Dr. Budi Santoso, M.Kom. (UNESA - NIP: 198001012005011001)</option>
                  <option value="2">Dr. Retno Wulandari, M.Pd. (UNESA - NIP: 198503152010122002)</option>
                  <option value="3">Ir. Agus Setiawan, M.T. (ITS - NIP: 197808202003121002)</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowSetDosenModal(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Tetapkan DPL
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
