'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Activity,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Send,
  Eye,
  Compass,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const groups = [
    {
      id: 'kelompok-14',
      nama: 'Kelompok 14',
      desa: 'Desa Sukamaju, Ciawi, Bogor',
      jarak_km: 62.4,
      izin_ortu: 'Lengkap (5/5)',
      dpl: 'Dr. Ir. Hendra Gunawan, M.T.',
      anggota: 5,
      jam_kerja: '142 / 200 Jam',
      logbook_status: 'Lancar (Update Hari Ini)',
      gps_valid: true,
      alert: null,
    },
    {
      id: 'kelompok-08',
      nama: 'Kelompok 08',
      desa: 'Desa Sukamaju, Ciawi, Bogor',
      jarak_km: 62.4,
      izin_ortu: 'Lengkap (5/5)',
      dpl: 'Dra. Hj. Nurul Hidayati, M.Si.',
      anggota: 5,
      jam_kerja: '138 / 200 Jam',
      logbook_status: 'Lancar (Update Hari Ini)',
      gps_valid: true,
      alert: null,
    },
    {
      id: 'kelompok-22',
      nama: 'Kelompok 22',
      desa: 'Desa Cibodas Asri, Cianjur',
      jarak_km: 78.1,
      izin_ortu: 'Kurang 1 Anggota',
      dpl: 'Prof. Dr. Ir. Ahmad Syahid',
      anggota: 5,
      jam_kerja: '95 / 200 Jam',
      logbook_status: 'Tertunda 3 Hari',
      gps_valid: false,
      alert: 'Logbook terlambat & 1 izin ortu belum terunggah',
    },
    {
      id: 'kelompok-05',
      nama: 'Kelompok 05',
      desa: 'Desa Tanjung Karang, Babakan Madang',
      jarak_km: 24.5,
      izin_ortu: 'Radius Standar (<50km)',
      dpl: 'Dr. Ratna Juwita, M.Pd.',
      anggota: 5,
      jam_kerja: '156 / 200 Jam',
      logbook_status: 'Lancar',
      gps_valid: true,
      alert: null,
    },
    {
      id: 'kelompok-31',
      nama: 'Kelompok 31',
      desa: 'Desa Pabuaran, Sukabumi',
      jarak_km: 94.0,
      izin_ortu: 'Lengkap (5/5)',
      dpl: 'Dr. H. Muhammad Ridwan, M.M.',
      anggota: 5,
      jam_kerja: '128 / 200 Jam',
      logbook_status: 'Lancar',
      gps_valid: true,
      alert: null,
    },
  ];

  const filteredGroups = groups.filter((g) => {
    const matchSearch =
      g.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.desa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.dpl.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === 'alert') return matchSearch && g.alert !== null;
    if (filterStatus === 'ok') return matchSearch && g.alert === null;
    return matchSearch;
  });

  return (
    <DashboardLayout title="Monitoring Kelompok KKN LPPM">
      <div className="space-y-6 font-jakarta">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Monitoring Real-Time Kelompok KKN
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Pengawasan kehadiran logbook harian, status GPS lapangan, dan kepatuhan izin lintas 148 kelompok.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Mengirim pengingat serentak ke semua kelompok aktif')}
            className="text-xs font-bold gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Broadcast Notifikasi</span>
          </Button>
        </div>

        {/* Alert Card Atensi Khusus */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold">Perhatian: Terdeteksi 1 Kelompok Memerlukan Tindak Lanjut</p>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              Kelompok 22 di Desa Cibodas Asri belum mengunggah logbook selama 3 hari berturut-turut dan masih memiliki 1 anggota tanpa Surat Izin Orang Tua yang sah.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-slate-200 dark:border-navy-800">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kelompok, desa, atau nama dosen DPL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs text-navy-950 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterStatus === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-300'
              }`}
            >
              Semua ({groups.length})
            </button>
            <button
              onClick={() => setFilterStatus('alert')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterStatus === 'alert'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-300'
              }`}
            >
              Perlu Atensi (1)
            </button>
            <button
              onClick={() => setFilterStatus('ok')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                filterStatus === 'ok'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-navy-900 text-slate-700 dark:text-slate-300'
              }`}
            >
              Normal (4)
            </button>
          </div>
        </Card>

        {/* Tabel Monitoring */}
        <Card className="p-6 border-slate-200 dark:border-navy-800 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-900/80 text-slate-500 border-b border-slate-200 dark:border-navy-800">
                  <th className="p-3 font-bold rounded-l-xl">Kelompok & Lokasi Desa</th>
                  <th className="p-3 font-bold">Dosen DPL</th>
                  <th className="p-3 font-bold">Akumulasi Jam</th>
                  <th className="p-3 font-bold">Status Logbook</th>
                  <th className="p-3 font-bold">Izin Ortu (&gt;50km)</th>
                  <th className="p-3 font-bold text-right rounded-r-xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {filteredGroups.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-900/50">
                    <td className="p-3">
                      <p className="font-bold text-navy-950 dark:text-white flex items-center gap-1.5">
                        <span>{g.nama}</span>
                        {g.alert && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>
                          {g.desa} ({g.jarak_km} km)
                        </span>
                      </p>
                    </td>
                    <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{g.dpl}</td>
                    <td className="p-3 font-bold text-primary font-mono">{g.jam_kerja}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          g.alert
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {g.logbook_status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{g.izin_ortu}</td>
                    <td className="p-3 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.info(`Membuka rincian monev ${g.nama}`)}
                        className="text-xs font-bold gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
