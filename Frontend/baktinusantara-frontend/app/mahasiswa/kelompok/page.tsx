'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/services';
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
  Inbox,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MahasiswaKelompokPage() {
  const [kelompok, setKelompok] = useState<Kelompok | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showSetDosenModal, setShowSetDosenModal] = useState(false);

  // Form states
  const [namaKelompokInput, setNamaKelompokInput] = useState('');
  const [kelompokIdJoin, setKelompokIdJoin] = useState('');
  const [jurusanKontribusi, setJurusanKontribusi] = useState('');
  const [dosenList, setDosenList] = useState<any[]>([]);
  const [selectedDosenId, setSelectedDosenId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchKelompokData = async () => {
    try {
      setIsLoading(true);
      // Try to find kelompok from my submitted proposals first
      const myProposals = await api.proposal.getMyProposals();
      const propList = Array.isArray(myProposals) ? myProposals : [];
      let foundKelompokId: number | null = null;

      if (propList.length > 0 && propList[0].kelompok_id) {
        foundKelompokId = propList[0].kelompok_id;
      }

      if (foundKelompokId) {
        const detail = await api.kelompok.getDetail(foundKelompokId);
        if (detail) setKelompok(detail);
      } else {
        setKelompok(null);
      }
    } catch (err) {
      console.error('Error memuat kelompok mahasiswa:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKelompokData();

    // Fetch public Dosen list for assignment dropdown
    api.dosen.getAllDosen()
      .then((res) => {
        if (Array.isArray(res)) {
          setDosenList(res);
          if (res.length > 0) {
            setSelectedDosenId(String(res[0].id));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyCode = () => {
    if (typeof window !== 'undefined' && kelompok) {
      const code = kelompok.kode_kelompok || `KKN-TEAM-${kelompok.id}`;
      navigator.clipboard.writeText(code);
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
        await fetchKelompokData();
      }
      setShowCreateModal(false);
      setNamaKelompokInput('');
    } catch (err: any) {
      console.error('Gagal membuat kelompok:', err);
      toast.error(err.response?.data?.message || 'Gagal membuat kelompok KKN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinKelompok = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kelompokIdJoin.trim()) {
      toast.error('Masukkan ID kelompok yang valid');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.kelompok.joinKelompok(Number(kelompokIdJoin), jurusanKontribusi || 'Umum');
      toast.success('Berhasil bergabung ke kelompok!');
      setShowJoinModal(false);
      await fetchKelompokData();
    } catch (err: any) {
      console.error('Gagal bergabung:', err);
      toast.error(err.response?.data?.message || 'Gagal bergabung ke kelompok KKN.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetDosen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kelompok?.id || !selectedDosenId) {
      toast.error('Pilih dosen pembimbing terlebih dahulu');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.kelompok.setDosen(kelompok.id, Number(selectedDosenId));
      toast.success('Dosen Pembimbing Lapangan (DPL) berhasil ditetapkan!');
      setShowSetDosenModal(false);
      await fetchKelompokData();
    } catch (err: any) {
      console.error('Gagal menetapkan DPL:', err);
      toast.error(err.response?.data?.message || 'Gagal menetapkan DPL.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Manajemen Tim Kelompok KKN">
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Memuat status keanggotaan kelompok...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manajemen Tim Kelompok KKN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              {kelompok ? kelompok.nama_kelompok : 'Keanggotaan Kelompok KKN'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-jakarta mt-0.5">
              Lokasi Pengabdian:{' '}
              <span className="font-semibold text-navy-900 dark:text-slate-200">
                {kelompok?.desa_nama || (kelompok as any)?.proposal?.[0]?.posKebutuhan?.desa?.nama_desa || 'Menunggu penempatan proposal'}
              </span>
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

            {kelompok && (
              <div className="bg-white dark:bg-navy-900 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-navy-800 text-xs font-mono font-bold text-primary dark:text-primary-400 flex items-center gap-2 shadow-sm">
                <span>{kelompok.kode_kelompok || `TEAM-${kelompok.id}`}</span>
                <button
                  onClick={handleCopyCode}
                  className="text-slate-400 hover:text-primary dark:hover:text-primary-300 transition-colors"
                  title="Salin Kode"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {!kelompok ? (
          <Card className="p-12 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-navy-800 text-primary flex items-center justify-center mx-auto">
              <Users className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                Anda Belum Terdaftar dalam Kelompok KKN
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Anda dapat membuat kelompok baru sebagai ketua dan mengundang rekan mahasiswa lainnya, atau bergabung ke kelompok yang sudah ada menggunakan ID kelompok.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button size="sm" variant="primary" onClick={() => setShowCreateModal(true)}>
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Buat Kelompok Baru
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowJoinModal(true)}>
                <LogIn className="w-4 h-4 mr-1.5" />
                Gabung ke Kelompok
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900 flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Dosen Pembimbing Lapangan
                  </span>
                  <p className="text-sm font-bold text-navy-950 dark:text-white font-epilogue mt-1">
                    {kelompok.dosen?.user?.name || kelompok.dosen_nama || 'Belum Ditetapkan'}
                  </p>
                  <p className="text-xs text-primary-700 dark:text-primary-400 font-medium">
                    {kelompok.dosen?.nip ? `NIP: ${kelompok.dosen.nip}` : 'Menunggu pemilihan DPL'}
                  </p>
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

              <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Status Kelompok
                </span>
                <p className="text-sm font-bold text-navy-950 dark:text-white font-epilogue line-clamp-1">
                  {kelompok.status === 'aktif' ? 'Kelompok Aktif' : 'Persiapan Penugasan'}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                  Ketua: {kelompok.ketua?.name || 'Ketua Kelompok'}
                </p>
              </Card>

              <Card className="p-5 border-slate-200 dark:border-navy-800 space-y-2 bg-white dark:bg-navy-900">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  Total Keanggotaan
                </span>
                <p className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                  {(kelompok.anggota?.length || 0) + (kelompok.ketua ? 1 : 0)}{' '}
                  <span className="text-xs font-normal text-slate-400">Mahasiswa</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {kelompok.anggota?.length || 0} Anggota + 1 Ketua Tim
                </p>
              </Card>
            </div>

            {/* Anggota Roster Card */}
            <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-ambient space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                    Daftar Mahasiswa Anggota Kelompok
                  </h2>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Total: {(kelompok.anggota?.length || 0) + (kelompok.ketua ? 1 : 0)} Mahasiswa
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-navy-800">
                {/* Ketua Tim */}
                {kelompok.ketua && (
                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950/70 border border-primary-300 dark:border-primary-800 flex items-center justify-center font-bold text-primary">
                        {kelompok.ketua.name ? kelompok.ketua.name.charAt(0) : 'K'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-navy-950 dark:text-white">
                            {kelompok.ketua.name}
                          </p>
                          <span className="text-[10px] font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/70 px-2 py-0.5 rounded-full border border-primary-200 dark:border-primary-800">
                            Ketua Tim
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {kelompok.ketua.email || 'Ketua Kelompok KKN'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        Aktif
                      </span>
                    </div>
                  </div>
                )}

                {/* Anggota Lain */}
                {(kelompok.anggota || []).map((mhs: any, idx: number) => {
                  const mhsUser = mhs.user || mhs;
                  return (
                    <div key={mhs.id || idx} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-navy-800 border border-slate-200 dark:border-navy-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                          {mhsUser.name ? mhsUser.name.charAt(0) : 'M'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs sm:text-sm font-bold text-navy-950 dark:text-white">
                              {mhsUser.name || `Anggota ${idx + 1}`}
                            </p>
                            <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-navy-800 px-2 py-0.5 rounded-full">
                              {mhs.jurusan_kontribusi || 'Anggota'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {mhsUser.email || mhs.jurusan_kontribusi || 'Mahasiswa Anggota'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                          Aktif
                        </span>
                      </div>
                    </div>
                  );
                })}

                {(!kelompok.anggota || kelompok.anggota.length === 0) && !kelompok.ketua && (
                  <div className="py-8 text-center text-xs text-slate-400">
                    Belum ada anggota yang bergabung dalam kelompok ini.
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Modal Buat Kelompok */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-navy-800">
            <h3 className="text-lg font-bold text-navy-950 dark:text-white font-epilogue">
              Buat Kelompok KKN Baru
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sebagai ketua, Anda akan membuat kelompok baru untuk mendaftarkan program kerja dan anggota tim Anda.
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
                  placeholder="Contoh: KKN Kelompok 14 - Bina Desa"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
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
          <div className="bg-white dark:bg-navy-900 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-navy-800">
            <h3 className="text-lg font-bold text-navy-950 dark:text-white font-epilogue">
              Gabung ke Kelompok KKN
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
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
                  placeholder="Contoh: 1"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
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
                  placeholder="Contoh: Teknik Informatika / Manajemen"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
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
          <div className="bg-white dark:bg-navy-900 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-navy-800">
            <h3 className="text-lg font-bold text-navy-950 dark:text-white font-epilogue">
              Pilih Dosen Pembimbing Lapangan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih dosen DPL dari universitas untuk membimbing kelompok pengabdian Anda.
            </p>
            <form onSubmit={handleSetDosen} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                  Dosen DPL Tersedia
                </label>
                {dosenList.length === 0 ? (
                  <p className="text-xs text-slate-400 p-2 border border-dashed rounded-xl">
                    Belum ada data DPL yang terdaftar di sistem.
                  </p>
                ) : (
                  <select
                    value={selectedDosenId}
                    onChange={(e) => setSelectedDosenId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
                  >
                    {dosenList.map((d: any) => (
                      <option key={d.id} value={d.id} className="dark:bg-navy-900">
                        {d.name || d.nama} {d.nip ? `(NIP: ${d.nip})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowSetDosenModal(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting || dosenList.length === 0}>
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
