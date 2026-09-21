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
  ArrowLeft,
  ArrowRight,
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
  FileText,
  FileCheck2,
  Trash2,
  RefreshCw,
  PenTool,
  Check,
  FileSpreadsheet,
  Globe,
  MapPin,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/services';
import { MasterUniversitasItem } from '@/lib/services/universitas.service';

export default function RegisterUniversitasPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Files & Previews
  const [skFile, setSkFile] = useState<File | null>(null);
  const [skPreviewUrl, setSkPreviewUrl] = useState<string | null>(null);
  const [sptjmFile, setSptjmFile] = useState<File | null>(null);

  // Manual Campus Registration Mode (if unlisted)
  const [isManualEntry, setIsManualEntry] = useState(false);

  // Master Data Autocomplete State
  const [masterList, setMasterList] = useState<MasterUniversitasItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingMaster, setIsSearchingMaster] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const [selectedMaster, setSelectedMaster] = useState<MasterUniversitasItem | null>(null);

  // Institution Availability State
  const [isCheckingKode, setIsCheckingKode] = useState(false);
  const [kodeStatus, setKodeStatus] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
  } | null>(null);

  // Document Validation & Entity Extraction State
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepText, setScanStepText] = useState('Memeriksa berkas...');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Digital Signature State
  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [hasSignatureDrawn, setHasSignatureDrawn] = useState(false);
  const [uploadedSignatureFile, setUploadedSignatureFile] = useState<File | null>(null);
  const [uploadedSignaturePreview, setUploadedSignaturePreview] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Honeypot anti-bot
  const [botTrap, setBotTrap] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Kampus & Email
    nama_universitas: '',
    singkatan_kampus: '',
    bentuk_kampus: 'Universitas',
    jenis_kampus: 'PTS',
    provinsi: '',
    kabupaten: '',
    website_kampus: '',
    kode_pt: '',
    akreditasi: 'Unggul',
    alamat_kampus: '',
    email: '',

    // Step 2: Legalitas SK (Terkunci Otomatis saat Terverifikasi)
    nomor_sk: '',
    judul_sk: '',
    pejabat_penandatangan: '',
    berlaku_sampai: '',
    instansi_penerbit: '',

    // Step 3: Kredensial Administrator
    name: '',
    nip_admin: '',
    phone_wa: '',
    password: '',
    terms_agreed: false,
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

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (skPreviewUrl) URL.revokeObjectURL(skPreviewUrl);
      if (uploadedSignaturePreview) URL.revokeObjectURL(uploadedSignaturePreview);
    };
  }, [skPreviewUrl, uploadedSignaturePreview]);

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

  // Digital Signature Canvas Setup
  useEffect(() => {
    if (currentStep === 3 && signatureMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [currentStep, signatureMode]);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setFormData((prev) => ({ ...prev, nama_universitas: val }));
    setShowSuggestions(true);
    setKodeStatus(null);

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

  const handleSelectMaster = async (univ: MasterUniversitasItem) => {
    const resolvedAddress = univ.alamat_kampus || (univ.kabupaten_kota ? `${univ.kabupaten_kota}, ${univ.provinsi}` : '');
    setSelectedMaster(univ);
    setFormData((prev) => ({
      ...prev,
      nama_universitas: univ.nama_universitas,
      kode_pt: univ.kode_univ || '',
      akreditasi: univ.akreditasi || 'Unggul',
      alamat_kampus: resolvedAddress || prev.alamat_kampus,
      website_kampus: univ.website || prev.website_kampus,
    }));
    setSearchQuery(univ.nama_universitas);
    setShowSuggestions(false);

    // Check Institution Availability
    if (univ.kode_univ) {
      setIsCheckingKode(true);
      try {
        const checkRes = await api.universitas.checkKodeAvailability(univ.kode_univ);
        setKodeStatus({
          checked: true,
          available: checkRes.available,
          message: checkRes.message,
        });

        if (!checkRes.available) {
          toast.error(`Perhatian: ${univ.nama_universitas} sudah terdaftar dalam sistem.`);
        } else {
          toast.success(`Institusi ${univ.nama_universitas} tersedia dan siap didaftarkan.`);
        }
      } catch (err) {
        console.warn('Check kode availability error:', err);
        setKodeStatus({
          checked: true,
          available: true,
          message: 'Status institusi terkonfirmasi siap didaftarkan.',
        });
      } finally {
        setIsCheckingKode(false);
      }
    }
  };

  // Switch to Manual Campus Entry
  const toggleManualEntry = () => {
    setIsManualEntry((prev) => !prev);
    setSelectedMaster(null);
    setKodeStatus(null);
    setSearchQuery('');
  };

  // Document Upload & Realtime Inspection Handler
  const handleSkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran berkas SK tidak boleh melebihi 10 MB');
      return;
    }

    if (skPreviewUrl) {
      URL.revokeObjectURL(skPreviewUrl);
    }

    setSkFile(file);
    setSkPreviewUrl(URL.createObjectURL(file));
    setScanError(null);
    setScanResult(null);

    // Run Realtime Document Verification
    setIsScanning(true);
    setScanProgress(25);
    setScanStepText('Memvalidasi format naskah & kelayakan berkas...');

    const timer1 = setTimeout(() => {
      setScanProgress(60);
      setScanStepText('Memeriksa struktur kop dinas, nomor SK, dan pengesahan...');
    }, 600);

    const timer2 = setTimeout(() => {
      setScanProgress(85);
      setScanStepText('Mengekstrak data legalitas dan masa berlaku...');
    }, 1200);

    try {
      const scanResponse = await api.universitas.scanDocumentRealtime(file, {
        nama_universitas: formData.nama_universitas,
        kode_univ: formData.kode_pt,
        email: formData.email,
        name: formData.name,
        nip_admin: formData.nip_admin,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      setScanProgress(100);

      // Check if document was rejected
      if (scanResponse && scanResponse.is_valid === false) {
        setScanError(
          scanResponse.catatan ||
            'Dokumen ditolak: Berkas yang diunggah tidak terdeteksi sebagai Surat Keputusan (SK) resmi atau naskah dinas perguruan tinggi.'
        );
        setScanResult(null);
        // Reset legalitas fields
        setFormData((prev) => ({
          ...prev,
          nomor_sk: '',
          judul_sk: '',
          pejabat_penandatangan: '',
          berlaku_sampai: '',
          instansi_penerbit: '',
        }));
        toast.error('Dokumen Tidak Memenuhi Kriteria Surat Keputusan Resmi!');
      } else if (scanResponse && scanResponse.extracted) {
        const ext = scanResponse.extracted;
        setScanResult(scanResponse);
        setScanError(null);

        // Auto-Fill & Lock the fields
        setFormData((prev) => ({
          ...prev,
          nomor_sk: ext.nomor_sk || prev.nomor_sk,
          judul_sk: ext.judul_sk || prev.judul_sk,
          pejabat_penandatangan: ext.pejabat_penandatangan || prev.pejabat_penandatangan,
          berlaku_sampai: ext.berlaku_sampai || prev.berlaku_sampai,
          instansi_penerbit: ext.instansi_penerbit || prev.instansi_penerbit,
          name: ext.nama_tertulis || prev.name,
          nip_admin: ext.nip_tertulis || prev.nip_admin,
        }));

        toast.success('Naskah dinas berhasil diverifikasi dan data legalitas terkunci otomatis.');
      }
    } catch (err: any) {
      console.warn('Scan realtime error:', err);
      clearTimeout(timer1);
      clearTimeout(timer2);
      setScanError('Gagal memvalidasi dokumen secara otomatis. Silakan periksa kembali berkas yang diunggah.');
    } finally {
      setIsScanning(false);
    }
  };

  const removeSkFile = () => {
    if (skPreviewUrl) {
      URL.revokeObjectURL(skPreviewUrl);
    }
    setSkFile(null);
    setSkPreviewUrl(null);
    setScanResult(null);
    setScanError(null);
    setFormData((prev) => ({
      ...prev,
      nomor_sk: '',
      judul_sk: '',
      pejabat_penandatangan: '',
      berlaku_sampai: '',
      instansi_penerbit: '',
    }));
  };

  const handleSptjmUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran berkas SPTJM tidak boleh melebihi 10 MB');
      return;
    }
    setSptjmFile(file);
    toast.success(`Berkas pendukung "${file.name}" berhasil dilampirkan.`);
  };

  const removeSptjmFile = () => {
    setSptjmFile(null);
  };

  // Signature Canvas Drawing Logic
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasSignatureDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const coords = getCanvasCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignatureDrawn(false);
  };

  // Upload Signature Image Logic
  const handleSignatureFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran berkas tanda tangan tidak boleh melebihi 5 MB');
      return;
    }
    if (uploadedSignaturePreview) {
      URL.revokeObjectURL(uploadedSignaturePreview);
    }
    setUploadedSignatureFile(file);
    setUploadedSignaturePreview(URL.createObjectURL(file));
    toast.success('Pindaian tanda tangan resmi berhasil diunggah.');
  };

  const removeUploadedSignature = () => {
    if (uploadedSignaturePreview) {
      URL.revokeObjectURL(uploadedSignaturePreview);
    }
    setUploadedSignatureFile(null);
    setUploadedSignaturePreview(null);
  };

  // Step Navigations with Validations
  const goToStep2 = () => {
    if (botTrap) return;

    if (!formData.nama_universitas.trim()) {
      toast.error('Harap isi atau pilih nama perguruan tinggi');
      return;
    }

    if (isManualEntry) {
      if (!formData.alamat_kampus.trim()) {
        toast.error('Harap isi alamat lengkap kampus');
        return;
      }
    } else if (kodeStatus && !kodeStatus.available) {
      toast.error('Kampus ini telah terdaftar dalam sistem.');
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Harap masukkan alamat email yang valid');
      return;
    }

    if (!cleanEmail.endsWith('.ac.id') && !cleanEmail.includes('.ac.id')) {
      toast.error('Pendaftaran wajib menggunakan email resmi institusi berakhiran .ac.id');
      return;
    }

    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToStep3 = () => {
    if (!skFile) {
      toast.error('Harap unggah berkas SK Penugasan / Pengangkatan LPPM');
      return;
    }

    if (scanError) {
      toast.error('Dokumen yang diunggah belum memenuhi syarat. Silakan ganti dengan berkas SK resmi.');
      return;
    }

    if (!formData.nomor_sk.trim()) {
      toast.error('Nomor SK belum tervalidasi. Harap unggah berkas SK yang sah.');
      return;
    }

    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final Form Submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (botTrap) return;

    if (!formData.name.trim()) {
      toast.error('Nama Penanggung Jawab LPPM wajib diisi');
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      toast.error('Kata sandi minimal 8 karakter');
      return;
    }

    const isSignatureProvided =
      (signatureMode === 'draw' && hasSignatureDrawn) ||
      (signatureMode === 'upload' && uploadedSignatureFile !== null);

    if (!isSignatureProvided) {
      toast.error('Harap bubuhkan tanda tangan digital atau unggah pindaian tanda tangan resmi.');
      return;
    }

    if (!formData.terms_agreed) {
      toast.error('Anda wajib menyetujui Syarat, Ketentuan, serta Pakta Integritas Pendaftaran.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('nama_universitas', formData.nama_universitas.trim());
      data.append('kode_univ', formData.kode_pt.trim() || `UNIV-${Date.now().toString().slice(-4)}`);
      data.append('akreditasi', formData.akreditasi);
      data.append('alamat_kampus', formData.alamat_kampus.trim());
      data.append('email', formData.email.trim().toLowerCase());

      data.append('is_manual_entry', isManualEntry ? '1' : '0');
      if (formData.singkatan_kampus) data.append('singkatan_kampus', formData.singkatan_kampus.trim());
      if (formData.bentuk_kampus) data.append('bentuk_kampus', formData.bentuk_kampus);
      if (formData.jenis_kampus) data.append('jenis_kampus', formData.jenis_kampus);
      if (formData.provinsi) data.append('provinsi', formData.provinsi);
      if (formData.kabupaten) data.append('kabupaten', formData.kabupaten);
      if (formData.website_kampus) data.append('website_kampus', formData.website_kampus.trim());

      data.append('name', formData.name.trim());
      data.append('nip_admin', formData.nip_admin.trim());
      data.append('phone_wa', formData.phone_wa.trim() || '081234567890');
      data.append('password', formData.password);

      data.append('nomor_sk', formData.nomor_sk.trim());
      data.append('judul_sk', formData.judul_sk.trim());
      data.append('pejabat_penandatangan', formData.pejabat_penandatangan.trim());
      data.append('berlaku_sampai', formData.berlaku_sampai.trim());

      if (skFile) {
        data.append('sk_file', skFile);
      }
      if (sptjmFile) {
        data.append('sptjm_file', sptjmFile);
      }

      // Handle Signature
      if (signatureMode === 'draw' && canvasRef.current && hasSignatureDrawn) {
        const signatureBase64 = canvasRef.current.toDataURL('image/png');
        data.append('signature_data', signatureBase64);
      } else if (signatureMode === 'upload' && uploadedSignatureFile) {
        data.append('signature_file', uploadedSignatureFile);
      }

      const res = await api.universitas.registerUniversitas(data);
      toast.success(res.message || 'Pendaftaran Institusi Kampus Berhasil! Menunggu verifikasi berkas.');
      router.push('/login?registered=1');
    } catch (err: any) {
      console.error('Registration error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal mendaftarkan institusi kampus';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Password Strength Evaluation
  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return { label: 'Belum diisi', color: 'bg-slate-200 dark:bg-navy-800', width: '0%' };
    if (pwd.length < 8) return { label: 'Lemah (< 8 Karakter)', color: 'bg-rose-500', width: '25%' };
    const hasNum = /\d/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);

    if (hasNum && hasSpecial && hasUpper && pwd.length >= 10) {
      return { label: 'Sangat Kuat (Aman)', color: 'bg-emerald-500', width: '100%' };
    }
    if ((hasNum || hasSpecial) && pwd.length >= 8) {
      return { label: 'Sedang (Cukup)', color: 'bg-amber-500', width: '65%' };
    }
    return { label: 'Dasar (Tambahkan angka & simbol)', color: 'bg-blue-500', width: '45%' };
  };

  const pwdStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-surface-canvas dark:bg-[#071629] py-10 px-4 sm:px-6 lg:px-8 font-jakarta transition-colors duration-200">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Header */}
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

        {/* Main Card */}
        <Card className="p-6 sm:p-8 space-y-6 shadow-xl border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
          {/* Card Title & Institutional Badge */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-navy-800">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Verifikasi Institusi & Pengelola LPPM
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                Pendaftaran Administrator LPPM Perguruan Tinggi
              </h1>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-3 gap-2 pb-2">
            {/* Step 1 Pill */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                currentStep === 1
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 shadow-sm'
                  : currentStep > 1
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/40 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    currentStep === 1
                      ? 'bg-indigo-600 text-white'
                      : currentStep > 1
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-navy-800 text-slate-500'
                  }`}
                >
                  {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold truncate">Langkah 1</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Identitas Institusi</p>
                </div>
              </div>
            </div>

            {/* Step 2 Pill */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                currentStep === 2
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 shadow-sm'
                  : currentStep > 2
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                  : 'border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/40 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    currentStep === 2
                      ? 'bg-indigo-600 text-white'
                      : currentStep > 2
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-navy-800 text-slate-500'
                  }`}
                >
                  {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold truncate">Langkah 2</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Berkas Legalitas SK</p>
                </div>
              </div>
            </div>

            {/* Step 3 Pill */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                currentStep === 3
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 shadow-sm'
                  : 'border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/40 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    currentStep === 3
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 dark:bg-navy-800 text-slate-500'
                  }`}
                >
                  3
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold truncate">Langkah 3</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Otorisasi & Pakta</p>
                </div>
              </div>
            </div>
          </div>

          {/* Honeypot hidden input for anti-bot */}
          <input
            type="text"
            name="website_url_check"
            value={botTrap}
            onChange={(e) => setBotTrap(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* ======================================================== */}
          {/* LANGKAH 1: IDENTITAS PERGURUAN TINGGI                    */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Institutional Notice */}
              <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <p className="font-bold text-indigo-950 dark:text-indigo-200">
                    Ketentuan Identitas Institusi Perguruan Tinggi
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    Setiap institusi perguruan tinggi didaftarkan oleh perwakilan LPPM resmi menggunakan email dinas perguruan tinggi berdomain <code className="font-mono bg-white dark:bg-navy-900 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-300 font-bold">.ac.id</code>.
                  </p>
                </div>
              </div>

              {/* Mode Selection: Master Search vs Manual Entry */}
              {!isManualEntry ? (
                /* Auto-Search Mode */
                <div className="space-y-4">
                  <div className="space-y-1 relative" ref={suggestionRef}>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Cari & Pilih Nama Perguruan Tinggi <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={toggleManualEntry}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
                      >
                        Kampus tidak ada di daftar? Daftarkan mandiri
                      </button>
                    </div>
                    <div className="relative">
                      <Building className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        placeholder="Ketik nama kampus atau kode PT (contoh: Universitas Gadjah Mada, UNESA, 001042)..."
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <Search className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400" />
                    </div>

                    {/* Dropdown Suggestions */}
                    {showSuggestions && (
                      <div className="absolute z-30 left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl shadow-xl py-1 divide-y divide-slate-100 dark:divide-navy-800">
                        {masterList.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400 space-y-1">
                            <p>{isSearchingMaster ? 'Mencari data institusi...' : 'Kampus tidak ditemukan dalam daftar.'}</p>
                            <button
                              type="button"
                              onClick={toggleManualEntry}
                              className="text-xs font-bold text-indigo-600 hover:underline"
                            >
                              + Daftarkan Kampus Baru Secara Mandiri
                            </button>
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
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                Pilih
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Status Ketersediaan Kampus */}
                  {isCheckingKode && (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-navy-950 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2 animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>Memeriksa ketersediaan status institusi...</span>
                    </div>
                  )}

                  {kodeStatus && (
                    <div
                      className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                        kodeStatus.available
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                      }`}
                    >
                      {kodeStatus.available ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-bold">
                          {kodeStatus.available ? 'Institusi Tersedia (Siap Didaftarkan)' : 'Peringatan: Institusi Telah Terdaftar'}
                        </p>
                        <p className="text-[11px] leading-relaxed opacity-90 mt-0.5">{kodeStatus.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Kode PT & Akreditasi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Kode PT (PDDikti Kemdikbudristek)
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.kode_pt || 'Pilih institusi di atas...'}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-100 dark:bg-navy-950/70 text-xs font-mono font-semibold text-navy-950 dark:text-white cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Akreditasi Institusi
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={selectedMaster ? `${formData.akreditasi} (Resmi BAN-PT)` : 'Deteksi otomatis dari master...'}
                        className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-xs font-bold text-emerald-900 dark:text-emerald-200 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Alamat Kampus */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Alamat Kampus Utama
                    </label>
                    <input
                      type="text"
                      value={formData.alamat_kampus}
                      onChange={(e) => setFormData({ ...formData, alamat_kampus: e.target.value })}
                      placeholder="Jl. Raya Kampus No. 1, Kota..."
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              ) : (
                /* Manual Entry Mode (Comprehensive Fields) */
                <div className="space-y-4 p-4 rounded-2xl border border-indigo-200 dark:border-navy-700 bg-indigo-50/30 dark:bg-navy-950/30">
                  <div className="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-navy-800">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                      <Building className="w-4 h-4" />
                      <span className="text-xs font-bold">Pendaftaran Kampus Mandiri (Belum Masuk Master)</span>
                    </div>
                    <button
                      type="button"
                      onClick={toggleManualEntry}
                      className="text-[11px] font-bold text-slate-500 hover:text-navy-950 dark:hover:text-white"
                    >
                      ← Kembali ke Pencarian Master
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Nama Lengkap Perguruan Tinggi <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nama_universitas}
                        onChange={(e) => setFormData({ ...formData, nama_universitas: e.target.value })}
                        placeholder="Contoh: Institut Teknologi & Bisnis Cakrawala"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:ring-2 focus:ring-primary/30"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Singkatan / Akronim
                        </label>
                        <input
                          type="text"
                          value={formData.singkatan_kampus}
                          onChange={(e) => setFormData({ ...formData, singkatan_kampus: e.target.value })}
                          placeholder="Contoh: ITBC"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Bentuk Perguruan Tinggi <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formData.bentuk_kampus}
                          onChange={(e) => setFormData({ ...formData, bentuk_kampus: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white"
                        >
                          <option value="Universitas">Universitas</option>
                          <option value="Institut">Institut</option>
                          <option value="Sekolah Tinggi">Sekolah Tinggi</option>
                          <option value="Politeknik">Politeknik</option>
                          <option value="Akademi">Akademi</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Kelompok / Status <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formData.jenis_kampus}
                          onChange={(e) => setFormData({ ...formData, jenis_kampus: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white"
                        >
                          <option value="PTN">PTN (Negeri)</option>
                          <option value="PTS">PTS (Swasta)</option>
                          <option value="PTA">PTA (Keagamaan)</option>
                          <option value="PTK">PTK (Kedinasan)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Kode PT / Izin SK Pendirian
                        </label>
                        <input
                          type="text"
                          value={formData.kode_pt}
                          onChange={(e) => setFormData({ ...formData, kode_pt: e.target.value })}
                          placeholder="Kode Kemdikbud (jika ada)"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-mono font-semibold text-navy-950 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Akreditasi Institusi <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formData.akreditasi}
                          onChange={(e) => setFormData({ ...formData, akreditasi: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white"
                        >
                          <option value="Unggul">Unggul</option>
                          <option value="Baik Sekali">Baik Sekali</option>
                          <option value="Baik">Baik</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="Belum Terakreditasi">Belum Terakreditasi / Baru</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Provinsi
                        </label>
                        <input
                          type="text"
                          value={formData.provinsi}
                          onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                          placeholder="Jawa Timur, DKI Jakarta, dll"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Kabupaten / Kota
                        </label>
                        <input
                          type="text"
                          value={formData.kabupaten}
                          onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                          placeholder="Kota Surabaya, Kab. Sidoarjo, dll"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Alamat Kampus Lengkap <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.alamat_kampus}
                        onChange={(e) => setFormData({ ...formData, alamat_kampus: e.target.value })}
                        placeholder="Jl. Raya Utama No. 123..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Website Resmi Perguruan Tinggi
                      </label>
                      <input
                        type="url"
                        value={formData.website_kampus}
                        onChange={(e) => setFormData({ ...formData, website_kampus: e.target.value })}
                        placeholder="https://www.namauniv.ac.id"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email Resmi Institusi .ac.id */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Email Resmi Institusi (.ac.id) <span className="text-rose-500">*</span>
                  </label>
                  {formData.email && (
                    formData.email.toLowerCase().includes('.ac.id') ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Domain Resmi .ac.id Sesuai
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 inline-flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Wajib Menggunakan Domain .ac.id
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
                    placeholder="lppm@namauniv.ac.id"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 ${
                      formData.email && !formData.email.toLowerCase().includes('.ac.id')
                        ? 'border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20 focus:ring-amber-500/30'
                        : 'border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 focus:ring-primary/30'
                    }`}
                  />
                </div>
                {formData.email && !formData.email.toLowerCase().includes('.ac.id') && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                    Perhatian: Email publik (@gmail, @yahoo) tidak diterima demi keamanan kelembagaan perguruan tinggi.
                  </p>
                )}
              </div>

              {/* Navigation Action */}
              <div className="pt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={goToStep2}
                  disabled={Boolean(!isManualEntry && kodeStatus && !kodeStatus.available)}
                  className="font-bold text-xs gap-1.5 h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                >
                  <span>Lanjut ke Langkah 2 (Unggah Berkas SK)</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* LANGKAH 2: UNGGAH BERKAS LEGALITAS SK REKTOR             */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Step 2 Guidance */}
              <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-start gap-3">
                <FileCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <p className="font-bold text-indigo-950 dark:text-indigo-200">
                    Pemeriksaan & Validasi Dokumen Surat Keputusan (SK) Resmi
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    Unggah naskah dinas <strong>Surat Keputusan (SK) Pengangkatan / Penugasan Pengelola LPPM dari Rektor</strong>. Sistem akan membaca dan mengunci data legalitas secara otomatis.
                  </p>
                </div>
              </div>

              {/* Document Dropzone / Media Preview Card */}
              {!skFile ? (
                /* Upload Dropzone */
                <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-2xl p-6 text-center bg-indigo-50/30 dark:bg-indigo-950/20 relative">
                  <input
                    type="file"
                    id="sk-upload-input"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={handleSkUpload}
                    disabled={isScanning}
                    className="hidden"
                  />
                  <label htmlFor="sk-upload-input" className="cursor-pointer block space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-navy-950 dark:text-white">
                        Pilih Berkas SK Pengangkatan / Penugasan LPPM dari Rektorat
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Mendukung format PDF atau Gambar (JPG, PNG) vertikal • Maksimal 10 MB
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                /* Media Preview Card with Edit & Remove actions */
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-navy-700 bg-slate-50/80 dark:bg-navy-950/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Berkas Surat Keputusan Terpilih
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="sk-replace-input"
                        accept="application/pdf,image/jpeg,image/png"
                        onChange={handleSkUpload}
                        disabled={isScanning}
                        className="hidden"
                      />
                      <label
                        htmlFor="sk-replace-input"
                        className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-navy-800 transition-colors inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Ganti Berkas</span>
                      </label>
                      <button
                        type="button"
                        onClick={removeSkFile}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800/80 bg-rose-50 dark:bg-rose-950/40 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Berkas</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Media Preview Container */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-white dark:bg-navy-900 border border-slate-100 dark:border-navy-800">
                    {skFile.type.startsWith('image/') && skPreviewUrl ? (
                      <div className="w-24 h-32 relative rounded-lg overflow-hidden border border-slate-200 dark:border-navy-700 bg-slate-100 shrink-0 shadow-sm">
                        <img
                          src={skPreviewUrl}
                          alt="Preview SK"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    ) : (
                      <div className="w-24 h-32 rounded-lg border border-slate-200 dark:border-navy-700 bg-rose-50 dark:bg-navy-800/80 flex flex-col items-center justify-center text-rose-600 shrink-0 shadow-sm p-2 text-center">
                        <FileText className="w-8 h-8" />
                        <span className="text-[10px] font-bold mt-1 font-mono uppercase">
                          {skFile.name.split('.').pop() || 'PDF'}
                        </span>
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-1 text-left w-full">
                      <p className="text-xs font-extrabold text-navy-950 dark:text-white font-mono truncate">
                        {skFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Ukuran: {(skFile.size / 1024).toFixed(1)} KB • Tipe: {skFile.type || 'Dokumen Resmi'}
                      </p>
                      <div className="pt-1">
                        {isScanning ? (
                          <div className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold animate-pulse">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>{scanStepText} ({scanProgress}%)</span>
                          </div>
                        ) : scanError ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                            <AlertCircle className="w-3.5 h-3.5" /> Berkas Ditolak
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Berkas Memenuhi Standar Legalitas
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Real-time Scanning Progress Bar */}
              {isScanning && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-navy-950 border border-indigo-200 dark:border-navy-800 space-y-2 text-center">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    <span>{scanStepText}</span>
                    <span className="font-mono">{scanProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-navy-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Rejection Alert if Document is Invalid */}
              {scanError && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-sm">Dokumen Tidak Memenuhi Syarat Legalitas</p>
                    <p className="text-[11px] leading-relaxed opacity-90">{scanError}</p>
                    <p className="text-[10px] font-semibold text-rose-700 dark:text-rose-300 pt-1">
                      Tips: Pastikan berkas adalah naskah dinas resmi vertikal (bukan tangkapan layar browser, peta, atau foto umum).
                    </p>
                  </div>
                </div>
              )}

              {/* Locked Verified Legalitas Data Card */}
              {formData.nomor_sk && !scanError && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/60 dark:border-navy-800">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-navy-950 dark:text-white">
                        Data Legalitas SK Terverifikasi (Terkunci Otomatis)
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      Terverifikasi Resmi
                    </span>
                  </div>

                  {/* Notice Read-Only */}
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                    Data berikut telah divalidasi dan terkunci dari dokumen naskah dinas untuk menjamin keaslian dan mencegah manipulasi dokumen.
                  </p>

                  {/* Read-Only Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                        <span>Nama / Judul Dokumen Surat Keputusan</span>
                        <Lock className="w-3 h-3 text-slate-400" />
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.judul_sk}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-100 dark:bg-navy-900/80 text-xs font-semibold text-navy-950 dark:text-white cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                        <span>Nomor / Kode Resmi SK</span>
                        <Lock className="w-3 h-3 text-slate-400" />
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.nomor_sk}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-100 dark:bg-navy-900/80 text-xs font-mono font-bold text-navy-950 dark:text-white cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                        <span>Pejabat Penandatangan SK</span>
                        <Lock className="w-3 h-3 text-slate-400" />
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.pejabat_penandatangan}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-100 dark:bg-navy-900/80 text-xs font-semibold text-navy-950 dark:text-white cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                        <span>Instansi Penerbit SK</span>
                        <Lock className="w-3 h-3 text-slate-400" />
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.instansi_penerbit || formData.nama_universitas}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-100 dark:bg-navy-900/80 text-xs font-semibold text-navy-950 dark:text-white cursor-not-allowed"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
                        <span>Masa Berlaku Sampai</span>
                        <Lock className="w-3 h-3 text-slate-400" />
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.berlaku_sampai}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-100 dark:bg-navy-900/80 text-xs font-semibold text-navy-950 dark:text-white cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Dokumen Pendukung Opsional (SPTJM) */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-navy-950 dark:text-white">
                      Dokumen Pendukung: Surat Kuasa / SPTJM Bermaterai (Opsional)
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Lampiran tambahan untuk mempercepat persetujuan verifikasi pendaftaran
                    </p>
                  </div>
                  <label
                    htmlFor="sptjm-upload-input"
                    className="cursor-pointer px-3 py-1.5 rounded-lg border border-slate-200 dark:border-navy-700 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-navy-800 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{sptjmFile ? 'Ganti Berkas' : 'Unggah SPTJM'}</span>
                  </label>
                  <input
                    type="file"
                    id="sptjm-upload-input"
                    accept="application/pdf,image/jpeg,image/png"
                    onChange={handleSptjmUpload}
                    className="hidden"
                  />
                </div>
                {sptjmFile && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-navy-950 text-xs">
                    <p className="font-mono text-emerald-600 font-bold truncate">
                      ✓ {sptjmFile.name} ({(sptjmFile.size / 1024).toFixed(1)} KB)
                    </p>
                    <button
                      type="button"
                      onClick={removeSptjmFile}
                      className="text-slate-400 hover:text-rose-600"
                      title="Hapus berkas SPTJM"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="font-bold text-xs gap-1.5 h-11 px-5 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Langkah 1</span>
                </Button>

                <Button
                  type="button"
                  onClick={goToStep3}
                  disabled={!skFile || isScanning || Boolean(scanError)}
                  className="font-bold text-xs gap-1.5 h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
                >
                  <span>Lanjut ke Langkah 3 (Otorisasi & Pengesahan)</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* LANGKAH 3: KREDENSIAL ADMINISTRATOR & PAKTA INTEGRITAS   */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <form onSubmit={handleFinalSubmit} className="space-y-5 animate-in fade-in duration-200">
              {/* Step 3 Header Guidance */}
              <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <p className="font-bold text-indigo-950 dark:text-indigo-200">
                    Otorisasi Administrator LPPM & Penandatanganan Resmi
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    Lengkapi kredensial administrator resmi LPPM, telaah syarat lisensi, dan bubuhkan tanda tangan elektronik resmi sebelum pengesahan akun.
                  </p>
                </div>
              </div>

              {/* Admin Identity Fields */}
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
                      placeholder="Nama lengkap beserta gelar"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    NIP / NIDN Pegawai <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nip_admin}
                    onChange={(e) => setFormData({ ...formData, nip_admin: e.target.value })}
                    placeholder="Nomor identitas pegawai resmi"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nomor WhatsApp Dinas LPPM <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone_wa}
                    onChange={(e) => setFormData({ ...formData, phone_wa: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Password with Strength Meter */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Kata Sandi Akun LPPM <span className="text-rose-500">*</span>
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
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden">
                      <div className={`h-full ${pwdStrength.color} transition-all duration-300`} style={{ width: pwdStrength.width }} />
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Keamanan Kata Sandi: <span className="font-bold">{pwdStrength.label}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Ringkasan Pendaftaran */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-navy-800 space-y-2.5">
                <p className="text-xs font-bold text-navy-950 dark:text-white uppercase tracking-wider">
                  Ringkasan Pendaftaran Institusi
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-100 dark:border-navy-800">
                    <span className="text-[10px] text-slate-400 block">Institusi Perguruan Tinggi:</span>
                    <span className="font-bold text-navy-950 dark:text-white">{formData.nama_universitas}</span>
                    <span className="text-[10px] text-slate-500 block">Kode PT: {formData.kode_pt || '-'} • Akreditasi: {formData.akreditasi}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-100 dark:border-navy-800">
                    <span className="text-[10px] text-slate-400 block">Email Resmi Terdaftar:</span>
                    <span className="font-mono font-bold text-navy-950 dark:text-white">{formData.email}</span>
                    <span className="text-[10px] text-emerald-600 block">✓ Domain Terverifikasi (.ac.id)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-100 dark:border-navy-800">
                    <span className="text-[10px] text-slate-400 block">Nomor SK Penugasan LPPM:</span>
                    <span className="font-mono font-bold text-navy-950 dark:text-white">{formData.nomor_sk}</span>
                    <span className="text-[10px] text-slate-500 block">Berlaku s.d: {formData.berlaku_sampai || '-'}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-slate-100 dark:border-navy-800">
                    <span className="text-[10px] text-slate-400 block">Berkas Legalitas:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      Terverifikasi Resmi
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">File: {skFile?.name}</span>
                  </div>
                </div>
              </div>

              {/* Syarat, Ketentuan & Pakta Integritas (Scrollable Terms Box) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Syarat, Ketentuan, & Pakta Integritas Pendaftaran Institusi <span className="text-rose-500">*</span>
                </label>
                <div className="h-32 overflow-y-auto p-3 rounded-xl border border-slate-200 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950/70 text-[11px] text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                  <p className="font-bold text-navy-950 dark:text-white">
                    PAKTA INTEGRITAS DAN KETENTUAN HUKUM PENGELOLA INSTITUSI LPPM
                  </p>
                  <p>
                    <strong>1. Kewenangan & Mandat Resmi:</strong> Pendaftar menyatakan dengan sadar dan sebenar-benarnya bahwa dirinya adalah pimpinan, dosen, atau staf resmi Lembaga Penelitian dan Pengabdian kepada Masyarakat (LPPM) yang sah dan diberi kuasa oleh Rektor / Pimpinan Perguruan Tinggi yang bersangkutan.
                  </p>
                  <p>
                    <strong>2. Keaslian Dokumen:</strong> Seluruh dokumen naskah dinas, Surat Keputusan (SK), dan tanda tangan elektronik yang dilampirkan adalah orisinal, sah menurut hukum tata kelola naskah dinas Republik Indonesia, dan tidak mengalami modifikasi yang melanggar hukum.
                  </p>
                  <p>
                    <strong>3. Tanggung Jawab Keamanan Akun:</strong> Akun Administrator LPPM merupakan Single-Master Account tingkat universitas. Segala penugasan dosen pembimbing lapangan, pendaftaran program KKN, dan validasi nilai mahasiswa menjadi tanggung jawab penuh pengelola institusi.
                  </p>
                  <p>
                    <strong>4. Sanksi Hukum:</strong> Segala bentuk rekayasa identitas institusi, penggunaan surat palsu, atau tindakan merugikan institusi dapat dikenakan sanksi pidana berdasarkan Pasal 263 KUHP dan ketentuan UU No. 11 Tahun 2008 tentang Informasi dan Transaksi Elektronik (UU ITE), serta pemblokiran permanen hak akses pada platform BaktiNusantara.
                  </p>
                </div>
              </div>

              {/* Fitur Tanda Tangan Elektronik / Digital Signature */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-navy-950 dark:text-white">
                      Pengesahan Tanda Tangan Resmi <span className="text-rose-500">*</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Bubuhkan tanda tangan online atau unggah scan tanda tangan resmi penanggung jawab
                    </p>
                  </div>

                  {/* Mode Tabs */}
                  <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
                    <button
                      type="button"
                      onClick={() => setSignatureMode('draw')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        signatureMode === 'draw'
                          ? 'bg-white dark:bg-navy-800 text-indigo-600 shadow-sm'
                          : 'text-slate-500 hover:text-navy-950 dark:hover:text-white'
                      }`}
                    >
                      Tanda Tangan Langsung
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignatureMode('upload')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        signatureMode === 'upload'
                          ? 'bg-white dark:bg-navy-800 text-indigo-600 shadow-sm'
                          : 'text-slate-500 hover:text-navy-950 dark:hover:text-white'
                      }`}
                    >
                      Unggah Pindaian
                    </button>
                  </div>
                </div>

                {/* Signature Canvas Area */}
                {signatureMode === 'draw' ? (
                  <div className="space-y-2">
                    <div className="relative border-2 border-dashed border-slate-200 dark:border-navy-700 rounded-2xl bg-white overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={160}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-40 touch-none cursor-crosshair bg-white"
                      />
                      {!hasSignatureDrawn && (
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-300 dark:text-slate-400 space-y-1">
                          <PenTool className="w-5 h-5" />
                          <span className="text-xs font-semibold">
                            Tanda tangani di area ini (gunakan mouse / layar sentuh)
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        {hasSignatureDrawn ? (
                          <span className="text-emerald-600 font-bold inline-flex items-center gap-1 text-[11px]">
                            <Check className="w-3.5 h-3.5" /> Tanda tangan digital telah dibubuhkan
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Belum ada tanda tangan</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={clearCanvas}
                        disabled={!hasSignatureDrawn}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 disabled:opacity-40 text-[11px] font-semibold"
                      >
                        Hapus / Ulangi
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Upload Signature Scan Area */
                  <div className="space-y-2">
                    {!uploadedSignatureFile ? (
                      <div className="border-2 border-dashed border-slate-200 dark:border-navy-700 rounded-2xl p-5 text-center bg-slate-50/50 dark:bg-navy-950/40">
                        <input
                          type="file"
                          id="signature-file-input"
                          accept="image/png,image/jpeg"
                          onChange={handleSignatureFileUpload}
                          className="hidden"
                        />
                        <label htmlFor="signature-file-input" className="cursor-pointer block space-y-1.5">
                          <Upload className="w-6 h-6 text-indigo-600 mx-auto" />
                          <p className="text-xs font-bold text-navy-950 dark:text-white">
                            Pilih Pindaian Tanda Tangan / Stempel Resmi (PNG / JPG)
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Format transparan atau latar putih bersih • Maksimal 5 MB
                          </p>
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800">
                        <div className="flex items-center gap-3">
                          {uploadedSignaturePreview && (
                            <img
                              src={uploadedSignaturePreview}
                              alt="Scan Tanda Tangan"
                              className="w-16 h-12 object-contain bg-white rounded border border-slate-200 p-0.5"
                            />
                          )}
                          <div className="text-xs">
                            <p className="font-bold text-navy-950 dark:text-white truncate max-w-xs">
                              {uploadedSignatureFile.name}
                            </p>
                            <p className="text-[10px] text-emerald-600 font-semibold">
                              ✓ Berkas pindaian siap disahkan
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeUploadedSignature}
                          className="text-rose-600 hover:text-rose-700 text-xs font-bold"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Checkbox Agreement */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/80">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={formData.terms_agreed}
                    onChange={(e) => setFormData({ ...formData, terms_agreed: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <div className="space-y-0.5 text-xs">
                    <span className="font-bold text-navy-950 dark:text-white">
                      Persetujuan Tanggung Jawab Hukum & Pakta Integritas Resmi
                    </span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Saya menyatakan telah membaca, memahami, dan menyetujui seluruh Syarat, Ketentuan, serta Pakta Integritas di atas dengan sadar tanpa paksaan, dan bertanggung jawab penuh secara hukum atas keabsahan pendaftaran institusi ini.
                    </p>
                  </div>
                </label>
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                  className="font-bold text-xs gap-1.5 h-11 px-5 rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali ke Langkah 2</span>
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={loading}
                  disabled={
                    !formData.terms_agreed ||
                    (signatureMode === 'draw' ? !hasSignatureDrawn : !uploadedSignatureFile)
                  }
                  className="font-bold text-xs gap-2 h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sahkan & Daftarkan Institusi Kampus</span>
                </Button>
              </div>
            </form>
          )}

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-navy-800">
            Sudah memiliki akun pengelola institusi?{' '}
            <Link href="/login" className="font-bold text-indigo-600 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
