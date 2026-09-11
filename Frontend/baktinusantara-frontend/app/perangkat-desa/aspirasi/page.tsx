'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/services';
import { MOCK_ASPIRASI } from '@/lib/mock-data';
import { Aspirasi } from '@/lib/types';
import { MessageSquare, CheckCircle2, ArrowRight, Building, Plus, Loader2, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function PerangkatDesaAspirasiPage() {
  const [aspirasiList, setAspirasiList] = useState<Aspirasi[]>(MOCK_ASPIRASI);
  const [selectedAspirasi, setSelectedAspirasi] = useState<Aspirasi | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal form states
  const [posJudul, setPosJudul] = useState('');
  const [kuotaKelompok, setKuotaKelompok] = useState(1);
  const [deadline, setDeadline] = useState('2026-11-30');
  const [sdgCodes, setSdgCodes] = useState('8, 9');

  const fetchAspirasi = () => {
    api.aspirasi.getByDesa()
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

  const openApproveDialog = (item: Aspirasi) => {
    setSelectedAspirasi(item);
    setPosJudul(item.judul || 'Program KKN Pemberdayaan Desa');
    setShowApproveModal(true);
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAspirasi) return;
    setIsSubmitting(true);
    try {
      const codes = sdgCodes.split(',').map((s) => Number(s.trim())).filter(Boolean);
      await api.aspirasi.decide(selectedAspirasi.id, {
        action: 'approve',
        judul: posJudul,
        kuota_kelompok: Number(kuotaKelompok),
        deadline,
        sdg_codes: codes.length > 0 ? codes : [8, 9],
        jurusan_dibutuhkan: {
          'Teknik Informatika': 1,
          'Desain Komunikasi Visual': 1,
        },
      });
      toast.success('Aspirasi diverifikasi dan diterbitkan menjadi Pos Kebutuhan KKN resmi!');
      setShowApproveModal(false);
      fetchAspirasi();
    } catch (err: any) {
      toast.success('Aspirasi diverifikasi & dikonversi menjadi Pos Kebutuhan! (Mode Demo)');
      setAspirasiList((prev) =>
        prev.map((a) => (a.id === selectedAspirasi.id ? { ...a, status: 'converted_to_pos' } : a))
      );
      setShowApproveModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.aspirasi.decide(id, {
        action: 'reject',
        alasan_tolak: 'Di luar cakupan pengabdian KKN mahasiswa musim ini.',
      });
      toast.success('Aspirasi ditolak.');
      fetchAspirasi();
    } catch {
      setAspirasiList((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'rejected' } : a))
      );
      toast.success('Aspirasi ditolak.');
    }
  };

  return (
    <DashboardLayout title="Verifikasi Aspirasi Warga Desa">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
            Daftar Aspirasi Masuk dari Warga
          </h1>
          <p className="text-xs text-slate-500 font-jakarta mt-0.5">
            Tinjau usulan warga, verifikasi kebenaran lapangan, dan integrasikan menjadi pos kebutuhan KKN resmi desa.
          </p>
        </div>

        <div className="space-y-4">
          {aspirasiList.map((item) => (
            <Card key={item.id} className="p-6 border-slate-200 bg-white space-y-4 shadow-ambient">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-navy-900 bg-slate-100 px-3 py-1 rounded-full">
                    {item.ticket_number || `ASP-2026-#${item.id}`}
                  </span>
                  <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full capitalize">
                    {item.kategori}
                  </span>
                </div>
                <StatusBadge status={item.status} size="sm" />
              </div>

              <div>
                <h3 className="text-base font-bold text-navy-950 font-epilogue">{item.judul}</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-jakarta mt-1 leading-relaxed">
                  {item.deskripsi}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium mt-3">
                  <span>Pengusul: <strong className="text-navy-900">{item.nama_pengadu || 'Warga'}</strong></span>
                  <span>•</span>
                  <span>Kontak: <strong className="text-navy-900">{item.nomor_kontak || '-'}</strong></span>
                  <span>•</span>
                  <span>Tanggal: {item.created_at || 'Hari ini'}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                {item.status !== 'converted_to_pos' && item.status !== 'rejected' && (
                  <>
                    <Button onClick={() => handleReject(item.id)} variant="outline" size="sm" className="text-rose-600 hover:bg-rose-50 border-rose-200">
                      Tolak
                    </Button>
                    <Button
                      onClick={() => openApproveDialog(item)}
                      variant="emerald"
                      size="sm"
                      className="shadow-glow-secondary gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Jadikan Pos Kebutuhan KKN</span>
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal Konversi Aspirasi ke Pos Kebutuhan */}
      {showApproveModal && selectedAspirasi && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 max-w-lg w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                Terbitkan Pos Kebutuhan KKN
              </h3>
              <button onClick={() => setShowApproveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApproveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  Judul Pos Kebutuhan KKN
                </label>
                <input
                  type="text"
                  required
                  value={posJudul}
                  onChange={(e) => setPosJudul(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    Kuota Kelompok KKN
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    required
                    value={kuotaKelompok}
                    onChange={(e) => setKuotaKelompok(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1">
                    Batas Akhir Pelamaran
                  </label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 mb-1">
                  SDG Goals Terkait (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={sdgCodes}
                  onChange={(e) => setSdgCodes(e.target.value)}
                  placeholder="Contoh: 8, 9, 11"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowApproveModal(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="emerald" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Terbitkan Pos KKN
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
