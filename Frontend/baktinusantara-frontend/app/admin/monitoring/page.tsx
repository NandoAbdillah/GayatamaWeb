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
  FileCheck2,
  Building,
  GraduationCap,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface GroupMonitoringItem {
  id: string;
  nama: string;
  universitas: string;
  desa: string;
  jarak_km: number;
  izin_ortu: string;
  dpl: string;
  anggota_count: number;
  jam_kerja: string;
  progres_pct: number;
  logbook_status: string;
  gps_valid: boolean;
  alert: string | null;
}

const SEEDED_MONITORING_GROUPS: GroupMonitoringItem[] = [
  {
    id: 'kelompok-1',
    nama: 'KKN UNESA 01 - Sukamaju Digital',
    universitas: 'Universitas Negeri Surabaya (UNESA)',
    desa: 'Desa Sukamaju, Mojowarno, Jombang',
    jarak_km: 15.5,
    izin_ortu: 'Radius Standar (<1000 km)',
    dpl: 'Dr. Budi Santoso, M.Kom.',
    anggota_count: 3,
    jam_kerja: '160 / 160 Jam (100%)',
    progres_pct: 100,
    logbook_status: 'Tuntas Minggu 4 (Verified)',
    gps_valid: true,
    alert: null,
  },
  {
    id: 'kelompok-2',
    nama: 'KKN ITS Berkah Hijau',
    universitas: 'Institut Teknologi Sepuluh Nopember (ITS)',
    desa: 'Desa Berkah Makmur, Prigen, Pasuruan',
    jarak_km: 1250.0,
    izin_ortu: 'Lengkap (>1000 km Terunggah)',
    dpl: 'Ir. Agus Setiawan, M.T.',
    anggota_count: 2,
    jam_kerja: '80 / 160 Jam (50%)',
    progres_pct: 60,
    logbook_status: 'Lancar Minggu 2 (60%)',
    gps_valid: true,
    alert: null,
  },
  {
    id: 'kelompok-3',
    nama: 'KKN UNESA 02 - Edukasi Cempaka',
    universitas: 'Universitas Negeri Surabaya (UNESA)',
    desa: 'Desa Cempaka Putih, Pacet, Mojokerto',
    jarak_km: 28.3,
    izin_ortu: 'Radius Standar (<1000 km)',
    dpl: 'Dr. Retno Wulandari, M.Pd.',
    anggota_count: 1,
    jam_kerja: '0 / 160 Jam (0%)',
    progres_pct: 0,
    logbook_status: 'Proposal Baru (Menunggu)',
    gps_valid: true,
    alert: 'Menunggu persetujuan proposal dari pihak desa',
  },
];

