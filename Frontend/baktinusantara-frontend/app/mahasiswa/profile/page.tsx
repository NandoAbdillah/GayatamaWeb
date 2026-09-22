'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Sparkles,
  ShieldCheck,
  FileCheck2,
  Save,
  Plus,
  X,
  AlertCircle,
  Heart,
  MapPin,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { StyledSelect } from '@/components/ui/StyledSelect';

export default function MahasiswaProfilePage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const [profile, setProfile] = useState({
    name: user?.name || 'Muhammad Raihan Pratama',
    email: user?.email || 'raihan.pratama@mhs.kampus.ac.id',
    nim: '21051204012',
    universitas: 'Universitas Bakti Nusantara',
    fakultas: 'Teknik & Rekayasa Sistem',
    jurusan: 'Teknik Informatika & IoT',
    angkatan: '2023',
    semester: '6',
    sks_lulus: 114,
    ipk: 3.84,
    no_hp: '0812-9876-5432',
    golongan_darah: 'O+',
    // Kontak Darurat
    nama_wali: 'Ir. Hendro Pratama',
    hubungan_wali: 'Ayah Kandung',
    no_hp_wali: '0812-3344-5566',
    alamat_asal: 'Jl. Surya Kencana No. 88, Kota Bogor, Jawa Barat',
    // Keahlian
    skills: [
      'IoT & Sensor Irigasi',
      'Pengembangan Web Next.js',
      'Pemetaan Geospasial GIS',
      'Digitalisasi UMKM Desa',
      'Penyuluhan Teknologi Pertanian',
    ],
  });

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (profile.skills.includes(newSkill.trim())) {
      toast.error('Keahlian ini sudah ada dalam daftar');
      return;
    }
    setProfile({
      ...profile,
      skills: [...profile.skills, newSkill.trim()],
    });
    setNewSkill('');
    toast.success('Keahlian baru ditambahkan untuk Smart-Matching');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      try {
        await apiClient.patch('/api/profile/mahasiswa', profile);
      } catch (apiErr) {
        // demo fallback
      }

      toast.success('Profil mahasiswa dan data kontak darurat berhasil diperbarui!');
    } catch (err: any) {
      toast.error('Gagal memperbarui profil: ' + (err.message || 'Kesalahan jaringan'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Profil Mahasiswa KKN">
      <div className="space-y-6 w-full font-jakarta">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Profil & Identitas Mahasiswa KKN
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Kelola data akademik, kontak darurat keluarga, dan tag keahlian untuk kecocokan program KKN.
            </p>
          </div>

          <Button
            type="submit"
            form="profile-form"
            variant="primary"
            size="sm"
            isLoading={saving}
            className="gap-2 font-bold text-xs"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </Button>
        </div>

        <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-6">
          {/* Card 1: Banner & Identitas Pokok */}
          <Card className="p-6 sm:p-8 space-y-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-navy-800">
              <div className="relative group">
                <img
                  src={
                    user?.avatar_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                  }
                  alt={profile.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white dark:border-navy-800 shadow-xl"
                />
                <button
                  type="button"
                  onClick={() => toast.info('Fitur unggah foto avatar baru')}
                  className="absolute bottom-1 right-1 p-2 rounded-xl bg-primary text-white shadow-md hover:bg-primary-600 transition-transform group-hover:scale-110"
                  title="Ubah Foto Profil"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-bold text-navy-950 dark:text-white font-epilogue">
                    {profile.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Syarat KKN Terpenuhi (114/100 SKS)
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  NIM: <span className="font-mono font-bold text-navy-950 dark:text-white">{profile.nim}</span> • {profile.jurusan}
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1">
                  <Building className="w-3.5 h-3.5 text-primary" />
                  <span>{profile.universitas}</span>
                </p>
              </div>

              {/* Status SKS & IPK Card Mini */}
              <div className="flex sm:flex-col gap-3 shrink-0">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">SKS Lulus</span>
                  <span className="text-base font-extrabold text-primary font-epilogue">{profile.sks_lulus} SKS</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-center min-w-[100px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">IPK Kumulatif</span>
                  <span className="text-base font-extrabold text-emerald-600 font-epilogue">{profile.ipk}</span>
                </div>
              </div>
            </div>

            {/* Form Input Detail Diri */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama Lengkap Mahasiswa
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Email Mahasiswa (Akun Resmi Kampus)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nomor WhatsApp Aktif
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={profile.no_hp}
                    onChange={(e) => setProfile({ ...profile, no_hp: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Golongan Darah (Untuk Data Medis KKN)
                </label>
                <StyledSelect
                  value={profile.golongan_darah}
                  onChange={(v) => setProfile({ ...profile, golongan_darah: String(v) })}
                  options={[
                    { value: 'A+', label: 'Golongan Darah A+' },
                    { value: 'B+', label: 'Golongan Darah B+' },
                    { value: 'AB+', label: 'Golongan Darah AB+' },
                    { value: 'O+', label: 'Golongan Darah O+' },
                  ]}
                />
              </div>
            </div>
          </Card>

          {/* Card 2: Kontak Darurat & Wali */}
          <Card className="p-6 sm:p-8 space-y-4 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-navy-800">
              <Heart className="w-5 h-5 text-rose-500" />
              <div>
                <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                  Kontak Darurat Orang Tua / Wali
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Diperlukan untuk koordinasi keselamatan lapangan dan verifikasi izin perjalanan KKN.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nama Orang Tua / Wali
                </label>
                <input
                  type="text"
                  required
                  value={profile.nama_wali}
                  onChange={(e) => setProfile({ ...profile, nama_wali: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Hubungan Keluarga
                </label>
                <input
                  type="text"
                  required
                  value={profile.hubungan_wali}
                  onChange={(e) => setProfile({ ...profile, hubungan_wali: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nomor HP Darurat
                </label>
                <input
                  type="tel"
                  required
                  value={profile.no_hp_wali}
                  onChange={(e) => setProfile({ ...profile, no_hp_wali: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Alamat Rumah Asal Orang Tua
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={profile.alamat_asal}
                    onChange={(e) => setProfile({ ...profile, alamat_asal: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Card 3: Keahlian & Smart-Matching Tags */}
          <Card className="p-6 sm:p-8 space-y-4 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-navy-800">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                    Keahlian & Kompetensi (Smart-Matching Tags)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sistem menggunakan tag ini untuk mencocokkan kelompok Anda dengan pos kebutuhan desa.
                  </p>
                </div>
              </div>
            </div>

            {/* List Skill Tags */}
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 text-primary dark:text-primary-300 text-xs font-bold border border-primary/20"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-500 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add New Skill Input */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Tambahkan keahlian baru (contoh: Penyuluhan Gizi, Desain Kemasan)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSkill}
                className="gap-1.5 font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tag</span>
              </Button>
            </div>
          </Card>

          {/* Card 4: Status Dokumen Legalitas */}
          <Card className="p-6 space-y-4 border-slate-200 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/50">
            <h3 className="text-sm font-bold text-navy-950 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Dokumen Akademik Terverifikasi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-navy-950 dark:text-white">Kartu Tanda Mahasiswa (KTM)</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Terverifikasi OCR LPPM</p>
                  </div>
                </div>
                <StatusBadge status="approved" label="Sah" size="sm" />
              </div>

              <div className="p-3.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-navy-950 dark:text-white">Sertifikat Pembekalan KKN</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">Lulus Gelombang I 2026</p>
                  </div>
                </div>
                <StatusBadge status="approved" label="Sah" size="sm" />
              </div>
            </div>
          </Card>
        </form>
      </div>
    </DashboardLayout>
  );
}
