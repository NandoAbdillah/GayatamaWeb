'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/services';
import { LuaranAkhir, Proposal } from '@/lib/types';
import {
  Award,
  ExternalLink,
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  Share2,
  QrCode,
  Sparkles,
  Download,
  Loader2,
  Inbox,
} from 'lucide-react';
import { toast } from 'sonner';

export default function MahasiswaPortofolioPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [luaran, setLuaran] = useState<LuaranAkhir | null>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortofolioData() {
      try {
        setLoading(true);
        // 1. Fetch current student's proposals
        const props = await api.proposal.getMyProposals();
        const propList = Array.isArray(props) ? props : [];
        setProposals(propList);

        if (propList.length > 0) {
          const activeProp = propList[0];
          // 2. Fetch deliverable luaran
          try {
            const lData = await api.luaran.getByProposal(activeProp.id);
            if (lData) setLuaran(lData);
          } catch {
            setLuaran(null);
          }
        }

        // 3. Fetch certificates
        try {
          const certRes = await api.luaran.getMyCertificates();
          if (certRes?.certificates) {
            setCertificates(certRes.certificates);
          }
        } catch {
          setCertificates([]);
        }
      } catch (err) {
        console.error('Error memuat data portofolio:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPortofolioData();
  }, []);

  const activeProp = proposals[0] || null;
  const desaName = activeProp?.posKebutuhan?.desa?.nama_desa || 'Desa Mitra';
  const latestCert = certificates[0] || null;

  const handleDownloadCert = () => {
    if (!latestCert) {
      toast.error('Sertifikat belum diterbitkan oleh pihak Desa dan LPPM.');
      return;
    }
    const url = api.luaran.getCertificateDownloadUrl(latestCert.certificate_code);
    window.open(url, '_blank');
    toast.success('Membuka dokumen E-Sertifikat resmi.');
  };

  return (
    <DashboardLayout title="Luaran Akhir & Portofolio Publik KKN">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
              Luaran Akhir & Portofolio
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-jakarta mt-0.5">
              Setiap karya pengabdian yang disahkan desa akan diterbitkan menjadi portofolio publik terverifikasi.
            </p>
          </div>

          {luaran?.portofolio_publik?.slug && (
            <Link href={`/portofolio/${luaran.portofolio_publik.slug}`} target="_blank">
              <Button variant="secondary" size="md" className="gap-2 text-xs font-semibold">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Lihat Portofolio Publik</span>
              </Button>
            </Link>
          )}
        </div>

        {/* Certificate Claim Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-ambient flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/30 border border-emerald-400/50 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold font-epilogue">
                Sertifikat Digital KKN BaktiNusantara
              </h3>
              <p className="text-xs text-emerald-100 font-jakarta">
                {latestCert
                  ? `Sertifikat No: ${latestCert.certificate_code} • Diterbitkan resmi untuk pengabdian di Desa ${desaName}`
                  : `Disahkan oleh LPPM & Kepala Desa ${desaName} setelah seluruh BAST tuntas ditandatangani.`}
              </p>
            </div>
          </div>

          <Button
            onClick={handleDownloadCert}
            size="sm"
            variant="emerald"
            className="whitespace-nowrap font-bold gap-1.5"
            disabled={!latestCert}
          >
            <Download className="w-4 h-4" />
            <span>{latestCert ? 'Unduh E-Sertifikat Digital' : 'Belum Diterbitkan'}</span>
          </Button>
        </div>

        {/* Luaran Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
              Berkas Luaran Akhir Tim Pengabdian
            </h2>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Memuat berkas luaran akhir...</p>
            </div>
          ) : !luaran ? (
            <Card className="p-12 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-navy-800 text-primary flex items-center justify-center mx-auto">
                <Inbox className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                  Belum Ada Luaran Akhir Diunggah
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Setelah rangkaian program kerja dan logbook mingguan terlaksana, unggah luaran akhir (produk, dokumen, atau video) untuk disahkan oleh pihak desa.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Card className="p-6 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 flex flex-col justify-between space-y-4 shadow-ambient">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/70 px-2.5 py-0.5 rounded-full">
                      Luaran Akhir KKN
                    </span>
                    <StatusBadge status={luaran.status_verifikasi || 'pending'} size="sm" />
                  </div>

                  <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue leading-snug">
                    {luaran.deskripsi || 'Dokumentasi & Produk Deliverable Pengabdian'}
                  </h3>

                  {luaran.testimoni_desa && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                      <span className="font-bold">Testimoni Kepala Desa:</span>
                      <p className="italic">&ldquo;{luaran.testimoni_desa}&rdquo;</p>
                    </div>
                  )}

                  {luaran.ringkasan_dampak && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      <strong>Ringkasan Dampak:</strong> {luaran.ringkasan_dampak}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-navy-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Status Verifikasi Desa:</span>
                    <span className="font-semibold text-navy-900 dark:text-slate-200 capitalize">
                      {luaran.status_verifikasi}
                    </span>
                  </div>

                  {luaran.portofolio_publik?.slug ? (
                    <Link href={`/portofolio/${luaran.portofolio_publik.slug}`} target="_blank">
                      <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 mt-2">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka Halaman Portofolio Publik</span>
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
