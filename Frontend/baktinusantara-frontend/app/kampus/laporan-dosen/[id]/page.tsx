"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  FileText,
  Calendar,
  Building,
  Users,
  ArrowLeft,
  Send,
  FileX,
  AlertTriangle,
  X,
  Download,
  Clock,
  MapPin,
  ClipboardList,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/services";
import {
  INITIAL_LAPORAN,
  LaporanDosen,
  STORAGE_KEY,
} from "@/lib/data/laporan-dosen";

export default function LaporanDosenReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [laporan, setLaporan] = useState<LaporanDosen | null>(null);
  const [loading, setLoading] = useState(true);
  const [revisiMode, setRevisiMode] = useState(false);
  const [revisiNote, setRevisiNote] = useState("");
  const [revisiExpanded, setRevisiExpanded] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let found: LaporanDosen | undefined;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: LaporanDosen[] = JSON.parse(stored);
          found = parsed.find((x) => x.id === id);
          if (found) {
            setLaporan(found);
            if (found.alasanRevisi) setRevisiExpanded(false);
            setLoading(false);
            return;
          }
        }
      } catch {}
      try {
        const data = await api.universitas.getLaporanDosen();
        if (Array.isArray(data) && data.length > 0) {
          const normalized: LaporanDosen[] = data.map((item: any) => ({
            id: item.id,
            dosen: item.dosen?.name || "Dr. Budi Utomo, M.Kom",
            nip: item.dosen?.nip || "197508122003121002",
            kelompok: item.proposal?.judul
              ? `Kelompok ${item.proposal_id}`
              : "Kelompok Binaan KKN",
            desa: item.desa?.nama_desa || "Desa Sukamaju",
            tanggal_kunjungan: item.created_at
              ? new Date(item.created_at).toLocaleDateString("id-ID")
              : "Baru saja",
            jenis_supervisi: "Supervisi & Evaluasi Lapangan",
            status:
              item.status === "selesai"
                ? "disetujui"
                : item.status === "ditinjau"
                  ? "menunggu"
                  : "menunggu",
            ringkasan:
              item.isi ||
              "Laporan hasil monev kinerja kelompok mahasiswa KKN di desa mitra.",
            catatan_dpl:
              item.catatan ||
              "Kinerja pengabdian terlaksana sesuai rencana kerja.",
            lampiran_url: item.lampiran_url || item.file_url || "",
            lampiran_name: item.lampiran_name || item.file_name || undefined,
          }));
          found = normalized.find((x) => x.id === id);
          if (found) {
            setLaporan(found);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Review load API fallback:", err);
      }
      found = INITIAL_LAPORAN.find((x) => x.id === id);
      if (found) setLaporan(found);
      setLoading(false);
    }
    if (!isNaN(id)) load();
    else setLoading(false);
  }, [id]);

  const persistUpdate = (updated: LaporanDosen) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let list: LaporanDosen[] = [];
      if (stored) list = JSON.parse(stored);
      else list = [...INITIAL_LAPORAN];
      const idx = list.findIndex((x) => x.id === updated.id);
      if (idx >= 0) list[idx] = updated;
      else list.push(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  };

  const handleApprove = async () => {
    if (!laporan) return;
    setSubmitting(true);
    try {
      await api.universitas.updateLaporanStatus(laporan.id, "selesai");
    } catch (err) {
      console.warn("Backend approve error:", err);
    }
    const updated: LaporanDosen = { ...laporan, status: "disetujui" };
    setLaporan(updated);
    persistUpdate(updated);
    toast.success("Laporan supervisi DPL berhasil disetujui oleh LPPM!");
    setShowApproveConfirm(false);
    setSubmitting(false);
  };

  const handleSendRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!laporan) return;
    if (!revisiNote.trim()) {
      toast.error("Harap isi alasan revisi terlebih dahulu");
      return;
    }
    setSubmitting(true);
    try {
      await api.universitas.updateLaporanStatus(laporan.id, "ditinjau");
    } catch (err) {
      console.warn("Backend revisi error:", err);
    }
    const updated: LaporanDosen = {
      ...laporan,
      status: "revisi",
      alasanRevisi: revisiNote.trim(),
      alasanRevisiAt: new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setLaporan(updated);
    persistUpdate(updated);
    toast.info("Catatan revisi telah dikirim ke email Dosen DPL.");
    setRevisiMode(false);
    setRevisiNote("");
    setRevisiExpanded(true);
    setSubmitting(false);
  };

  const hasFile =
    !!laporan?.lampiran_url &&
    laporan.lampiran_url.trim() !== "" &&
    laporan.lampiran_url.trim() !== "#";

  const fileName =
    laporan?.lampiran_name ||
    (hasFile ? laporan?.lampiran_url.split("/").pop() : undefined) ||
    "";

  const handleDownload = () => {
    if (!hasFile) return;
    toast.success(`Mengunduh ${fileName}...`);
    if (
      laporan?.lampiran_url.startsWith("http") ||
      laporan?.lampiran_url.startsWith("/")
    ) {
      const a = document.createElement("a");
      a.href = laporan!.lampiran_url;
      a.download = fileName || "lampiran.pdf";
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Review Laporan DPL">
        <div className="space-y-4 animate-pulse w-full">
          <div className="h-10 w-32 bg-slate-200 rounded-xl" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
          <div className="h-48 bg-slate-100 rounded-2xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!laporan) {
    return (
      <DashboardLayout title="Review Laporan DPL">
        <div className="space-y-6 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/kampus/laporan-dosen")}
            className="gap-1.5 bg-white border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Button>
          <Card className="p-10 text-center border-dashed">
            <p className="text-sm font-bold text-slate-600">
              Laporan tidak ditemukan
            </p>
            <p className="text-xs text-slate-400 mt-1">
              ID #{id} tidak tersedia di data LPPM.
            </p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const isDisetujui = laporan.status === "disetujui";

  return (
    <DashboardLayout title={`Review — ${laporan.jenis_supervisi}`}>
      <div className="space-y-6 w-full">
        {/* Tombol Kembali - putih */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/kampus/laporan-dosen")}
          className="gap-1.5 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </Button>

        {/* Single Card - semua digabung jadi satu, dibatasi garis hitam tipis */}
        <Card className="overflow-hidden border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-md p-0">
          {/* Baris 1: Identitas Dosen Pembimbing */}
          <div className="p-6 space-y-4 border-slate-200 dark:border-navy-800">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Identitas Dosen Pembimbing</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white shadow-md shrink-0">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-navy-950 dark:text-white font-epilogue leading-tight">
                  {laporan.dosen}
                </h3>
                <p className="text-xs font-mono text-slate-500 mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  NIP {laporan.nip}
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Kelompok Binaan
                    </p>
                    <p className="text-sm font-bold text-navy-950 dark:text-white mt-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      {laporan.kelompok}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-100 dark:border-navy-800">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Lokasi Penugasan
                    </p>
                    <p className="text-sm font-bold text-navy-950 dark:text-white mt-1 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-emerald-600" />
                      {laporan.desa}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Garis tipis */}
          <div className="h-px bg-slate-200 dark:bg-navy-800" />

          {/* Baris 2: Laporan */}
          <div className="p-6 space-y-4">
            <p className="text-lg sm:text-xl font-black text-navy-950 dark:text-white font-epilogue leading-tight">
              {laporan.jenis_supervisi}
            </p>
            <p className="text-sm sm:text-[15px] text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {laporan.ringkasan}
            </p>
            <div className="pt-2 space-y-2">
              <p className="text-xs font-bold text-navy-950 dark:text-white">
                Catatan :
              </p>
              <div className="rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 p-3.5">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic whitespace-pre-line">
                  “{laporan.catatan_dpl}”
                </p>
              </div>
            </div>

            {/* Hasil revisi - dropdown di bawah catatan */}
            {laporan.alasanRevisi && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setRevisiExpanded((v) => !v)}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary-600 transition-colors"
                >
                  {revisiExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {revisiExpanded
                      ? "Sembunyikan Tanggapan"
                      : "Lihat Tanggapan"}
                  </span>
                  {laporan.alasanRevisiAt && (
                    <p className="text-[11px] font-normal text-slate-400">
                      ({laporan.alasanRevisiAt})
                    </p>
                  )}
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${revisiExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/20 p-3.5 space-y-1">
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {laporan.alasanRevisi}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Input tanggapan - smooth muncul di bawah catatan */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${revisiMode ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <div className="pt-4 mt-2 border-t border-slate-200 dark:border-navy-800 space-y-3">
                  <h4 className="text-sm font-black text-navy-950 dark:text-white">
                    Berikan tanggapan
                  </h4>
                  <form onSubmit={handleSendRevision} className="space-y-3">
                    <textarea
                      required
                      rows={4}
                      value={revisiNote}
                      onChange={(e) => setRevisiNote(e.target.value)}
                      placeholder="Tuliskan alasan revisi / tanggapan untuk DPL..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-950 text-xs sm:text-sm text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setRevisiMode(false)}
                        className="text-xs bg-white"
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={submitting}
                        className="gap-1.5 font-bold text-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim</span>
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Garis tipis */}
          <div className="h-px bg-slate-200 dark:bg-navy-800" />

          {/* Lampiran + Aksi sejajar: kiri nama file + ikon hitam, kanan tombol revisi/setujui */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Kiri: Lampiran */}
              <div className="flex-1 min-w-0">
                {hasFile ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-navy-950 dark:text-white truncate">
                      {fileName}
                    </span>
                    <button
                      onClick={handleDownload}
                      title="Unduh lampiran"
                      aria-label="Unduh lampiran"
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-black hover:bg-slate-50 shadow-sm shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    Tidak Ada File Terkirim
                  </p>
                )}
              </div>

              {/* Kanan: Tombol Revisi & Setujui - sejajar dengan nama file, hilang jika Disetujui */}
              {!isDisetujui && (
                <div className="flex gap-2 shrink-0">
                  <Button
                    onClick={() => {
                      setShowApproveConfirm(false);
                      setRevisiMode((v) => !v);
                    }}
                    variant="outline"
                    size="sm"
                    className={`gap-1.5 font-bold border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950 bg-white ${revisiMode ? "bg-rose-50" : ""}`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>{revisiMode ? "Tutup Revisi" : "Revisi"}</span>
                  </Button>
                  <Button
                    onClick={() => setShowApproveConfirm(true)}
                    variant="emerald"
                    size="sm"
                    className="gap-1.5 font-bold shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Setujui Laporan</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Popup Verifikasi Setujui */}
      {showApproveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-700 shadow-2xl space-y-4">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                  Setujui Laporan Supervisi?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Anda akan menyetujui laporan{" "}
                  <span className="font-bold text-navy-950 dark:text-white">
                    {laporan.jenis_supervisi}
                  </span>{" "}
                  oleh{" "}
                  <span className="font-bold text-navy-950 dark:text-white">
                    {laporan.dosen}
                  </span>{" "}
                  untuk{" "}
                  <span className="font-semibold">{laporan.kelompok}</span>.
                  Pastikan seluruh isi sudah sesuai.
                </p>
              </div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="flex gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Laporan yang disetujui akan tercatat sebagai sah oleh LPPM dan
                  tidak dapat direvisi kembali.
                </span>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowApproveConfirm(false)}
                className="w-1/2 text-xs bg-white"
                disabled={submitting}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                <span>Batal</span>
              </Button>
              <Button
                type="button"
                variant="emerald"
                onClick={handleApprove}
                isLoading={submitting}
                className="w-1/2 text-xs font-bold gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ya, Setujui</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
