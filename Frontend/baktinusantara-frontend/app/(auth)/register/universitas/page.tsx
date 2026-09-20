'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
  Upload,
  CheckCircle2,
  Building,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Search,
  School,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/services';
import { MasterUniversitasItem } from '@/lib/services/universitas.service';

export default function RegisterUniversitasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [skFile, setSkFile] = useState<File | null>(null);

  // Master Data Autocomplete State
  const [masterList, setMasterList] = useState<MasterUniversitasItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingMaster, setIsSearchingMaster] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const [selectedMaster, setSelectedMaster] = useState<MasterUniversitasItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nip_admin: '',
    nama_universitas: '',
    kode_pt: '',
    akreditasi: 'Unggul',
    alamat_kampus: '',
    phone_wa: '',
  });

  // Fetch Master Data on mount
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const list = await api.universitas.getMasterList();
        if (Array.isArray(list)) {
          setMasterList(list);
        }
      } catch (err) {
        console.warn('Failed to load master universities list:', err);
      }
    };
    fetchMaster();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setFormData((prev) => ({ ...prev, nama_universitas: val }));
    setShowSuggestions(true);

    if (selectedMaster && selectedMaster.nama_universitas.toLowerCase() !== val.toLowerCase()) {
      setSelectedMaster(null);
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (val.trim().length >= 2) {
      setIsSearchingMaster(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await api.universitas.getMasterList(val.trim());
          if (Array.isArray(res)) {
            setMasterList(res);
          }
        } catch (err) {
          console.warn(err);
        } finally {
          setIsSearchingMaster(false);
        }
      }, 250);
    } else {
      setIsSearchingMaster(false);
    }
  };

  const handleSelectMaster = (univ: MasterUniversitasItem) => {
    const resolvedAddress = univ.alamat_kampus || (univ.kabupaten_kota ? `${univ.kabupaten_kota}, ${univ.provinsi}` : '');
    setSelectedMaster(univ);
    setFormData((prev) => ({
      ...prev,
      nama_universitas: univ.nama_universitas,
      kode_pt: univ.kode_univ || '',
      akreditasi: univ.akreditasi || 'Unggul',
      alamat_kampus: resolvedAddress || prev.alamat_kampus,
    }));
    setSearchQuery(univ.nama_universitas);
    setShowSuggestions(false);
    toast.success(`Data resmi ${univ.nama_universitas} (Akreditasi: ${univ.akreditasi || 'Unggul'}) tersinkronisasi dari PDDikti!`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran berkas SK tidak boleh melebihi 10 MB');
      return;
    }

    setSkFile(file);
    toast.success(`Berkas SK "${file.name}" berhasil dipilih`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.nama_universitas.trim()) {
      toast.error('Harap lengkapi seluruh data wajib bertanda bintang (*)');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Kata sandi minimal 8 karakter');
      return;
    }

    if (!formData.email.includes('@')) {
      toast.error('Format email tidak valid');
      return;
    }

    // Zero-Trust Rule: Domain .ac.id is mandatory
    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail.endsWith('.ac.id') && !cleanEmail.includes('.ac.id')) {
      toast.error('Pendaftaran wajib menggunakan email resmi institusi berakhiran .ac.id');
      return;
    }

    if (!skFile) {
      toast.error('Harap unggah berkas SK Penugasan / SK Rektorat untuk verifikasi keaslian institusi');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('email', formData.email.trim());
      data.append('password', formData.password);
      data.append('nama_universitas', formData.nama_universitas.trim());
      data.append('kode_univ', formData.kode_pt.trim() || `UNIV-${Date.now().toString().slice(-4)}`);
      data.append('nip_admin', formData.nip_admin.trim());
      data.append('akreditasi', formData.akreditasi);
      data.append('alamat_kampus', formData.alamat_kampus.trim());
      data.append('phone_wa', formData.phone_wa.trim() || '081234567890');

      if (skFile) {
        data.append('sk_file', skFile);
      }

      const res = await api.universitas.registerUniversitas(data);
      toast.success(res.message || 'Pendaftaran Institusi Kampus Berhasil! Menunggu verifikasi Super Admin.');
      router.push('/login?registered=1');
    } catch (err: any) {
      console.error('Registration error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal mendaftarkan institusi kampus';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas dark:bg-[#071629] py-10 px-4 sm:px-6 lg:px-8 font-jakarta transition-colors duration-200">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-navy-950 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Pilih Jenis Akun Lain</span>
          </Link>

          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 relative flex items-center justify-center shrink-0">
              <Image
                src="/logo.svg"
                alt="BaktiNusantara Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain drop-shadow-sm"
              />
            </div>
            <span className="font-epilogue font-bold text-navy-950 dark:text-white text-base">
              BaktiNusantara
            </span>
          </Link>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 shadow-xl border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-navy-800">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Formulir LPPM / Kampus
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                Pendaftaran Admin Universitas
              </h1>
            </div>
          </div>

          {/* Zero-Trust Security Callout */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 mt-0.5 shadow-sm">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-indigo-950 dark:text-indigo-200">
                Protokol Keamanan Zero-Trust & Perlindungan Anti-Klaim Ganda
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                Untuk mencegah oknum tak bertanggung jawab membajak identitas perguruan tinggi, setiap kampus hanya dapat didaftarkan <strong>1 kali (Single-Master)</strong> menggunakan email resmi dinas <code className="font-mono bg-white dark:bg-navy-900 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-300 font-bold">.ac.id</code> dan diaudit forensik oleh AI Document Inspector.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Bagian 1: Data Administrator */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                1. Identitas Administrator LPPM
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nama Penanggung Jawab LPPM <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Prof. Dr. Ir. Budi Raharjo"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    NIP / Identitas Pegawai
                  </label>
                  <input
                    type="text"
                    value={formData.nip_admin}
                    onChange={(e) => setFormData({ ...formData, nip_admin: e.target.value })}
                    placeholder="197805122003121002"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Email Resmi Institusi (.ac.id) <span className="text-rose-500">*</span>
                    </label>
                    {formData.email && (
                      formData.email.toLowerCase().includes('.ac.id') ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Domain Valid
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Wajib .ac.id
                        </span>
                      )
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="lppm-kkn@unesa.ac.id"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 ${
                        formData.email && !formData.email.toLowerCase().includes('.ac.id')
                          ? 'border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20 focus:ring-amber-500/30'
                          : 'border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 focus:ring-primary/30'
                      }`}
                    />
                  </div>
                  {formData.email && !formData.email.toLowerCase().includes('.ac.id') && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      Perhatian: Email publik (@gmail, @yahoo) akan ditolak sistem. Gunakan email dinas kampus.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimal 8 karakter"
                      className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-navy-900 dark:hover:text-white transition-colors"
                      title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bagian 2: Data Perguruan Tinggi dengan PDDikti Autocomplete */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-navy-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  2. Profil Perguruan Tinggi (PDDikti)
                </h3>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold inline-flex items-center gap-1">
                  <School className="w-3.5 h-3.5" />
                  Master Data PDDikti Terintegrasi
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Searchable Kampus Autocomplete */}
                <div className="space-y-1 sm:col-span-2 relative" ref={suggestionRef}>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Cari & Pilih Nama Perguruan Tinggi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Ketik nama kampus, singkatan, atau kode PT (misal: UNESA, ITS, 001042, Telkom)..."
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showSuggestions && (
                    <div className="absolute z-30 left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-xl py-1 divide-y divide-slate-100 dark:divide-navy-800">
                      {masterList.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                          {isSearchingMaster ? 'Mencari database 2.850 perguruan tinggi...' : 'Ketik nama kampus untuk mencari...'}
                        </div>
                      ) : (
                        masterList.map((univ, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectMaster(univ)}
                            className="w-full text-left px-3.5 py-2.5 hover:bg-indigo-50 dark:hover:bg-navy-800 transition-colors flex items-center justify-between group"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-xs font-bold text-navy-950 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                                {univ.nama_universitas}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                Kode PT: <span className="font-mono text-slate-600 dark:text-slate-300 font-semibold">{univ.kode_univ || '-'}</span> • {univ.kabupaten_kota ? `${univ.kabupaten_kota}, ${univ.provinsi}` : (univ.alamat_kampus || 'Indonesia')} • Akreditasi: {univ.akreditasi || 'Unggul'}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wide ${
                                (univ.kelompok || '').toUpperCase() === 'PTN'
                                  ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                  : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              }`}>
                                {univ.kelompok || 'PTN'}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                Pilih
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Kode PT (PDDikti Kemendikbudristek)
                    </label>
                    {selectedMaster && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Valid PDDikti
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    readOnly={Boolean(selectedMaster)}
                    value={formData.kode_pt}
                    onChange={(e) => setFormData({ ...formData, kode_pt: e.target.value })}
                    placeholder="Pilih kampus untuk mengisi otomatis..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono font-semibold ${
                      selectedMaster
                        ? 'border-slate-200 dark:border-navy-700 bg-slate-100 dark:bg-navy-950/80 text-navy-950 dark:text-white cursor-not-allowed'
                        : 'border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950/60 text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30'
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Akreditasi Institusi
                    </label>
                    {selectedMaster ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                        <ShieldCheck className="w-3 h-3" />
                        Data Riil BAN-PT / PDDikti
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">
                        Deteksi Otomatis
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={
                        selectedMaster
                          ? `${formData.akreditasi} (Resmi Terakreditasi BAN-PT)`
                          : formData.kode_pt
                            ? `${formData.akreditasi} (PDDikti)`
                            : 'Pilih perguruan tinggi di atas...'
                      }
                      className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        selectedMaster
                          ? 'border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 cursor-not-allowed shadow-sm'
                          : 'border-slate-200 dark:border-navy-700 bg-slate-100 dark:bg-navy-950/60 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {selectedMaster ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Akreditasi terkunci otomatis sesuai data riil BAN-PT. Tidak dapat diubah manual guna mencegah pemalsuan data.
                      </span>
                    ) : (
                      'Terkunci otomatis dari PDDikti untuk menjamin integritas data (tidak dapat diinput manual).'
                    )}
                  </p>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Alamat Kampus Utama
                  </label>
                  <input
                    type="text"
                    value={formData.alamat_kampus}
                    onChange={(e) => setFormData({ ...formData, alamat_kampus: e.target.value })}
                    placeholder="Jl. Lidah Wetan, Surabaya, Jawa Timur"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 3: Unggah Dokumen Legalitas */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-navy-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Unggah SK Pengelola LPPM / Surat Keterangan Rektorat <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">PDF / Dokumen (Maks. 10 MB)</span>
              </div>

              <div className="border-2 border-dashed border-slate-200 dark:border-navy-700 rounded-2xl p-4 text-center hover:border-indigo-500 transition-colors bg-slate-50/50 dark:bg-navy-950/50">
                <input
                  type="file"
                  id="sk-upload"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="sk-upload" className="cursor-pointer block space-y-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto">
                    {skFile ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  {skFile ? (
                    <div>
                      <p className="text-xs font-bold text-emerald-600">{skFile.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {(skFile.size / 1024).toFixed(1)} KB — Siap diverifikasi oleh Super Admin
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-navy-950 dark:text-white">
                        Klik untuk memilih berkas SK LPPM / Penugasan Rektor
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Dokumen digunakan untuk verifikasi resmi dan pengesahan akun
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>Audit Forensik Otomatis oleh AI Document Inspector</span>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full justify-center font-bold text-sm shadow-md h-12 rounded-xl mt-4 bg-indigo-600 hover:bg-indigo-700"
            >
              Daftarkan Institusi Kampus (LPPM)
            </Button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Sudah memiliki akun pengelola?{' '}
            <Link href="/login" className="font-bold text-indigo-600 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
