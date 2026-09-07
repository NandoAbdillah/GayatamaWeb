'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MOCK_ASPIRASI } from '@/lib/mock-data';
import { Aspirasi } from '@/lib/types';
import {
  MessageSquare,
  Search,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  Building,
  User,
  Phone,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AspirasiPage() {
  const [ticketQuery, setTicketQuery] = useState('');
  const [searchedTicket, setSearchedTicket] = useState<Aspirasi | null>(null);

  // Form state
  const [nama, setNama] = useState('');
  const [kontak, setKontak] = useState('');
  const [desa, setDesa] = useState('Desa Sukamaju, Ciawi, Bogor');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [kategori, setKategori] = useState<any>('Infrastruktur');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const handleSearchTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const found = MOCK_ASPIRASI.find(
      (a) => a.ticket_number.toLowerCase() === ticketQuery.trim().toLowerCase()
    );
    if (found) {
      setSearchedTicket(found);
    } else {
      toast.error('Nomor tiket tidak ditemukan. Pastikan format tiket benar.');
      setSearchedTicket(null);
    }
  };

  const handleCreateAspirasi = (e: React.FormEvent) => {
    e.preventDefault();
    const randomTicket = `ASP-2026-SKM-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedTicket(randomTicket);
    toast.success(`Aspirasi berhasil dikirim! Nomor Tiket Anda: ${randomTicket}`);
  };

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-tertiary-700 bg-tertiary-50 px-3 py-1 rounded-full">
            <MessageSquare className="w-3.5 h-3.5 text-tertiary-600" /> Kanal Aspirasi Publik
          </div>
          <h1 className="text-3xl font-extrabold text-navy-950 font-epilogue">
            Sampaikan Masalah & Usulan Desa Anda
          </h1>
          <p className="text-sm text-slate-500 font-jakarta">
            Warga masyarakat dapat mengajukan keluhan atau usulan fasilitas desa secara terbuka tanpa harus login. Usulan yang terverifikasi akan dijadikan pos kebutuhan KKN.
          </p>
        </div>

        {/* Two Columns: Form on Left, Ticket Lookup on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Submission Form (7 cols) */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-8 border-slate-200 shadow-ambient space-y-5">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-navy-950 font-epilogue">
                  Formulir Aspirasi Baru
                </h2>
                <p className="text-xs text-slate-500">
                  Semua data akan diteruskan ke perangkat desa dan tim LPPM kampus.
                </p>
              </div>

              {submittedTicket ? (
                <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-glow-secondary">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-emerald-950 font-epilogue">
                    Aspirasi Berhasil Diterima!
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Simpan nomor tiket ini untuk memantau status tindak lanjut oleh perangkat desa dan mahasiswa KKN:
                  </p>
                  <div className="p-3 rounded-full bg-white border border-emerald-300 font-mono font-bold text-sm text-emerald-900 tracking-wider">
                    {submittedTicket}
                  </div>
                  <Button
                    onClick={() => {
                      setSubmittedTicket(null);
                      setJudul('');
                      setDeskripsi('');
                    }}
                    variant="outline"
                    size="sm"
                    className="mt-2 text-xs"
                  >
                    Kirim Aspirasi Lainnya
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCreateAspirasi} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                        Nama Pengusul / Tokoh Warga
                      </label>
                      <input
                        type="text"
                        required
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="Contoh: Pak Joko (RT 03)"
                        className="w-full px-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                        Nomor Kontak / WhatsApp
                      </label>
                      <input
                        type="text"
                        required
                        value={kontak}
                        onChange={(e) => setKontak(e.target.value)}
                        placeholder="0812xxxxxxx"
                        className="w-full px-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                      Pilih Wilayah Desa Terkait
                    </label>
                    <select
                      value={desa}
                      onChange={(e) => setDesa(e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Desa Sukamaju, Ciawi, Bogor">Desa Sukamaju, Ciawi, Bogor</option>
                      <option value="Desa Cibodas Asri, Pacet, Cianjur">Desa Cibodas Asri, Pacet, Cianjur</option>
                      <option value="Desa Tanjung Karang, Babakan Madang">Desa Tanjung Karang, Babakan Madang</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                        Judul Aspirasi / Masalah
                      </label>
                      <input
                        type="text"
                        required
                        value={judul}
                        onChange={(e) => setJudul(e.target.value)}
                        placeholder="Contoh: Perbaikan Saluran Irigasi Sawah"
                        className="w-full px-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                        Kategori
                      </label>
                      <select
                        value={kategori}
                        onChange={(e) => setKategori(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="Infrastruktur">Infrastruktur</option>
                        <option value="Ekonomi / UMKM">Ekonomi / UMKM</option>
                        <option value="Kesehatan">Kesehatan</option>
                        <option value="Pendidikan">Pendidikan</option>
                        <option value="Lingkungan">Lingkungan</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 mb-1.5">
                      Uraian Kebutuhan & Lokasi Spesifik
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                      placeholder="Jelaskan kondisi di lapangan dan harapan dari warga desa..."
                      className="w-full p-4 bg-surface-canvas border border-slate-300 rounded-2xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <Button type="submit" size="lg" variant="primary" className="w-full shadow-glow-primary">
                    <Send className="w-4 h-4 mr-2" />
                    <span>Kirimkan Aspirasi ke Perangkat Desa</span>
                  </Button>
                </form>
              )}
            </Card>
          </div>

          {/* Ticket Lookup (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 border-slate-200 bg-white space-y-4 shadow-ambient">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-navy-950 font-epilogue">
                  Lacak Status Tiket Aspirasi
                </h3>
                <p className="text-xs text-slate-500">
                  Masukkan nomor tiket yang Anda dapatkan saat mengirim aspirasi.
                </p>
              </div>

              <form onSubmit={handleSearchTicket} className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={ticketQuery}
                    onChange={(e) => setTicketQuery(e.target.value)}
                    placeholder="Contoh: ASP-2026-SKM-0089"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-canvas border border-slate-300 rounded-full text-xs font-mono text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button type="submit" size="md" variant="secondary" className="w-full text-xs font-semibold">
                  Cek Status Tindak Lanjut
                </Button>
              </form>

              {/* Sample Quick Ticket button */}
              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                <span>Coba tiket demo:</span>
                <button
                  type="button"
                  onClick={() => {
                    setTicketQuery('ASP-2026-SKM-0089');
                    setSearchedTicket(MOCK_ASPIRASI[0]);
                  }}
                  className="font-mono text-primary font-bold hover:underline"
                >
                  ASP-2026-SKM-0089
                </button>
              </div>

              {searchedTicket && (
                <div className="mt-4 p-4 rounded-2xl bg-surface-subtle border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-navy-900">
                      {searchedTicket.ticket_number}
                    </span>
                    <StatusBadge status={searchedTicket.status} size="sm" />
                  </div>

                  <h4 className="text-xs font-bold text-navy-950">{searchedTicket.judul}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {searchedTicket.deskripsi}
                  </p>

                  {searchedTicket.tanggapan_desa && (
                    <div className="p-3 rounded-xl bg-primary-50 border border-primary-200 text-[11px] text-primary-950 space-y-1">
                      <span className="font-bold flex items-center gap-1 text-primary-800">
                        <Building className="w-3.5 h-3.5" /> Tanggapan Desa:
                      </span>
                      <p>{searchedTicket.tanggapan_desa}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
