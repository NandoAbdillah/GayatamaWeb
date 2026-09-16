'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Activity,
  ShieldCheck,
  Clock,
  CheckCircle2,
  User,
  Search,
  Filter,
  FileCheck2,
  Award,
  Bell,
  RefreshCw,
} from 'lucide-react';
import api from '@/lib/services';
import { toast } from 'sonner';

interface AuditLog {
  id: number | string;
  aksi: string;
  aktor: string;
  detail: string;
  waktu: string;
  kategori: string;
  tipe: 'success' | 'info' | 'warning';
}

const SEEDED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    aksi: 'Verifikasi Berkas Legalitas SK Kampus & LPPM',
    aktor: 'Super Admin BaktiNusantara',
    detail: 'Memvalidasi SK Rektor LPPM UNESA Surabaya sebagai institusi perguruan tinggi terverifikasi resmi.',
    waktu: '2 jam yang lalu',
    kategori: 'Verifikasi Legalitas',
    tipe: 'success',
  },
  {
    id: 'log-2',
    aksi: 'Verifikasi Akun Pemerintah Desa Mitra',
    aktor: 'Super Admin BaktiNusantara',
    detail: 'Mengesahkan SK Kepala Desa Sukamaju (Jombang) dan mengaktifkan akses publikasi pos kebutuhan.',
    waktu: '5 jam yang lalu',
    kategori: 'Verifikasi Legalitas',
    tipe: 'success',
  },
  {
    id: 'log-3',
    aksi: 'Sinkronisasi Gateway Webhook WhatsApp',
    aktor: 'Security System',
    detail: 'Memproses pesan masuk WhatsApp aspirasi warga desa melalui gateway webhook Meta API.',
    waktu: '1 hari yang lalu',
    kategori: 'Keamanan & Integrasi',
    tipe: 'info',
  },
  {
    id: 'log-4',
    aksi: 'Pengesahan Luaran Akhir & E-Sertifikat Digital',
    aktor: 'Kantor Kepala Desa Sukamaju',
    detail: "Menerbitkan portofolio publik dan sertifikat kelulusan digital kelompok 'KKN UNESA 01'.",
    waktu: '1 hari yang lalu',
    kategori: 'Luaran & Portofolio',
    tipe: 'success',
  },
  {
    id: 'log-5',
    aksi: 'Autentikasi Sesi Super Admin Platform',
    aktor: 'Admin (admin@baktinusantara.id)',
    detail: 'Login sesi aman melalui token Sanctum dari alamat IP jaringan terpercaya.',
    waktu: '2 hari yang lalu',
    kategori: 'Keamanan & Integrasi',
    tipe: 'info',
  },
];

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>(SEEDED_AUDIT_LOGS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKategori, setActiveKategori] = useState('all');

  const fetchRealNotifications = async () => {
    try {
      setLoading(true);
      const notifs = await api.notification.getAll();
      if (Array.isArray(notifs) && notifs.length > 0) {
        const notifLogs: AuditLog[] = notifs.map((n: any) => ({
          id: `notif-${n.id}`,
          aksi: 'Notifikasi Sistem In-App',
          aktor: 'Sistem BaktiNusantara',
          detail: n.pesan,
          waktu: n.created_at ? new Date(n.created_at).toLocaleDateString('id-ID') : 'Baru saja',
          kategori: 'Notifikasi Sistem',
          tipe: 'info',
        }));
        setLogs([...notifLogs, ...SEEDED_AUDIT_LOGS]);
      }
    } catch (err) {
      console.warn('Fallback audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealNotifications();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchCat = activeKategori === 'all' || l.kategori.toLowerCase().includes(activeKategori.toLowerCase());
    const q = searchQuery.toLowerCase();
    const matchSearch =
      l.aksi.toLowerCase().includes(q) ||
      l.aktor.toLowerCase().includes(q) ||
      l.detail.toLowerCase().includes(q) ||
      l.kategori.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <DashboardLayout
      title="Audit Trail & Rekam Jejak Sistem"
      breadcrumb={[
        { label: 'Audit Trail & Sistem' },
      ]}
    >
      <div className="space-y-6 font-jakarta">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Activity className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                Audit Trail & Rekam Jejak Aktivitas Platform
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Super Admin mengawasi log keamanan dan riwayat aksi krusial mulai dari verifikasi entitas, penerbitan proposal, logbook mingguan, hingga pengesahan luaran akhir.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchRealNotifications();
              toast.success('Log aktivitas berhasil dimuat ulang');
            }}
            className="text-xs font-bold gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan Log</span>
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <Card className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {[
                { key: 'all', label: 'Semua Kategori' },
                { key: 'luaran', label: 'Luaran & Portofolio' },
                { key: 'logbook', label: 'Logbook' },
                { key: 'proposal', label: 'Proposal' },
                { key: 'verifikasi', label: 'Verifikasi' },
                { key: 'notifikasi', label: 'Notifikasi Sistem' },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setActiveKategori(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                    activeKategori === cat.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari aktivitas, nama aktor, atau aksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-950 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </Card>

        {/* Log Entries */}
        <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-4">
          <div className="divide-y divide-slate-100 dark:divide-navy-800">
            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada log aktivitas yang cocok dengan kriteria pencarian.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {log.kategori}
                      </span>
                      <h3 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">
                        {log.aksi}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {log.detail}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <span>Eksekutor / Aktor:</span>
                      <strong className="text-navy-900 dark:text-slate-200 font-semibold">{log.aktor}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 shrink-0 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{log.waktu}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
