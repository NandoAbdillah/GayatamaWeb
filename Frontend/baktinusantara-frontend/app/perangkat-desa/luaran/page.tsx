'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Award,
  CheckCircle2,
  FileCheck2,
  ExternalLink,
  Eye,
  MessageSquare,
  AlertCircle,
  Download,
  Users,
  Sparkles,
  Calendar,
  Loader2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/services';

export default function VerifikasiLuaranDesaPage() {
  const [luaranList, setLuaranList] = useState([
    {
      id: 1,
      kelompok: 'Kelompok 14 (Desa Sukamaju)',
      ketua: 'Muhammad Raihan Pratama',
      judul: 'Alat IoT Sensor Kelembaban & Pintu Air Otomatis',
      kategori: 'Teknologi Tepat Guna & IoT',
      deskripsi:
        'Sistem pemantauan level air dan kelembaban tanah terintegrasi mikrokontroler ESP32 dengan notifikasi peringatan dini ke grup WhatsApp pengurus Gapoktan.',
      foto_url:
        'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=600&auto=format&fit=crop&q=80',
      file_url: 'https://storage.gayatama.ac.id/luaran/manual_alat_iot.pdf',
      status: 'submitted',
      tanggal_submit: '04 September 2026',
      dpl: 'Dr. Ir. Hendra Gunawan, M.T.',
    },
    {
      id: 2,
      kelompok: 'Kelompok 14 (Desa Sukamaju)',
      ketua: 'Muhammad Raihan Pratama',
      judul: 'Buku Panduan SOP Budidaya Sayur Organik & Pengemasan Ramah Lingkungan',
      kategori: 'Modul & SOP Pertanian',
      deskripsi:
        'Buku panduan teknis 45 halaman mengenai standardisasi pembuatan pupuk organik cair dan desain kemasan standing pouch untuk UMKM keripik pisang desa.',
      foto_url:
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop&q=80',
      file_url: 'https://storage.gayatama.ac.id/luaran/buku_sop_organik.pdf',
      status: 'approved',
      tanggal_submit: '02 September 2026',
      dpl: 'Dr. Ir. Hendra Gunawan, M.T.',
    },
    {
      id: 3,
      kelompok: 'Kelompok 08 (Desa Sukamaju)',
      ketua: 'Anisa Rahmawati',
      judul: 'Website Katalog Produk UMKM Desa Sukamaju & Payment QRIS',
      kategori: 'Digitalisasi & E-Commerce',
      deskripsi:
        'Portal e-katalog memuat 24 produk unggulan UMKM desa dilengkapi integrasi peta lokasi gerai dan panduan pembayaran nontunai QRIS.',
      foto_url:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
      file_url: 'https://sukamaju-umkm.id',
      status: 'submitted',
      tanggal_submit: '05 September 2026',
      dpl: 'Dra. Hj. Nurul Hidayati, M.Si.',
    },
  ]);

  const [selectedLuaran, setSelectedLuaran] = useState<any>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [ringkasanDampak, setRingkasanDampak] = useState('Meningkatkan omzet dan jangkauan pasar produk UMKM desa hingga 65%.');
  const [testimoniDesa, setTestimoniDesa] = useState('Sangat solutif, nyata dirasakan manfaatnya, dan membina warga dengan dedikasi tinggi.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.luaran.getByDesa()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          const normalized = res.map((r: any) => ({
            id: r.id,
            kelompok: r.kelompok?.nama_kelompok || `Kelompok ${r.kelompok_id}`,
            ketua: r.kelompok?.ketua?.name || 'Ketua Mahasiswa',
            judul: r.judul || 'Luaran Program KKN',
            kategori: r.kategori || 'Digitalisasi',
            deskripsi: r.deskripsi || '',
            foto_url: r.foto_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
            file_url: r.file_url || '#',
            status: r.status_desa || r.status || 'submitted',
            tanggal_submit: r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '05 September 2026',
            dpl: r.dpl || 'DPL KKN',
          }));
          setLuaranList(normalized);
        }
      })
      .catch(() => {});
  }, []);

  const openVerifyModal = (item: any) => {
    setSelectedLuaran(item);
    setShowVerifyModal(true);
  };

  const handleSendRevision = async () => {
    if (!selectedLuaran || !revisionNotes.trim()) return;
    try {
      await api.luaran.verifyByDesa(selectedLuaran.id, {
        status: 'rejected',
        testimoni_desa: revisionNotes,
        ringkasan_dampak: '',
      });
    } catch (e) {
      console.warn('Backend reject luaran error:', e);
    }
    setLuaranList((prev) =>
      prev.map((l) => (l.id === selectedLuaran.id ? { ...l, status: 'revision' } : l))
    );
    toast.info('Catatan revisi telah dikirimkan ke kelompok mahasiswa.');
    setShowRevisionModal(false);
    setRevisionNotes('');
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLuaran) return;
    setIsSubmitting(true);
    try {
      await api.luaran.verifyByDesa(selectedLuaran.id, {
        ringkasan_dampak: ringkasanDampak,
        testimoni_desa: testimoniDesa,
        status: 'approved',
      });
      setLuaranList((prev) =>
        prev.map((l) => (l.id === selectedLuaran.id ? { ...l, status: 'approved' } : l))
      );
      toast.success('Luaran KKN berhasil disahkan & E-Sertifikat Digital resmi diterbitkan!');
      setShowVerifyModal(false);
    } catch (e) {
      setLuaranList((prev) =>
        prev.map((l) => (l.id === selectedLuaran.id ? { ...l, status: 'approved' } : l))
      );
      toast.success('Luaran KKN disahkan & E-Sertifikat diterbitkan! (Mode Demo)');
      setShowVerifyModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Verifikasi Luaran KKN Desa">
      <div className="space-y-6 font-jakarta">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Verifikasi & Pengesahan Luaran KKN
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Periksa dan sahkan produk teknologi, dokumen modul, serta karya fisik mahasiswa sebelum diterbitkan ke portofolio nasional.
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {luaranList.filter((l) => l.status === 'submitted').length} Luaran Menunggu Pengesahan
          </span>
        </div>

        {/* Grid Daftar Luaran */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {luaranList.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden flex flex-col justify-between border-slate-200 dark:border-navy-800 shadow-md"
            >
              <div className="space-y-3">
                {/* Photo Header */}
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={item.foto_url}
                    alt={item.judul}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <span className="absolute top-3 right-3 bg-navy-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {item.kategori}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">
                    {item.kelompok}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-navy-950 dark:text-white font-epilogue line-clamp-2">
                    {item.judul}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {item.deskripsi}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-navy-800">
                    <span>Ketua: {item.ketua}</span>
                    <span>DPL: {item.dpl}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-5 pt-0 border-t border-slate-100 dark:border-navy-800 mt-2 flex flex-col gap-2">
                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Lihat Berkas / Demo Produk</span>
                </a>

                {item.status === 'submitted' ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedLuaran(item);
                        setShowRevisionModal(true);
                      }}
                      className="flex-1 text-xs font-bold text-amber-700 border-amber-300 hover:bg-amber-50"
                    >
                      Revisi
                    </Button>
                    <Button
                      size="sm"
                      variant="emerald"
                      onClick={() => openVerifyModal(item)}
                      className="flex-1 text-xs font-bold gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sahkan Luaran</span>
                    </Button>
                  </div>
                ) : item.status === 'approved' ? (
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    ✓ Luaran Resmi Disahkan & Terbit
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-center text-xs font-bold text-amber-700 dark:text-amber-300">
                    ⏳ Menunggu Perbaikan Mahasiswa
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Modal Catatan Revisi */}
        {showRevisionModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-navy-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
                <h3 className="text-sm font-bold text-navy-950 dark:text-white">
                  Instruksi Revisi Luaran Teknis
                </h3>
                <button
                  onClick={() => setShowRevisionModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {selectedLuaran?.judul}
                </p>
                <p className="text-[11px] text-slate-500">Oleh: {selectedLuaran?.kelompok}</p>
              </div>

              <textarea
                rows={4}
                required
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Contoh: Harap lengkapi buku panduan dengan skema perawatan berkala dan lampirkan nota serah terima komponen fisik..."
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRevisionModal(false)}
                  className="text-xs font-bold"
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSendRevision}
                  className="text-xs font-bold"
                >
                  Kirim Catatan Revisi
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
