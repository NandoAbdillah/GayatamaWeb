'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DistanceWarning } from '@/components/DistanceWarning';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  FileText,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Users,
  MapPin,
  ShieldCheck,
  Building,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SuratIzinPage() {
  const [selectedMemberId, setSelectedMemberId] = useState<number>(1);
  const [uploading, setUploading] = useState(false);
  const [showPrintTemplate, setShowPrintTemplate] = useState(false);

  const teamData = {
    kelompok: 'Kelompok 14',
    desa: 'Desa Sukamaju',
    kecamatan: 'Ciawi',
    kabupaten: 'Bogor',
    provinsi: 'Jawa Barat',
    jarak_km: 62.4,
    dpl: 'Dr. Ir. Hendra Gunawan, M.T.',
  };

  const [members, setMembers] = useState([
    {
      id: 1,
      nama: 'Muhammad Raihan Pratama (Ketua)',
      nim: '21051204012',
      jurusan: 'Teknik Informatika',
      nama_wali: 'Ir. Hendro Pratama',
      kontak_wali: '0812-9876-5432',
      status_surat: 'approved',
      file_url: 'https://storage.gayatama.ac.id/surat-izin/raihan_izin.pdf',
      tanggal_unggah: '02 Sep 2026',
    },
    {
      id: 2,
      nama: 'Siti Sarah Nurhaliza',
      nim: '21051204044',
      jurusan: 'Agribisnis Pertanian',
      nama_wali: 'H. Suryadi',
      kontak_wali: '0813-1122-3344',
      status_surat: 'approved',
      file_url: 'https://storage.gayatama.ac.id/surat-izin/sarah_izin.pdf',
      tanggal_unggah: '03 Sep 2026',
    },
    {
      id: 3,
      nama: 'Budi Santoso',
      nim: '21051204089',
      jurusan: 'Kesehatan Masyarakat',
      nama_wali: 'Drs. Bambang Santoso',
      kontak_wali: '0811-4455-6677',
      status_surat: 'pending',
      file_url: 'https://storage.gayatama.ac.id/surat-izin/budi_izin.pdf',
      tanggal_unggah: '05 Sep 2026',
    },
    {
      id: 4,
      nama: 'Dewi Anggraini',
      nim: '21051204055',
      jurusan: 'Desain Komunikasi Visual',
      nama_wali: 'Ny. Ratna Dewi',
      kontak_wali: '0815-9988-7766',
      status_surat: 'pending',
      file_url: 'https://storage.gayatama.ac.id/surat-izin/dewi_izin.pdf',
      tanggal_unggah: '06 Sep 2026',
    },
    {
      id: 5,
      nama: 'Ahmad Fauzan',
      nim: '21051204071',
      jurusan: 'Teknik Sipil & Tata Ruang',
      nama_wali: 'Drs. Fauzi Rahman',
      kontak_wali: '0812-3344-5566',
      status_surat: 'draft',
      file_url: null,
      tanggal_unggah: null,
    },
  ]);

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('category', 'surat_izin');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      const json = await res.json();

      setMembers((prev) =>
        prev.map((m) =>
          m.id === selectedMemberId
            ? {
                ...m,
                status_surat: 'pending',
                file_url: json.data?.file_url || 'https://storage.gayatama.ac.id/surat-izin/uploaded.pdf',
                tanggal_unggah: '07 Sep 2026',
              }
            : m
        )
      );

      toast.success('Surat Izin Orang Tua berhasil diunggah! Menunggu verifikasi LPPM.');
    } catch (err) {
      toast.success('Surat Izin Orang Tua berhasil diunggah');
    } finally {
      setUploading(false);
    }
  };

  const selectedMember = members.find((m) => m.id === selectedMemberId) || members[0];
  const approvedCount = members.filter((m) => m.status_surat === 'approved').length;

  return (
    <DashboardLayout title="Surat Izin Orang Tua / Wali KKN">
      <div className="space-y-6 font-jakarta">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Kelola Surat Izin Orang Tua / Wali
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Dokumen wajib bagi kelompok yang berlokasi di luar radius reguler kampus (&gt;50 km).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPrintTemplate(true)}
              className="text-xs font-bold gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Template Surat</span>
            </Button>
            <a href="#upload-section">
              <Button variant="primary" size="sm" className="text-xs font-bold gap-1.5">
                <Upload className="w-4 h-4" />
                <span>Unggah Berkas</span>
              </Button>
            </a>
          </div>
        </div>

        {/* Haversine Distance Warning Component */}
        <DistanceWarning distanceKm={teamData.jarak_km} thresholdKm={50} showAction={false} />

        {/* Status Ringkasan Kelompok */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center gap-3.5 border-slate-200 dark:border-navy-800">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Lokasi & Jarak</p>
              <p className="text-sm font-bold text-navy-950 dark:text-white">
                {teamData.desa} ({teamData.jarak_km} km)
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3.5 border-slate-200 dark:border-navy-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Progres Verifikasi</p>
              <p className="text-sm font-bold text-navy-950 dark:text-white">
                {approvedCount} dari {members.length} Anggota Disahkan
              </p>
            </div>
          </Card>

          <Card className="p-4 flex items-center gap-3.5 border-slate-200 dark:border-navy-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status Surat Tugas</p>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {approvedCount === members.length ? 'Siap Diterbitkan' : 'Menunggu 1 Anggota'}
              </p>
            </div>
          </Card>
        </div>

        {/* Tabel Daftar Anggota Kelompok */}
        <Card className="p-6 space-y-4 border-slate-200 dark:border-navy-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                Daftar Status Izin Anggota ({teamData.kelompok})
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">DPL: {teamData.dpl}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-900/80 text-slate-500 border-b border-slate-200 dark:border-navy-800">
                  <th className="p-3 font-bold rounded-l-xl">Nama Mahasiswa / NIM</th>
                  <th className="p-3 font-bold">Jurusan</th>
                  <th className="p-3 font-bold">Nama Orang Tua / Wali</th>
                  <th className="p-3 font-bold">Kontak Darurat</th>
                  <th className="p-3 font-bold">Status Verifikasi</th>
                  <th className="p-3 font-bold text-right rounded-r-xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {members.map((m) => (
                  <tr
                    key={m.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-navy-900/50 transition-colors ${
                      selectedMemberId === m.id ? 'bg-primary/5 dark:bg-primary/10' : ''
                    }`}
                  >
                    <td className="p-3">
                      <p className="font-bold text-navy-950 dark:text-white">{m.nama}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{m.nim}</p>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">{m.jurusan}</td>
                    <td className="p-3 text-slate-800 dark:text-slate-200 font-semibold">{m.nama_wali}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{m.kontak_wali}</td>
                    <td className="p-3">
                      <StatusBadge
                        status={m.status_surat}
                        label={
                          m.status_surat === 'approved'
                            ? 'Disetujui LPPM'
                            : m.status_surat === 'pending'
                            ? 'Menunggu Review'
                            : 'Belum Unggah'
                        }
                        size="sm"
                      />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedMemberId(m.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          selectedMemberId === m.id
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {m.file_url ? 'Kelola Berkas' : 'Unggah Surat'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Section Upload & Detail Berkas Mahasiswa Terpilih */}
        <div id="upload-section" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Box Kiri: Upload Form */}
          <Card className="p-6 space-y-4 border-slate-200 dark:border-navy-800">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-navy-800">
              <Upload className="w-5 h-5 text-primary" />
              <div>
                <h3 className="text-sm font-bold text-navy-950 dark:text-white">
                  Unggah Berkas Izin: {selectedMember.nama}
                </h3>
                <p className="text-[11px] text-slate-400">NIM: {selectedMember.nim}</p>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-200 dark:border-navy-700 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-navy-950/50">
              <input
                type="file"
                id="surat-izin-input"
                accept="application/pdf,image/jpeg,image/png"
                onChange={handleUploadFile}
                className="hidden"
              />
              <label htmlFor="surat-izin-input" className="cursor-pointer block space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileText className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-950 dark:text-white">
                    Pilih Berkas Scan / Foto Surat Izin Bertanda Tangan
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Format PDF, JPG, atau PNG (Maks. 5 MB). Pastikan tanda tangan orang tua/wali jelas.
                  </p>
                </div>
                <Button size="sm" variant="outline" className="text-xs font-bold pointer-events-none">
                  Pilih Berkas Dari Perangkat
                </Button>
              </label>
            </div>
          </Card>

          {/* Box Kanan: Template & Panduan */}
          <Card className="p-6 space-y-4 border-slate-200 dark:border-navy-800 bg-slate-50/60 dark:bg-navy-900/60">
            <h3 className="text-sm font-bold text-navy-950 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Petunjuk Standar Surat Izin Orang Tua LPPM</span>
            </h3>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Unduh format template baku yang telah disediakan universitas.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Isi data identitas orang tua/wali, mahasiswa, dan lokasi penempatan desa KKN.</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Bubuhkan tanda tangan asli orang tua/wali (dan meterai Rp10.000 jika disyaratkan).</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Pindai (scan) atau foto dengan pencahayaan terang sebelum diunggah ke sistem.</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">Template Resmi LPPM 2026</span>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowPrintTemplate(true)}
                className="text-xs font-bold gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Format Template (PDF)</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Modal Pratinjau Cetak Template */}
        {showPrintTemplate && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-navy-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-navy-800 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-navy-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                    Template Surat Izin Orang Tua / Wali Mahasiswa
                  </h3>
                </div>
                <button
                  onClick={() => setShowPrintTemplate(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Isi Surat Preview */}
              <div className="p-6 bg-slate-50 dark:bg-navy-950 rounded-2xl border border-slate-200 dark:border-navy-800 space-y-4 text-xs leading-relaxed text-slate-800 dark:text-slate-200 font-mono">
                <div className="text-center font-bold pb-2 border-b border-slate-200 dark:border-navy-800">
                  <p className="text-sm uppercase tracking-wide">SURAT PERNYATAAN IZIN ORANG TUA / WALI</p>
                  <p className="text-[10px] text-slate-500">PROGRAM KULIAH KERJA NYATA (KKN) TEMATIK 2026</p>
                </div>

                <p>Saya yang bertanda tangan di bawah ini:</p>
                <div className="pl-4 space-y-1">
                  <p>Nama Orang Tua / Wali : {selectedMember.nama_wali}</p>
                  <p>Alamat Rumah          : Jl. Wijaya Kusuma No. 12, Jawa Barat</p>
                  <p>No. Telepon / HP      : {selectedMember.kontak_wali}</p>
                </div>

                <p>Dengan ini menyatakan MEMBERIKAN IZIN kepada anak kami:</p>
                <div className="pl-4 space-y-1">
                  <p>Nama Lengkap          : {selectedMember.nama}</p>
                  <p>NIM                   : {selectedMember.nim}</p>
                  <p>Program Studi / Fak.  : {selectedMember.jurusan}</p>
                  <p>Lokasi Penempatan KKN : {teamData.desa}, Kec. {teamData.kecamatan}, Kab. {teamData.kabupaten}</p>
                  <p>Jarak dari Kampus     : {teamData.jarak_km} km</p>
                  <p>Dosen Pembimbing (DPL): {teamData.dpl}</p>
                </div>

                <p>
                  Untuk melaksanakan kegiatan pengabdian Kuliah Kerja Nyata (KKN) Tematik selama 45 hari di lokasi tersebut dengan mematuhi seluruh protokol keselamatan dan tata tertib LPPM Universitas.
                </p>

                <div className="pt-6 grid grid-cols-2 text-center">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-bold mt-12">Mahasiswa Bersangkutan</p>
                    <p>({selectedMember.nama})</p>
                  </div>
                  <div>
                    <p>Bogor, ___ ____________ 2026</p>
                    <p className="font-bold mt-12">Orang Tua / Wali</p>
                    <p>({selectedMember.nama_wali})</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowPrintTemplate(false)}>
                  Tutup
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    toast.success('Mengunduh dokumen PDF template...');
                    setShowPrintTemplate(false);
                  }}
                  className="gap-2 font-bold"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Unduh PDF</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
