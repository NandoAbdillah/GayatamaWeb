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
import apiClient from '@/lib/api-client';

export default function VerifikasiLuaranDesaPage() {
  const [luaranList, setLuaranList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLuaran, setSelectedLuaran] = useState<any>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [ringkasanDampak, setRingkasanDampak] = useState('');
  const [testimoniDesa, setTestimoniDesa] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLuaran = async () => {
    try {
      setLoading(true);
      const res = await api.luaran.getByDesa();
      if (Array.isArray(res)) {
        const normalized = res.map((r: any) => ({
          id: r.id,
          kelompok: r.proposal?.kelompok?.nama_kelompok || (r.kelompok?.nama_kelompok) || `Kelompok #${r.proposal?.kelompok_id || r.kelompok_id || r.id}`,
          ketua: r.proposal?.kelompok?.ketua?.name || r.kelompok?.ketua?.name || 'Ketua Mahasiswa',
          judul: r.judul || r.proposal?.pos_kebutuhan?.judul || 'Luaran Program KKN',
          kategori: r.kategori || r.proposal?.pos_kebutuhan?.kategori || 'Teknologi & Digitalisasi',
          deskripsi: r.deskripsi || 'Luaran hasil program pengabdian kelompok mahasiswa.',
          foto_url: r.foto_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
          file_url: r.file_deliverable_url || '#',
          status: r.status_verifikasi || r.status || 'menunggu',
          tanggal_submit: r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : 'Baru saja',
          dpl: r.proposal?.kelompok?.dosen?.name || 'DPL KKN',
          slug_public: r.portofolio?.slug_public,
          sertifikat_pdf_url: r.portofolio?.sertifikat_pdf_url,
        }));
        setLuaranList(normalized);
      } else {
        setLuaranList([]);
      }
    } catch (err) {
      console.error('Gagal mengambil data luaran desa:', err);
      toast.error('Gagal memuat luaran dari server.');
      setLuaranList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLuaran();
  }, []);

  const openVerifyModal = (item: any) => {
    setSelectedLuaran(item);
    setRingkasanDampak(item.deskripsi ? `Program ${item.judul} berhasil diimplementasikan di desa dan memberikan manfaat nyata bagi warga.` : '');
    setTestimoniDesa('Hasil pengabdian mahasiswa sangat solutif, nyata dirasakan manfaatnya oleh warga, dan diselesaikan dengan dedikasi tinggi.');
    setShowVerifyModal(true);
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLuaran) return;
    if (!ringkasanDampak.trim() || !testimoniDesa.trim()) {
      toast.error('Harap lengkapi ringkasan dampak dan testimoni desa');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.luaran.verifyByDesa(selectedLuaran.id, {
        ringkasan_dampak: ringkasanDampak.trim(),
        testimoni_desa: testimoniDesa.trim(),
      });
      toast.success('Luaran KKN berhasil diverifikasi & disahkan! E-Portofolio publik dan sertifikat resmi telah diterbitkan.');
      setShowVerifyModal(false);
      await fetchLuaran();
    } catch (err: any) {
      console.error('Gagal memverifikasi luaran:', err);
      const errMsg = err?.response?.data?.message || 'Gagal memverifikasi luaran di server.';
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadDeliverable = async (item: any) => {
    try {
      const response = await apiClient.get(`/api/luaran/${item.id}/file`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Luaran_${item.kelompok.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Mengunduh berkas deliverable luaran...');
    } catch (err: any) {
      console.error('Gagal mengunduh berkas luaran:', err);
      toast.error('Berkas deliverable belum tersedia di penyimpanan server.');
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
            {luaranList.filter((l) => l.status === 'verified').length} Telah Disahkan Resmi
          </span>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-sm">Memuat daftar luaran akhir kelompok KKN...</p>
          </div>
        ) : luaranList.length === 0 ? (
          <Card className="p-12 text-center bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-navy-950 dark:text-white">Belum Ada Luaran KKN Masuk</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Kelompok mahasiswa yang bertugas di desa Anda belum mengunggah luaran akhir pengabdian untuk diverifikasi.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {luaranList.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm flex flex-col"
              >
                {/* Image Cover */}
                <div className="relative h-44 w-full bg-slate-100 dark:bg-navy-950">
                  <img
                    src={item.foto_url}
                    alt={item.judul}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 dark:bg-navy-900/90 text-navy-900 dark:text-white backdrop-blur-md shadow-sm">
                      {item.kategori}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <StatusBadge
                      status={item.status === 'verified' ? 'approved' : 'submitted'}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-primary dark:text-primary-300 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {item.kelompok}
                    </span>
                    <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue leading-snug">
                      {item.judul}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                      {item.deskripsi}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="pt-3 border-t border-slate-100 dark:border-navy-800 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Ketua:</span>
                      <span className="font-semibold text-navy-900 dark:text-slate-200">{item.ketua}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>DPL:</span>
                      <span className="font-semibold text-navy-900 dark:text-slate-200">{item.dpl}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tanggal:</span>
                      <span>{item.tanggal_submit}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadDeliverable(item)}
                      className="text-xs flex-1 gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Berkas</span>
                    </Button>

                    {item.status !== 'verified' ? (
                      <Button
                        variant="emerald"
                        size="sm"
                        onClick={() => openVerifyModal(item)}
                        className="text-xs flex-1 gap-1 shadow-glow-secondary"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Sahkan</span>
                      </Button>
                    ) : (
                      item.slug_public ? (
                        <a
                          href={`/portofolio/${item.slug_public}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1"
                        >
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs w-full gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Portofolio</span>
                          </Button>
                        </a>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 text-center flex-1">
                          Disahkan Resmi
                        </span>
                      )
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Pengesahan & Penerbitan Sertifikat */}
        {showVerifyModal && selectedLuaran && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl max-w-lg w-full p-6 shadow-ambient-xl space-y-4 font-jakarta">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                      Sahkan Luaran KKN & Terbitkan E-Sertifikat
                    </h3>
                    <p className="text-xs text-slate-500">{selectedLuaran.judul}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVerifyModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleApprove} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy-950 dark:text-white">
                    Ringkasan Dampak Nyata bagi Warga / Desa:
                  </label>
                  <textarea
                    rows={3}
                    value={ringkasanDampak}
                    onChange={(e) => setRingkasanDampak(e.target.value)}
                    placeholder="Jelaskan dampak nyata program, peningkatan produktivitas, atau efisiensi pelayanan warga..."
                    className="w-full p-3 bg-surface-subtle dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl text-xs text-navy-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-navy-950 dark:text-white">
                    Ulasan & Testimoni Resmi Perangkat Desa:
                  </label>
                  <textarea
                    rows={3}
                    value={testimoniDesa}
                    onChange={(e) => setTestimoniDesa(e.target.value)}
                    placeholder="Tuliskan testimoni apresiasi atau evaluasi kinerja mahasiswa KKN..."
                    className="w-full p-3 bg-surface-subtle dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-2xl text-xs text-navy-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
                    required
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  Pengesahan ini akan secara otomatis:
                  <ul className="list-disc list-inside mt-1 space-y-0.5 font-medium">
                    <li>Menerbitkan halaman Portofolio Publik berstandar nasional (Verified by Village).</li>
                    <li>Menerbitkan E-Sertifikat Digital ber-QR Code dengan verifikasi keabsahan online.</li>
                    <li>Mengirimkan notifikasi resmi via WhatsApp ke Ketua Kelompok & DPL.</li>
                  </ul>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVerifyModal(false)}
                    className="text-xs"
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="emerald"
                    size="sm"
                    className="text-xs gap-1.5 shadow-glow-secondary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Sahkan & Terbitkan Sertifikat</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