export default function AdminMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUniv, setSelectedUniv] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState<GroupMonitoringItem | null>(null);

  const filteredGroups = SEEDED_MONITORING_GROUPS.filter((g) => {
    const matchSearch =
      g.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.desa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.universitas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.dpl.toLowerCase().includes(searchTerm.toLowerCase());
    const matchUniv = selectedUniv === 'all' || g.universitas.toLowerCase().includes(selectedUniv.toLowerCase());
    const matchStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'alert'
        ? g.alert !== null
        : g.alert === null;
    return matchSearch && matchUniv && matchStatus;
  });

  return (
    <DashboardLayout
      title="Sebaran Nasional & Pemantauan Program KKN"
      breadcrumb={[
        { label: 'Sebaran Nasional KKN' },
      ]}
    >
      <div className="space-y-6 font-jakarta">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <MapPin className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
                Pusat Pemantauan Sebaran Nasional Program KKN
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Super Admin mengawasi kepatuhan operasional seluruh perguruan tinggi, kepatuhan radius jarak (&gt;1.000 km), dan koordinasi antar-instansi se-Indonesia.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Mengirim pengingat notifikasi serentak ke semua ketua kelompok')}
            className="text-xs font-bold gap-1.5"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Broadcast Notifikasi</span>
          </Button>
        </div>

        {/* National Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Kelompok Aktif</span>
            <p className="text-xl sm:text-2xl font-black text-navy-950 dark:text-white mt-1">3 <span className="text-xs font-semibold text-slate-500 font-sans">Kelompok</span></p>
          </Card>
          <Card className="p-4 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Perguruan Tinggi</span>
            <p className="text-xl sm:text-2xl font-black text-primary mt-1">2 <span className="text-xs font-semibold text-slate-500 font-sans">PTN/PTS Terlibat</span></p>
          </Card>
          <Card className="p-4 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Desa Mitra Terjangkau</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">3 <span className="text-xs font-semibold text-slate-500 font-sans">Desa (Jatim & Jabar)</span></p>
          </Card>
          <Card className="p-4 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Perlu Tindakan/Izin</span>
            <p className="text-xl sm:text-2xl font-black text-amber-500 mt-1">1 <span className="text-xs font-semibold text-slate-500 font-sans">Kelompok</span></p>
          </Card>
        </div>

        {/* Filter & Search Bar */}
        <Card className="p-4 flex flex-col md:flex-row items-center justify-between gap-3 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto flex-1">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari kelompok, desa, DPL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <select
              value={selectedUniv}
              onChange={(e) => setSelectedUniv(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Semua Universitas</option>
              <option value="unesa">Universitas Negeri Surabaya (UNESA)</option>
              <option value="its">Institut Teknologi Sepuluh Nopember (ITS)</option>
              <option value="unair">Universitas Airlangga (UNAIR)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Semua ({SEEDED_MONITORING_GROUPS.length})
            </button>
            <button
              onClick={() => setFilterStatus('alert')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === 'alert'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Perlu Perhatian (1)
            </button>
            <button
              onClick={() => setFilterStatus('ok')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterStatus === 'ok'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Berjalan Normal (2)
            </button>
          </div>
        </Card>

        {/* Tabel Monitoring */}
        <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-navy-950 text-slate-500 border-b border-slate-200 dark:border-navy-800">
                  <th className="p-3 font-bold rounded-l-xl">Kelompok & Kampus Asal</th>
                  <th className="p-3 font-bold">Lokasi Desa Mitra</th>
                  <th className="p-3 font-bold">Dosen DPL</th>
                  <th className="p-3 font-bold">Akumulasi Jam</th>
                  <th className="p-3 font-bold">Status Logbook</th>
                  <th className="p-3 font-bold">Izin Ortu (&gt;1000km)</th>
                  <th className="p-3 font-bold text-right rounded-r-xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                {filteredGroups.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/80 dark:hover:bg-navy-900/50 transition-colors">
                    <td className="p-3">
                      <p className="font-bold text-navy-950 dark:text-white flex items-center gap-1.5">
                        <span>{g.nama}</span>
                        {g.alert && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                      </p>
                      <p className="text-[11px] text-primary font-medium mt-0.5">
                        {g.universitas}
                      </p>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-slate-700 dark:text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{g.desa}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Jarak: {g.jarak_km} km
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
                        onClick={() => setSelectedGroup(g)}
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

        {/* Modal Detail Monitoring */}
        {selectedGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
            <Card className="w-full max-w-lg p-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                      Rincian Pelaksanaan Kelompok KKN
                    </h3>
                    <p className="text-xs text-slate-500">{selectedGroup.nama}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-jakarta">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>Institusi: <strong className="text-navy-950 dark:text-white">{selectedGroup.universitas}</strong></div>
                    <div>DPL: <strong className="text-navy-950 dark:text-white">{selectedGroup.dpl}</strong></div>
                    <div>Lokasi Mitra: <span className="text-slate-700 dark:text-slate-300">{selectedGroup.desa}</span></div>
                    <div>Jarak Asal: <span className="font-mono font-bold text-primary">{selectedGroup.jarak_km} km</span></div>
                    <div>Anggota: <span>{selectedGroup.anggota_count} Mahasiswa</span></div>
                    <div>Progres Siklus: <span className="font-bold text-emerald-600">{selectedGroup.progres_pct}%</span></div>
                  </div>
                </div>

                {selectedGroup.alert && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-800 dark:text-amber-200">
                    <p className="font-bold">Catatan Pengawasan:</p>
                    <p className="mt-0.5">{selectedGroup.alert}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-navy-800">
                <Button variant="outline" size="sm" onClick={() => setSelectedGroup(null)} className="text-xs">
                  Tutup
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
