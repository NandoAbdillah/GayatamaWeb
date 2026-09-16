'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  MessageSquare,
  Star,
  CheckCircle2,
  AlertCircle,
  Filter,
  User,
  Building,
  Heart,
  Calendar,
  Send,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export default function KampusFeedbackPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      sender_role: 'warga_desa',
      sender_name: 'Bpk. Suryanto (Gapoktan Sukamaju)',
      target: 'Kelompok 14 — Otomatisasi Irigasi IoT',
      rating: 5,
      kategori: 'Apresiasi Kemanfaatan',
      isi: 'Alat sensor irigasi yang dipasang adik-adik mahasiswa sangat membantu pembagian air sawah. Sekarang warga tidak perlu berjaga malam di pintu air.',
      tanggal: '06 Sep 2026, 14:20 WIB',
      status: 'resolved',
    },
    {
      id: 2,
      sender_role: 'perangkat_desa',
      sender_name: 'Sekdes Sukamaju (Bpk. Mulyadi)',
      target: 'Kelompok 08 — Digitalisasi UMKM',
      rating: 4,
      kategori: 'Saran Keberlanjutan',
      isi: 'Mohon agar admin sistem di desa diberikan pelatihan tambahan sebelum mahasiswa ditarik kembali ke kampus agar website UMKM tetap terupdate.',
      tanggal: '05 Sep 2026, 10:15 WIB',
      status: 'pending',
    },
    {
      id: 3,
      sender_role: 'dosen',
      sender_name: 'Dr. Ir. Hendra Gunawan, M.T. (DPL)',
      target: 'Fasilitas & Transportasi LPPM',
      rating: 4,
      kategori: 'Evaluasi Logistik',
      isi: 'Koordinasi dengan Pemdes Sukamaju berjalan sangat baik. Mohon untuk periode berikutnya bantuan akomodasi monitoring dosen dipercepat pencairannya.',
      tanggal: '04 Sep 2026, 16:30 WIB',
      status: 'resolved',
    },
    {
      id: 4,
      sender_role: 'mahasiswa',
      sender_name: 'Muhammad Raihan Pratama (Ketua Tim)',
      target: 'Kurikulum & Konversi SKS',
      rating: 5,
      kategori: 'Refleksi Lapangan',
      isi: 'Pengalaman pengabdian di Desa Sukamaju membuka wawasan teknis nyata. Modul pengesahan BAST digital sangat mempermudah proses legalitas luaran kami.',
      tanggal: '03 Sep 2026, 19:40 WIB',
      status: 'resolved',
    },
  ]);

  const handleResolve = (id: number) => {
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: 'resolved' } : f))
    );
    toast.success('Umpan balik telah ditandai selesai ditindaklanjuti');
  };

  const filtered = feedbacks.filter((f) => {
    if (activeFilter === 'all') return true;
    return f.sender_role === activeFilter;
  });

  return (
    <DashboardLayout
      title="Pusat Umpan Balik Stakeholder KKN"
      breadcrumb={[
        { label: 'Umpan Balik Stakeholder' },
      ]}
    >
      <div className="space-y-6 font-jakarta">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Pusat Umpan Balik & Evaluasi Multi-Stakeholder
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Evaluasi berkelanjutan dari warga desa, perangkat desa, dosen DPL, dan mahasiswa pelaksana KKN.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>94.2% Kepuasan Positif</span>
            </span>
          </div>
        </div>

        {/* Filter Role Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'Semua Umpan Balik' },
            { key: 'warga_desa', label: 'Warga Masyarakat' },
            { key: 'perangkat_desa', label: 'Pemerintah Desa' },
            { key: 'dosen', label: 'Dosen Pembimbing' },
            { key: 'mahasiswa', label: 'Refleksi Mahasiswa' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === tab.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white dark:bg-navy-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-navy-800 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List Umpan Balik */}
        <div className="space-y-4">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="p-6 space-y-4 border-slate-200 dark:border-navy-800 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-navy-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-navy-950 dark:text-white">
                      {item.sender_name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 capitalize">
                      {item.sender_role.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-primary font-medium">Terkait: {item.target}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= item.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <StatusBadge
                    status={item.status === 'resolved' ? 'approved' : 'pending'}
                    label={item.status === 'resolved' ? 'Ditindaklanjuti' : 'Perlu Respon'}
                    size="sm"
                  />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                "{item.isi}"
              </p>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                <span>{item.tanggal}</span>

                {item.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="emerald"
                    onClick={() => handleResolve(item.id)}
                    className="text-xs font-bold gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tandai Selesai Ditindaklanjuti</span>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
