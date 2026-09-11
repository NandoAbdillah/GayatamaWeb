'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  FileText,
  Printer,
  Download,
  ShieldCheck,
  Building,
  CheckCircle2,
  Calendar,
  Users,
  QrCode,
  Stamp,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SuratTugasDesaPage() {
  const [selectedKelompokId, setSelectedKelompokId] = useState('kelompok-14');
  const [isSigned, setIsSigned] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const kelompokList = [
    {
      id: 'kelompok-14',
      nama: 'Kelompok 14 (Smart Agriculture & IoT)',
      ketua: 'Muhammad Raihan Pratama',
      nim: '21051204012',
      jurusan: 'Teknik Informatika & IoT',
      dpl: 'Dr. Ir. Hendra Gunawan, M.T.',
      anggota_count: 5,
      lokasi: 'Dusun 2, Desa Sukamaju',
      nomor_surat: '094/ST-KKN/DS-SKM/IX/2026',
      status: 'approved',
      tanggal_terbit: '01 September 2026',
      masa_berlaku: '01 September 2026 s.d. 15 Oktober 2026 (45 Hari)',
      anggota: [
        { nama: 'Muhammad Raihan Pratama (Ketua)', nim: '21051204012', prodi: 'Teknik Informatika' },
        { nama: 'Siti Sarah Nurhaliza', nim: '21051204044', prodi: 'Agribisnis Pertanian' },
        { nama: 'Budi Santoso', nim: '21051204089', prodi: 'Kesehatan Masyarakat' },
        { nama: 'Dewi Anggraini', nim: '21051204055', prodi: 'Desain Komunikasi Visual' },
        { nama: 'Ahmad Fauzan', nim: '21051204071', prodi: 'Teknik Sipil & Tata Ruang' },
      ],
    },
    {
      id: 'kelompok-08',
      nama: 'Kelompok 08 (Digitalisasi UMKM & E-Commerce)',
      ketua: 'Anisa Rahmawati',
      nim: '21051204102',
      jurusan: 'Manajemen Bisnis',
      dpl: 'Dra. Hj. Nurul Hidayati, M.Si.',
      anggota_count: 5,
      lokasi: 'Dusun 1, Desa Sukamaju',
      nomor_surat: '095/ST-KKN/DS-SKM/IX/2026',
      status: 'approved',
      tanggal_terbit: '02 September 2026',
      masa_berlaku: '01 September 2026 s.d. 15 Oktober 2026 (45 Hari)',
      anggota: [
        { nama: 'Anisa Rahmawati (Ketua)', nim: '21051204102', prodi: 'Manajemen Bisnis' },
        { nama: 'Fajar Kurniawan', nim: '21051204118', prodi: 'Sistem Informasi' },
        { nama: 'Rina Marlina', nim: '21051204125', prodi: 'Akuntansi' },
        { nama: 'Dimas Prasetyo', nim: '21051204130', prodi: 'Ilmu Komunikasi' },
        { nama: 'Nadia Putri', nim: '21051204142', prodi: 'Kriya & Desain Produk' },
      ],
    },
  ];

  const activeKelompok =
    kelompokList.find((k) => k.id === selectedKelompokId) || kelompokList[0];

  return (
    <DashboardLayout title="Penerbitan Surat Tugas KKN Desa">
      <div className="space-y-6 font-jakarta">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Surat Tugas & Legalitas Lapangan Mahasiswa
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Penerbitan dokumen izin operasional resmi ber-kop Pemerintah Desa Sukamaju dengan cap stempel digital.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreviewModal(true)}
              className="text-xs font-bold gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Pratinjau Cetak Surat</span>
            </Button>
            <Button
              variant="emerald"
              size="sm"
              onClick={() => {
                toast.success('Mengunduh dokumen Surat Tugas Resmi Desa Sukamaju (PDF)');
              }}
              className="text-xs font-bold gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Dokumen Resmi</span>
            </Button>
          </div>
        </div>

        {/* Selector Kelompok */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {kelompokList.map((k) => (
            <button
              key={k.id}
              onClick={() => setSelectedKelompokId(k.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedKelompokId === k.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800 hover:bg-slate-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{k.nama}</span>
            </button>
          ))}
        </div>

        {/* Dokumen Surat Tugas Full Display Card */}
        <Card className="p-8 sm:p-12 border-slate-200 dark:border-navy-800 shadow-2xl bg-white dark:bg-navy-900 max-w-4xl mx-auto space-y-8 font-serif">
          {/* Kop Surat Desa */}
          <div className="text-center pb-6 border-b-4 border-double border-navy-950 dark:border-white space-y-1">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold font-sans text-xl">
                DS
              </div>
              <div className="text-left font-sans">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  PEMERINTAH KABUPATEN BOGOR • KECAMATAN CIAWI
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-navy-950 dark:text-white uppercase tracking-tight">
                  KANTOR KEPALA DESA SUKAMAJU
                </h2>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Jl. Raya Ciawi - Sukamaju No. 04, Bogor 16720 • Email: pemdes.sukamaju@desa.mail.go.id
                </p>
              </div>
            </div>
          </div>

          {/* Judul Surat */}
          <div className="text-center space-y-1 font-sans">
            <h3 className="text-base font-bold uppercase underline tracking-wider text-navy-950 dark:text-white">
              SURAT TUGAS PELAKSANAAN KKN TEMATIK
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
              Nomor: {activeKelompok.nomor_surat}
            </p>
          </div>

          {/* Isi Surat */}
          <div className="space-y-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
            <p>
              Kepala Desa Sukamaju, Kecamatan Ciawi, Kabupaten Bogor, dengan ini memberikan izin operasional dan menugaskan kepada tim mahasiswa Kuliah Kerja Nyata (KKN) Tematik Terpadu berikut:
            </p>

            {/* Tabel Anggota Mahasiswa */}
            <div className="overflow-x-auto my-4">
              <table className="w-full text-left text-xs border border-slate-300 dark:border-navy-700">
                <thead className="bg-slate-100 dark:bg-navy-950 text-navy-950 dark:text-white font-bold">
                  <tr>
                    <th className="p-2.5 border border-slate-300 dark:border-navy-700 text-center w-10">No</th>
                    <th className="p-2.5 border border-slate-300 dark:border-navy-700">Nama Mahasiswa</th>
                    <th className="p-2.5 border border-slate-300 dark:border-navy-700">NIM</th>
                    <th className="p-2.5 border border-slate-300 dark:border-navy-700">Program Studi</th>
                  </tr>
                </thead>
                <tbody>
                  {activeKelompok.anggota.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-navy-950/50">
                      <td className="p-2.5 border border-slate-300 dark:border-navy-700 text-center">{idx + 1}</td>
                      <td className="p-2.5 border border-slate-300 dark:border-navy-700 font-bold">{m.nama}</td>
                      <td className="p-2.5 border border-slate-300 dark:border-navy-700 font-mono">{m.nim}</td>
                      <td className="p-2.5 border border-slate-300 dark:border-navy-700">{m.prodi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1.5 pl-2 text-xs">
              <p>
                <strong>Dosen Pembimbing Lapangan (DPL):</strong> {activeKelompok.dpl}
              </p>
              <p>
                <strong>Wilayah Penugasan:</strong> {activeKelompok.lokasi}
              </p>
              <p>
                <strong>Masa Berlaku Surat Tugas:</strong> {activeKelompok.masa_berlaku}
              </p>
            </div>

            <p>
              Mahasiswa yang bersangkutan berhak dan diwajibkan melakukan observasi, pendampingan masyarakat, koordinasi dengan perangkat RT/RW/Dusun, dan melaksanakan program kerja sesuai proposal yang telah disahkan.
            </p>
          </div>

          {/* Tanda Tangan & QR Cap Desa */}
          <div className="pt-8 grid grid-cols-2 text-center font-sans">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
                <QrCode className="w-20 h-20 text-navy-950 dark:text-white" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                E-VERIFIED: KEMENDAGRI-32.01.05.2001
              </span>
            </div>

            <div className="space-y-1 text-xs">
              <p>Sukamaju, {activeKelompok.tanggal_terbit}</p>
              <p className="font-bold">Kepala Desa Sukamaju</p>

              {/* Cap Stempel Digital */}
              <div className="h-20 flex items-center justify-center relative">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wider rotate-[-6deg] shadow-sm">
                  <Stamp className="w-3.5 h-3.5" />
                  <span>TERDAFTAR & SAH DIGITAL</span>
                </div>
              </div>

              <p className="font-extrabold text-navy-950 dark:text-white underline">
                H. AHMAD SOMAD, S.Sos.
              </p>
              <p className="text-[10px] text-slate-400">NIP. 196807151992031004</p>
            </div>
          </div>
        </Card>

        {/* Modal Preview Cetak */}
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-navy-800 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Printer className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                  Siap Mencetak Surat Tugas Resmi
                </h3>
                <p className="text-xs text-slate-500">
                  Dokumen Surat Tugas {activeKelompok.nomor_surat} siap dikirim ke antrian pencetak atau diunduh sebagai PDF beresolusi tinggi.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 text-xs font-bold"
                >
                  Batal
                </Button>
                <Button
                  variant="emerald"
                  size="sm"
                  onClick={() => {
                    toast.success('Mencetak dokumen resmi...');
                    setShowPreviewModal(false);
                  }}
                  className="flex-1 text-xs font-bold gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Sekarang</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
