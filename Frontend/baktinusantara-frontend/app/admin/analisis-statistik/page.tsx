"use client";

import React, { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Layers,
  Tag,
  X,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

interface KategoriKKN {
  id: string;
  nama: string;
  slug: string;
}

interface SektorKKN {
  id: string;
  nama: string;
  slug: string;
}

const INITIAL_KATEGORI: KategoriKKN[] = [
  { id: "1", nama: "Pemberdayaan UMKM", slug: "umkm" },
  { id: "2", nama: "Lingkungan", slug: "lingkungan" },
  { id: "3", nama: "Kesehatan", slug: "kesehatan" },
  { id: "4", nama: "Pendidikan", slug: "pendidikan" },
  { id: "5", nama: "Fasilitas", slug: "fasilitas" },
];

const INITIAL_SEKTOR: SektorKKN[] = [
  { id: "s1", nama: "Pertanian", slug: "pertanian" },
  { id: "s2", nama: "Perikanan", slug: "perikanan" },
  { id: "s3", nama: "Pariwisata", slug: "pariwisata" },
  { id: "s4", nama: "Teknologi", slug: "teknologi" },
  { id: "s5", nama: "Sosial Kemasyarakatan", slug: "sosial_kemasyarakatan" },
];

export default function AnalisisStatistikPage() {
  // Kategori state
  const [kategoriList, setKategoriList] =
    useState<KategoriKKN[]>(INITIAL_KATEGORI);
  const [kategoriSearch, setKategoriSearch] = useState("");
  const [kategoriNama, setKategoriNama] = useState("");
  const [kategoriEditingId, setKategoriEditingId] = useState<string | null>(
    null,
  );
  const [kategoriDeleteTarget, setKategoriDeleteTarget] =
    useState<KategoriKKN | null>(null);

  // Sektor state
  const [sektorList, setSektorList] = useState<SektorKKN[]>(INITIAL_SEKTOR);
  const [sektorSearch, setSektorSearch] = useState("");
  const [sektorNama, setSektorNama] = useState("");
  const [sektorEditingId, setSektorEditingId] = useState<string | null>(null);
  const [sektorDeleteTarget, setSektorDeleteTarget] =
    useState<SektorKKN | null>(null);

  // Kategori handlers
  const filteredKategori = kategoriList.filter((k) =>
    k.nama.toLowerCase().includes(kategoriSearch.toLowerCase()),
  );

  const handleKategoriSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kategoriNama.trim()) {
      toast.error("Nama kategori wajib diisi");
      return;
    }
    const slug = kategoriNama
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    if (kategoriEditingId) {
      if (
        kategoriList.some((k) => k.slug === slug && k.id !== kategoriEditingId)
      ) {
        toast.error("Kategori dengan nama tersebut sudah ada");
        return;
      }
      setKategoriList((prev) =>
        prev.map((k) =>
          k.id === kategoriEditingId
            ? { ...k, nama: kategoriNama.trim(), slug }
            : k,
        ),
      );
      toast.success(`Kategori "${kategoriNama}" diperbarui`);
      setKategoriEditingId(null);
    } else {
      if (kategoriList.some((k) => k.slug === slug)) {
        toast.error("Kategori sudah ada");
        return;
      }
      setKategoriList((prev) => [
        ...prev,
        { id: Date.now().toString(), nama: kategoriNama.trim(), slug },
      ]);
      toast.success(`Kategori "${kategoriNama}" ditambahkan`);
    }
    setKategoriNama("");
  };

  const handleKategoriEdit = (item: KategoriKKN) => {
    setKategoriEditingId(item.id);
    setKategoriNama(item.nama);
  };

  const handleKategoriCancel = () => {
    setKategoriEditingId(null);
    setKategoriNama("");
  };

  const handleKategoriDelete = () => {
    if (!kategoriDeleteTarget) return;
    setKategoriList((prev) =>
      prev.filter((k) => k.id !== kategoriDeleteTarget.id),
    );
    toast.success(`Kategori "${kategoriDeleteTarget.nama}" dihapus`);
    setKategoriDeleteTarget(null);
  };

  // Sektor handlers
  const filteredSektor = sektorList.filter((s) =>
    s.nama.toLowerCase().includes(sektorSearch.toLowerCase()),
  );

  const handleSektorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sektorNama.trim()) {
      toast.error("Nama sektor wajib diisi");
      return;
    }
    const slug = sektorNama
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    if (sektorEditingId) {
      if (sektorList.some((s) => s.slug === slug && s.id !== sektorEditingId)) {
        toast.error("Sektor dengan nama tersebut sudah ada");
        return;
      }
      setSektorList((prev) =>
        prev.map((s) =>
          s.id === sektorEditingId
            ? { ...s, nama: sektorNama.trim(), slug }
            : s,
        ),
      );
      toast.success(`Sektor "${sektorNama}" diperbarui`);
      setSektorEditingId(null);
    } else {
      if (sektorList.some((s) => s.slug === slug)) {
        toast.error("Sektor sudah ada");
        return;
      }
      setSektorList((prev) => [
        ...prev,
        { id: Date.now().toString(), nama: sektorNama.trim(), slug },
      ]);
      toast.success(`Sektor "${sektorNama}" ditambahkan`);
    }
    setSektorNama("");
  };

  const handleSektorEdit = (item: SektorKKN) => {
    setSektorEditingId(item.id);
    setSektorNama(item.nama);
  };

  const handleSektorCancel = () => {
    setSektorEditingId(null);
    setSektorNama("");
  };

  const handleSektorDelete = () => {
    if (!sektorDeleteTarget) return;
    setSektorList((prev) => prev.filter((s) => s.id !== sektorDeleteTarget.id));
    toast.success(`Sektor "${sektorDeleteTarget.nama}" dihapus`);
    setSektorDeleteTarget(null);
  };

  return (
    <DashboardLayout title="Manajemen Sektor & Kategori KKN">
      <div className="space-y-6 font-jakarta w-full">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white font-epilogue">
            Manajemen Sektor & Kategori KKN
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola kategori dan sektor untuk kebutuhan KKN
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kategori - Kiri */}
          <Card className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm w-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">
                  Kategori KKN
                </h2>
                <p className="text-[11px] text-slate-500">
                  Kelola kategori program KKN
                </p>
              </div>
            </div>

            <form onSubmit={handleKategoriSubmit} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    kategoriEditingId
                      ? "Edit kategori..."
                      : "Nama kategori baru..."
                  }
                  value={kategoriNama}
                  onChange={(e) => setKategoriNama(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-sm text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                variant="primary"
                className="gap-1.5 font-bold text-xs shrink-0"
              >
                {kategoriEditingId ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                {kategoriEditingId ? "Simpan" : "Tambah"}
              </Button>
              {kategoriEditingId && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleKategoriCancel}
                  className="shrink-0 h-10 w-10 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </form>
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-navy-800 flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-navy-950 text-slate-500 border-b border-slate-200 dark:border-navy-800">
                      <th className="p-3 font-bold w-12">No</th>
                      <th className="p-3 font-bold">Nama Kategori</th>
                      <th className="p-3 font-bold text-right w-20">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    {filteredKategori.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-6 text-center text-xs text-slate-500"
                        >
                          Tidak ada kategori.
                        </td>
                      </tr>
                    ) : (
                      filteredKategori.map((k, idx) => (
                        <tr
                          key={k.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-navy-950/50"
                        >
                          <td className="p-3 font-mono text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="p-3 font-semibold text-navy-950 dark:text-white">
                            {k.nama}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleKategoriEdit(k)}
                                className="w-7 h-7 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-500 hover:text-primary hover:border-primary/30 flex items-center justify-center transition-colors"
                                aria-label="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setKategoriDeleteTarget(k)}
                                className="w-7 h-7 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition-colors"
                                aria-label="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Sektor - Kanan */}
          <Card className="p-5 border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-sm w-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-navy-950 dark:text-white font-epilogue">
                  Sektor KKN
                </h2>
                <p className="text-[11px] text-slate-500">
                  Kelola sektor program KKN
                </p>
              </div>
            </div>

            <form onSubmit={handleSektorSubmit} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Layers className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={
                    sektorEditingId ? "Edit sektor..." : "Nama sektor baru..."
                  }
                  value={sektorNama}
                  onChange={(e) => setSektorNama(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-950 text-sm text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <Button
                type="submit"
                size="sm"
                variant="primary"
                className="gap-1.5 font-bold text-xs shrink-0 bg-emerald-600 hover:bg-emerald-700"
              >
                {sektorEditingId ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                {sektorEditingId ? "Simpan" : "Tambah"}
              </Button>
              {sektorEditingId && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleSektorCancel}
                  className="shrink-0 h-10 w-10 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </form>

            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-navy-800 flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-navy-950 text-slate-500 border-b border-slate-200 dark:border-navy-800">
                      <th className="p-3 font-bold w-12">No</th>
                      <th className="p-3 font-bold">Nama Sektor</th>
                      <th className="p-3 font-bold text-right w-20">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-navy-800">
                    {filteredSektor.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="p-6 text-center text-xs text-slate-500"
                        >
                          Tidak ada sektor.
                        </td>
                      </tr>
                    ) : (
                      filteredSektor.map((s, idx) => (
                        <tr
                          key={s.id}
                          className="hover:bg-slate-50/60 dark:hover:bg-navy-950/50"
                        >
                          <td className="p-3 font-mono text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="p-3 font-semibold text-navy-950 dark:text-white">
                            {s.nama}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleSektorEdit(s)}
                                className="w-7 h-7 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 flex items-center justify-center transition-colors"
                                aria-label="Edit"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setSektorDeleteTarget(s)}
                                className="w-7 h-7 rounded-lg bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition-colors"
                                aria-label="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>

        {/* Popup Hapus Kategori */}
        {kategoriDeleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
            <Card className="w-full max-w-md p-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                    Hapus Kategori?
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Hapus{" "}
                    <strong className="text-navy-950 dark:text-white">
                      {kategoriDeleteTarget.nama}
                    </strong>
                    ?
                  </p>
                </div>
                <button
                  onClick={() => setKategoriDeleteTarget(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setKategoriDeleteTarget(null)}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleKategoriDelete}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Ya, Hapus
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Popup Hapus Sektor */}
        {sektorDeleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
            <Card className="w-full max-w-md p-6 bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-800 shadow-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                    Hapus Sektor?
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Hapus{" "}
                    <strong className="text-navy-950 dark:text-white">
                      {sektorDeleteTarget.nama}
                    </strong>
                    ?
                  </p>
                </div>
                <button
                  onClick={() => setSektorDeleteTarget(null)}
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSektorDeleteTarget(null)}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSektorDelete}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Ya, Hapus
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
