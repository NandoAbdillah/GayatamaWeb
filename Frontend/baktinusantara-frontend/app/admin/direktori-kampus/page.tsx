'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Building2,
  GraduationCap,
  Search,
  Filter,
  Users,
  Award,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  MapPin,
  X,
  Plus,
} from 'lucide-react';
import api from '@/lib/services';

interface UnivItem {
  id: number;
  nama_universitas: string;
  kode_univ: string;
  kota?: string;
  status?: string;
}

interface DosenItem {
  id: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  universitas?: {
    id: number;
    nama_universitas: string;
    kode_univ: string;
  };
  nip: string;
  no_hp?: string;
}

const FALLBACK_UNIVS: UnivItem[] = [
  {
    id: 1,
    nama_universitas: 'Universitas Negeri Surabaya',
    kode_univ: 'UNESA',
    kota: 'Surabaya, Jawa Timur',
    status: 'verified',
  },
  {
    id: 2,
    nama_universitas: 'Institut Teknologi Sepuluh Nopember',
    kode_univ: 'ITS',
    kota: 'Surabaya, Jawa Timur',
    status: 'verified',
  },
  {
    id: 3,
    nama_universitas: 'Universitas Airlangga',
    kode_univ: 'UNAIR',
    kota: 'Surabaya, Jawa Timur',
    status: 'pending',
  },
];

const FALLBACK_DOSEN: DosenItem[] = [
  {
    id: 1,
    user: { id: 2, name: 'Dr. Budi Santoso, M.Kom.', email: 'dosen.budi@unesa.ac.id' },
    universitas: { id: 1, nama_universitas: 'Universitas Negeri Surabaya', kode_univ: 'UNESA' },
    nip: '198001012005011001',
    no_hp: '081234567101',
  },
  {
    id: 2,
    user: { id: 3, name: 'Dr. Retno Wulandari, M.Pd.', email: 'dosen.retno@unesa.ac.id' },
    universitas: { id: 1, nama_universitas: 'Universitas Negeri Surabaya', kode_univ: 'UNESA' },
    nip: '198503152010122002',
    no_hp: '081234567102',
  },
  {
    id: 3,
    user: { id: 4, name: 'Ir. Agus Setiawan, M.T.', email: 'dosen.agus@its.ac.id' },
    universitas: { id: 2, nama_universitas: 'Institut Teknologi Sepuluh Nopember', kode_univ: 'ITS' },
    nip: '197908202003121003',
    no_hp: '081234567103',
  },
];

