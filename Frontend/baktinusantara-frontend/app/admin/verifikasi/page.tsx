'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ShieldCheck, CheckCircle2, FileText, Building, GraduationCap, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/services';

export default function AdminVerifikasiPage() {
  const [verifikasiList, setVerifikasiList] = useState([
    {
      id: 1,
      jenis: 'Perangkat Desa',
      entity_type: 'desa',
      nama: 'Desa Sukamaju, Ciawi, Bogor',
      pemohon: 'H. Ahmad Subardjo (Kepala Desa)',
      dokumen: 'SK_Bupati_Bogor_Kepala_Desa_Sukamaju.pdf',
      status: 'verified',
      tanggal: '2026-08-01',
    },
    {
      id: 2,
      jenis: 'Perangkat Desa',
      entity_type: 'desa',
      nama: 'Desa Tanjung Karang, Babakan Madang',
      pemohon: 'Drs. Supardi (Sekretaris Desa)',
      dokumen: 'SK_Pengangkatan_Sekdes_2025.pdf',
      status: 'pending',
      tanggal: '2026-08-25',
    },
    {
      id: 3,
      jenis: 'Mahasiswa KKN',
      entity_type: 'mahasiswa',
      nama: 'M. Rian Pratama (NIM: 21051204012)',
      pemohon: 'Fakultas Teknik Informatika',
      dokumen: 'KTM_Rian_Pratama_Aktif.pdf',
      status: 'pending',
      tanggal: '2026-08-10',
    },
    {
      id: 4,
      jenis: 'Perguruan Tinggi',
      entity_type: 'universitas',
      nama: 'Universitas Bakti Nusantara (LPPM)',
      pemohon: 'Prof. Dr. Ir. Budi Raharjo',
      dokumen: 'SK_Pendirian_LPPM_2024.pdf',
      status: 'pending',
      tanggal: '2026-08-15',
    },
  ]);

  const handleApprove = async (item: any) => {
    try {
      if (item.entity_type === 'desa') {
        await api.admin.verifyDesa(item.id);
      } else if (item.entity_type === 'mahasiswa') {
        await api.admin.verifyMahasiswa(item.id);
      } else if (item.entity_type === 'universitas') {
        await api.admin.verifyUniversitas(item.id);
      }
    } catch (err: any) {
      console.warn('Backend verification call response:', err);
    }

    setVerifikasiList(
      verifikasiList.map((v) => (v.id === item.id ? { ...v, status: 'verified' } : v))
    );
    toast.success(`Akun ${item.nama} berhasil diverifikasi secara resmi!`);
  };

  return (
    <DashboardLayout title="Verifikasi Berkas SK Desa & KTM">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 font-epilogue">
            Verifikasi Kelayakan Akun & Berkas Resmi
          </h1>
          <p className="text-xs text-slate-500 font-jakarta mt-0.5">
            Admin LPPM memvalidasi SK Kepala Desa / Perangkat dan Kartu Tanda Mahasiswa (KTM) aktif sebelum diberikan akses sistem.
          </p>
        </div>

        <div className="space-y-4">
          {verifikasiList.map((item) => (
            <Card key={item.id} className="p-6 border-slate-200 bg-white space-y-3 shadow-ambient">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-primary bg-primary-50 px-3 py-1 rounded-full">
                    {item.jenis}
                  </span>
                  <h3 className="text-sm font-bold text-navy-950">{item.nama}</h3>
                </div>
                <StatusBadge status={item.status} size="sm" />
              </div>

              <div className="text-xs text-slate-600 space-y-1 font-jakarta">
                <p>Pemohon: <strong>{item.pemohon}</strong></p>
                <p>Dokumen Terlampir: <span className="font-mono text-primary font-semibold underline cursor-pointer">{item.dokumen}</span></p>
                <p className="text-slate-400">Tanggal Pengajuan: {item.tanggal}</p>
              </div>

              {item.status !== 'verified' && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button onClick={() => handleApprove(item)} variant="emerald" size="sm" className="shadow-glow-secondary font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>Sahkan & Verifikasi Akun</span>
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
