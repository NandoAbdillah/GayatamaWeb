'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  BookOpen,
  HelpCircle,
  FileText,
  ShieldCheck,
  Camera,
  Users,
  Building,
  GraduationCap,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface DocItem {
  id: string;
  role: 'all' | 'mahasiswa' | 'desa' | 'dosen' | 'admin';
  title: string;
  category: string;
  summary: string;
  content: string;
  pdfUrl?: string;
}

const DOC_DATA: DocItem[] = [
  {
    id: 'sop-01',
    role: 'mahasiswa',
    title: 'SOP Pengajuan Proposal & Algoritma Smart-Matching',
    category: 'Panduan Mahasiswa',
    summary: 'Tata cara pemilihan pos kebutuhan desa dan optimasi skor kesesuaian keahlian.',
    content: `1. Mahasiswa login ke portal dan membuka menu "Pos Kebutuhan".
2. Sistem akan menghitung persentase kecocokan (Matching Score) berdasarkan rumpun ilmu prodi, tag keahlian di profil, dan jarak radius desa.
3. Kelompok menyusun draft rencana kerja (proker), anggaran, dan mengunggah dokumen proposal resmi berformat PDF.
4. Proposal otomatis diteruskan ke Dosen DPL untuk telaah kelayakan administratif sebelum disahkan oleh Kepala Desa.`,
    pdfUrl: '#',
  },
  {
    id: 'sop-02',
    role: 'mahasiswa',
    title: 'Prosedur Wajib Surat Izin Orang Tua Radius >50 km',
    category: 'Keselamatan & Regulasi',
    summary: 'Ketentuan khusus penugasan KKN di luar radius 50 km dari domisili/kampus.',
    content: `1. Jika koordinat desa penugasan melebihi 50 km (dihitung menggunakan rumus Haversine geospasial), sistem akan mengunci proses keberangkatan sampai surat izin diunggah.
2. Unduh template surat resmi dari menu "Surat Izin Orang Tua".
3. Cetak, mintakan tanda tangan basah orang tua/wali bermaterai Rp 10.000.
4. Unggah hasil scan dokumen (JPG/PDF) untuk diverifikasi oleh admin LPPM.`,
    pdfUrl: '#',
  },
  {
    id: 'sop-03',
    role: 'all',
    title: 'Pedoman Etika Dokumentasi, Foto, & Video KKN',
    category: 'Etika & Privasi Data',
    summary: 'Aturan informed consent, perlindungan privasi anak, dan kehormatan warga desa binaan.',
    content: `1. Informed Consent: Wajib meminta izin lisan/tertulis dari warga sebelum mengambil foto kegiatan di dalam rumah atau lingkungan sensitif.
2. Perlindungan Anak: Foto anak-anak di bawah umur pada kegiatan bimbel/posyandu tidak boleh menampilkan identitas lengkap atau kondisi medis tanpa izin orang tua.
3. Martabat Desa: Dilarang mengunggah konten yang mengeksploitasi kemiskinan atau merendahkan adat istiadat setempat demi sensasionalisme media sosial.`,
    pdfUrl: '#',
  },
  {
    id: 'sop-04',
    role: 'desa',
    title: 'Panduan Verifikasi Luaran & Penerbitan Surat Tugas KKN',
    category: 'Pemerintahan Desa',
    summary: 'Langkah verifikasi hasil kerja mahasiswa dan penerbitan sertifikat resmi desa.',
    content: `1. Perangkat desa meninjau luaran akhir (artikel, modul, produk inovasi) di menu "Verifikasi Luaran".
2. Berikan catatan jika luaran memerlukan penyempurnaan sebelum dipublikasikan ke E-Portofolio.
3. Buka menu "Surat Tugas KKN" untuk meng-generate dokumen tugas berkop desa dengan stempel digital dan QR verification.`,
    pdfUrl: '#',
  },
  {
    id: 'sop-05',
    role: 'dosen',
    title: 'Standar Operasional Penilaian & Pengesahan BAST KKN',
    category: 'Akademik DPL',
    summary: 'Format penilaian kinerja mahasiswa di lapangan, logbook mingguan, dan konversi SKS.',
    content: `1. Dosen memverifikasi logbook harian mahasiswa secara berkala setiap pekan.
2. Melaksanakan kunjungan supervisi monev minimal 2 kali selama periode KKN.
3. Mengunggah Berita Acara Supervisi dan memberikan rekapitulasi nilai akhir berbasis rubrik kompetensi LPPM.`,
    pdfUrl: '#',
  },
];

export default function AdminDocumentationPage() {
  const [selectedRole, setSelectedRole] = useState<'all' | 'mahasiswa' | 'desa' | 'dosen' | 'admin'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('sop-01');

  const filteredDocs = DOC_DATA.filter((doc) => {
    const matchRole = selectedRole === 'all' || doc.role === selectedRole || doc.role === 'all';
    const matchSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <DashboardLayout title="Pusat Dokumentasi Terbuka & SOP KKN">
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-black text-navy-950 dark:text-white font-epilogue">
            Pusat Dokumentasi Terbuka, SOP, & Panduan Etika
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Repositori resmi pedoman operasional baku, regulasi etika media, dan panduan teknis seluruh pemangku kepentingan KKN.
          </p>
        </div>

        {/* Search & Filter Header */}
        <Card className="p-4 border-slate-200 dark:border-navy-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-navy-900">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari SOP, regulasi, atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'all', label: 'Semua SOP' },
              { id: 'mahasiswa', label: 'Mahasiswa' },
              { id: 'desa', label: 'Perangkat Desa' },
              { id: 'dosen', label: 'Dosen DPL' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedRole(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedRole === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Card>

        {/* List SOP Cards (Accordion) */}
        <div className="space-y-4">
          {filteredDocs.map((doc) => {
            const isExpanded = expandedId === doc.id;

            return (
              <Card
                key={doc.id}
                className="border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                  className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-navy-800/40 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 flex items-center justify-center text-primary shrink-0 mt-0.5">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
                          {doc.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {doc.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-slate-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/30 space-y-4">
                    <div className="p-4 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                      {doc.content}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400">Terakhir diperbarui: Revisi LPPM 2025/2026</span>
                      <Button
                        onClick={() => toast.success(`Mengunduh dokumen PDF resmi: ${doc.title}`)}
                        variant="outline"
                        size="sm"
                        className="gap-1.5 font-bold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Dokumen PDF Lengkap</span>
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