export default function AdminDirektoriKampusPage() {
  const [activeTab, setActiveTab] = useState<'universitas' | 'dosen'>('universitas');
  const [univList, setUnivList] = useState<UnivItem[]>(FALLBACK_UNIVS);
  const [dosenList, setDosenList] = useState<DosenItem[]>(FALLBACK_DOSEN);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniv, setSelectedUniv] = useState<UnivItem | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [univs, dosens] = await Promise.allSettled([
          api.universitas.getUniversitasList(),
          api.dosen.getAllDosen(),
        ]);

        if (univs.status === 'fulfilled' && Array.isArray(univs.value) && univs.value.length > 0) {
          setUnivList(univs.value);
        }
        if (dosens.status === 'fulfilled' && Array.isArray(dosens.value) && dosens.value.length > 0) {
          setDosenList(dosens.value);
        }
      } catch (err) {
        console.warn('Fallback to seeded campus data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredUniv = univList.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.nama_universitas.toLowerCase().includes(q) ||
      u.kode_univ.toLowerCase().includes(q) ||
      (u.kota || '').toLowerCase().includes(q)
    );
  });

  const filteredDosen = dosenList.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      (d.user?.name || '').toLowerCase().includes(q) ||
      (d.user?.email || '').toLowerCase().includes(q) ||
      d.nip.toLowerCase().includes(q) ||
      (d.universitas?.nama_universitas || '').toLowerCase().includes(q) ||
      (d.universitas?.kode_univ || '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout title="Direktori Perguruan Tinggi & Dosen Pembimbing (DPL)">
      <div className="space-y-6 font-jakarta">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Direktori Perguruan Tinggi & Dosen DPL
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Super Admin memantau seluruh lembaga perguruan tinggi mitra terakreditasi dan dewan dosen pembimbing lapangan di platform BaktiNusantara.
            </p>
          </div>
        </div>

        {/* Tab & Search Bar */}
        <Card className="p-4 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 w-full md:w-auto">
              <button
                onClick={() => setActiveTab('universitas')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'universitas'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Perguruan Tinggi ({univList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('dosen')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'dosen'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Dosen Pembimbing DPL ({dosenList.length})</span>
              </button>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeTab === 'universitas'
                    ? 'Cari nama kampus atau kode...'
                    : 'Cari dosen, NIP, atau kampus...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-navy-950 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </Card>

        {/* Tab 1: Perguruan Tinggi */}
        {activeTab === 'universitas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUniv.length === 0 ? (
              <div className="col-span-full">
                <Card className="p-10 text-center border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
                  <p className="text-xs text-slate-400">Tidak ada perguruan tinggi yang cocok dengan pencarian.</p>
                </Card>
              </div>
            ) : (
              filteredUniv.map((u) => {
                const dosenCount = dosenList.filter((d) => d.universitas?.kode_univ === u.kode_univ).length;

                return (
                  <Card
                    key={u.id}
                    className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold text-sm font-epilogue">
                          {u.kode_univ.slice(0, 3)}
                        </div>

                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Terverifikasi
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                          {u.nama_universitas}
                        </h3>
                        <p className="text-xs font-mono text-primary font-semibold mt-0.5">
                          Kode Kampus: {u.kode_univ}
                        </p>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.kota || 'Jawa Timur, Indonesia'}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dosenCount > 0 ? `${dosenCount} Dosen DPL Terdaftar` : '1+ Dosen DPL Terdaftar'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400">ID Lembaga #{u.id}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedUniv(u)}
                        className="text-xs font-semibold"
                      >
                        Detail Kampus
                      </Button>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Dosen Pembimbing DPL */}
        {activeTab === 'dosen' && (
          <div className="space-y-3">
            {filteredDosen.length === 0 ? (
              <Card className="p-10 text-center border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900">
                <p className="text-xs text-slate-400">Tidak ada dosen pembimbing yang cocok dengan pencarian.</p>
              </Card>
            ) : (
              filteredDosen.map((d) => (
                <Card
                  key={d.id}
                  className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-navy-950 dark:text-white font-epilogue">
                          {d.user?.name || 'Dr. Dosen Pembimbing'}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {d.universitas?.kode_univ || 'UNESA'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                        {d.universitas?.nama_universitas}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-mono pt-0.5">
                        <span>NIP: {d.nip}</span>
                        <span>•</span>
                        <span>Email: {d.user?.email}</span>
                        {d.no_hp && (
                          <>
                            <span>•</span>
                            <span>WA: {d.no_hp}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900">
                      DPL Aktif
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Modal Detail Kampus */}
        {selectedUniv && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-150">
            <Card className="w-full max-w-md p-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                      Profil Perguruan Tinggi Mitra
                    </h3>
                    <p className="text-xs text-slate-500">{selectedUniv.kode_univ}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUniv(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-jakarta">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800 space-y-2">
                  <p className="font-bold text-navy-950 dark:text-white text-sm">
                    {selectedUniv.nama_universitas}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-slate-500">
                    <div>Kode Singkat: <strong className="text-navy-950 dark:text-white font-mono">{selectedUniv.kode_univ}</strong></div>
                    <div>Status: <strong className="text-emerald-600">Terverifikasi Resmi</strong></div>
                    <div>Domisili: <span>{selectedUniv.kota || 'Surabaya, Jawa Timur'}</span></div>
                    <div>ID Backend: <span className="font-mono">#{selectedUniv.id}</span></div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-navy-800">
                <Button variant="outline" size="sm" onClick={() => setSelectedUniv(null)} className="text-xs">
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
