'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MOCK_KELOMPOK_14 } from '@/lib/mock-data';
import {
  Award,
  Printer,
  FileCheck2,
  CheckCircle2,
  Download,
  Building,
  GraduationCap,
  Sparkles,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DosenPenilaianPage() {
  const [showPrintModal, setShowPrintModal] = useState(false);

  const mahasiswaGrades = [
    {
      id: 1,
      nama: 'M. Rian Pratama',
      nim: '21051204012',
      jurusan: 'Teknik Informatika',
      logbook: 95,
      eksekusi: 94,
      luaran: 95,
      desa: 94,
      nilaiAkhir: 94.6,
      huruf: 'A',
    },
    {
      id: 2,
      nama: 'Salsabila Putri',
      nim: '21051204045',
      jurusan: 'Agribisnis',
      logbook: 92,
      eksekusi: 94,
      luaran: 93,
      desa: 94,
      nilaiAkhir: 93.3,
      huruf: 'A',
    },
    {
      id: 3,
      nama: 'Dimas Arya Pamungkas',
      nim: '21051204088',
      jurusan: 'Ilmu Komunikasi',
      logbook: 90,
      eksekusi: 92,
      luaran: 94,
      desa: 94,
      nilaiAkhir: 92.5,
      huruf: 'A',
    },
    {
      id: 4,
      nama: 'Siti Nurhaliza',
      nim: '21051204102',
      jurusan: 'Farmasi & Herbal',
      logbook: 94,
      eksekusi: 93,
      luaran: 92,
      desa: 94,
      nilaiAkhir: 93.1,
      huruf: 'A',
    },
    {
      id: 5,
      nama: 'Bagus Wicaksono',
      nim: '21051204033',
      jurusan: 'Teknik Elektro',
      logbook: 91,
      eksekusi: 95,
      luaran: 94,
      desa: 94,
      nilaiAkhir: 93.7,
      huruf: 'A',
    },
  ];

  return (
    <DashboardLayout title="Rekapitulasi Nilai & Berita Acara DPL">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
              Rekapitulasi Penilaian Kelompok 14 (Desa Sukamaju)
            </h1>
            <p className="text-xs text-slate-500 font-jakarta">
              Pembobotan: Logbook (25%), Eksekusi Program (35%), Luaran Akhir (25%), Evaluasi Mitra Desa (15%).
            </p>
          </div>

          <Button
            onClick={() => setShowPrintModal(true)}
            variant="primary"
            size="md"
            className="shadow-glow-primary gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Berita Acara Resmi</span>
          </Button>
        </div>

        {/* Grades Table */}
        <Card className="border-slate-200 bg-white overflow-hidden shadow-ambient">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-surface-subtle text-[11px] font-bold text-navy-950 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Mahasiswa</th>
                  <th className="p-4 text-center">Logbook (25%)</th>
                  <th className="p-4 text-center">Eksekusi (35%)</th>
                  <th className="p-4 text-center">Luaran (25%)</th>
                  <th className="p-4 text-center">Mitra Desa (15%)</th>
                  <th className="p-4 text-center">Nilai Angka</th>
                  <th className="p-4 text-center">Nilai Huruf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-jakarta">
                {mahasiswaGrades.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-navy-950 text-xs">{m.nama}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {m.nim} • {m.jurusan}
                      </p>
                    </td>
                    <td className="p-4 text-center font-medium">{m.logbook}</td>
                    <td className="p-4 text-center font-medium">{m.eksekusi}</td>
                    <td className="p-4 text-center font-medium">{m.luaran}</td>
                    <td className="p-4 text-center font-medium">{m.desa}</td>
                    <td className="p-4 text-center font-extrabold text-navy-950 text-sm">
                      {m.nilaiAkhir}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                        {m.huruf}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-surface-subtle border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Seluruh anggota kelompok memenuhi syarat kelulusan KKN (Minimal 200 jam kerja).</span>
            </div>

            <Button
              onClick={() => toast.success('Nilai kelulusan berhasil disinkronkan ke LPPM!')}
              size="sm"
              variant="emerald"
            >
              Kirim Nilai ke LPPM
            </Button>
          </div>
        </Card>
      </div>

      {/* Official Printable Berita Acara Modal (Stitch: Pratinjau Cetak Berita Acara Penilaian Luaran KKN) */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 font-jakarta">
            {/* Document Header */}
            <div className="text-center pb-4 border-b-2 border-slate-800 space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                LEMBAGA PENELITIAN DAN PENGABDIAN KEPADA MASYARAKAT (LPPM)
              </p>
              <h2 className="text-lg font-extrabold text-navy-950 font-epilogue uppercase">
                BERITA ACARA PENILAIAN HASIL & LUARAN KKN
              </h2>
              <p className="text-xs text-slate-600">
                Nomor: BA/014/DPL-KKN/UNIV/IX/2026 • Tahun Akademik 2026/2027
              </p>
            </div>

            <div className="text-xs space-y-2 text-slate-700 leading-relaxed">
              <p>
                Pada hari ini, <strong className="text-navy-950">Minggu, 06 September 2026</strong>, bertempat di
                Sekretariat LPPM Universitas, Dosen Pembimbing Lapangan bersama Pemerintah Desa Sukamaju telah
                melakukan evaluasi dan pengesahan hasil program kerja KKN:
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <p><strong>Kelompok:</strong> Kelompok 14 — Sukamaju Berdaya</p>
                <p><strong>Lokasi:</strong> Desa Sukamaju, Kecamatan Ciawi, Kabupaten Bogor</p>
                <p><strong>Dosen Pembimbing (DPL):</strong> Dr. Ir. Hendra Gunawan, M.T. (NIP: 197804122005011002)</p>
                <p><strong>Mitra Kepala Desa:</strong> H. Ahmad Subardjo</p>
              </div>
            </div>

            {/* Compact Table */}
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 font-bold text-navy-900 border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">No</th>
                  <th className="p-2 border-r border-slate-300">NIM</th>
                  <th className="p-2 border-r border-slate-300">Nama Mahasiswa</th>
                  <th className="p-2 border-r border-slate-300">Program Studi</th>
                  <th className="p-2 border-r border-slate-300 text-center">Nilai Angka</th>
                  <th className="p-2 text-center">Nilai Huruf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {mahasiswaGrades.map((m, idx) => (
                  <tr key={m.id}>
                    <td className="p-2 border-r border-slate-300 text-center">{idx + 1}</td>
                    <td className="p-2 border-r border-slate-300 font-mono">{m.nim}</td>
                    <td className="p-2 border-r border-slate-300 font-bold text-navy-950">{m.nama}</td>
                    <td className="p-2 border-r border-slate-300">{m.jurusan}</td>
                    <td className="p-2 border-r border-slate-300 text-center font-bold">{m.nilaiAkhir}</td>
                    <td className="p-2 text-center font-extrabold text-emerald-700">{m.huruf}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature Blocks */}
            <div className="grid grid-cols-2 gap-8 pt-4 text-xs">
              <div className="text-center space-y-12">
                <p className="text-slate-500">Mengetahui,<br /><strong>Kepala Desa Sukamaju</strong></p>
                <div className="space-y-1">
                  <p className="font-bold text-navy-950 underline">H. Ahmad Subardjo</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">[Tanda Tangan Digital Sah]</p>
                </div>
              </div>

              <div className="text-center space-y-12">
                <p className="text-slate-500">Disahkan oleh,<br /><strong>Dosen Pembimbing Lapangan</strong></p>
                <div className="space-y-1">
                  <p className="font-bold text-navy-950 underline">Dr. Ir. Hendra Gunawan, M.T.</p>
                  <p className="text-[10px] text-slate-500">NIP. 197804122005011002</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button onClick={() => setShowPrintModal(false)} variant="outline" size="md">
                Tutup
              </Button>
              <Button
                onClick={() => {
                  window.print();
                  toast.success('Perintah cetak dokumen dikirim');
                }}
                variant="primary"
                size="md"
                className="gap-2 shadow-glow-primary font-semibold"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
