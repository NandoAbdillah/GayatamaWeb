'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { api } from '@/lib/services';
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
  MapPin,
  Camera,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function AspirasiPage() {
  const t = useTranslations('aspirasi');
  const [ticketQuery, setTicketQuery] = useState('');
  const [searchedTicket, setSearchedTicket] = useState<Aspirasi | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [nama, setNama] = useState('');
  const [kontak, setKontak] = useState('');
  const [desaId, setDesaId] = useState<number>(1);
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [kategori, setKategori] = useState<'umkm' | 'kesehatan' | 'lingkungan' | 'pendidikan' | 'fasilitas'>('umkm');
  const [urgensi, setUrgensi] = useState<'rendah' | 'sedang' | 'mendesak'>('sedang');
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<string | number | null>(null);

  const handleSearchTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketQuery.trim()) return;
    setIsSearching(true);
    try {
      const ticketId = ticketQuery.replace(/\D/g, '') || ticketQuery.trim();
      const res = await api.aspirasi.getByTicket(ticketId);
      if (res) {
        setSearchedTicket(res);
        toast.success(t('toast.found'));
      } else {
        throw new Error('Not found');
      }
    } catch {
      // Check fallback mock
      const found = MOCK_ASPIRASI.find(
        (a) => a.ticket_number.toLowerCase() === ticketQuery.trim().toLowerCase() || String(a.id) === ticketQuery.trim()
      );
      if (found) {
        setSearchedTicket(found);
        toast.success(t('toast.found'));
      } else {
        toast.error(t('toast.notFound'));
        setSearchedTicket(null);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateAspirasi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: any = {
        desa_id: desaId,
        pelapor_nama: nama,
        pelapor_wa: kontak,
        kategori,
        deskripsi: `${judul} - ${deskripsi}`,
        latitude: -7.6358,
        longitude: 112.2965,
        urgensi,
      };
      if (fotoFile) {
        payload.foto = fotoFile;
      }
      const res = await api.aspirasi.submitAspirasi(payload);
      const ticket = res.nomor_tiket || (res.data as any)?.id || `ASP-${Date.now().toString().slice(-4)}`;
      setSubmittedTicket(ticket);
      toast.success(t('toast.successWithTicket', { ticket: String(ticket) }));
    } catch (err: any) {
      console.warn('Backend submit error, using client fallback ticket:', err);
      const fallbackTicket = `ASP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setSubmittedTicket(fallbackTicket);
      toast.success(t('toast.recordedWithTicket', { ticket: fallbackTicket }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col font-jakarta">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-tertiary-700 uppercase tracking-wider">
            {t('badge')}
          </span>
          <h1 className="text-3xl font-extrabold text-navy-950 font-epilogue">
            {t('title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {t('subtitle')}
          </p>
        </div>

        {/* Two Columns: Form on Left, Ticket Lookup on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Submission Form (7 cols) */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-8 border-slate-200 shadow-card space-y-5">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-navy-950 font-epilogue">
                  {t('form.title')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('form.subtitle')}
                </p>
              </div>

              {submittedTicket ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-emerald-950 font-epilogue">
                    {t('form.successTitle')}
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {t('form.successDesc')}
                  </p>
                  <div className="p-3 rounded-xl bg-white border border-emerald-300 font-mono font-bold text-sm text-emerald-900 tracking-wider">
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
                    {t('form.submitAnother')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCreateAspirasi} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 mb-1">
                        {t('form.labels.name')}
                      </label>
                      <input
                        type="text"
                        required
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder={t('form.labels.namePlaceholder')}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 mb-1">
                        {t('form.labels.contact')}
                      </label>
                      <input
                        type="text"
                        required
                        value={kontak}
                        onChange={(e) => setKontak(e.target.value)}
                        placeholder={t('form.labels.contactPlaceholder')}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 mb-1">
                      {t('form.labels.village')}
                    </label>
                    <select
                      value={desaId}
                      onChange={(e) => setDesaId(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
                    >
                      <option value={1}>{t('form.labels.villages.village1')}</option>
                      <option value={2}>{t('form.labels.villages.village2')}</option>
                      <option value={3}>{t('form.labels.villages.village3')}</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-navy-900 mb-1">
                        {t('form.labels.titleField')}
                      </label>
                      <input
                        type="text"
                        required
                        value={judul}
                        onChange={(e) => setJudul(e.target.value)}
                        placeholder={t('form.labels.titlePlaceholder')}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 mb-1">
                        {t('form.labels.category')}
                      </label>
                      <select
                        value={kategori}
                        onChange={(e) => setKategori(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
                      >
                        <option value="umkm">{t('form.labels.categories.umkm')}</option>
                        <option value="kesehatan">{t('form.labels.categories.kesehatan')}</option>
                        <option value="lingkungan">{t('form.labels.categories.lingkungan')}</option>
                        <option value="pendidikan">{t('form.labels.categories.pendidikan')}</option>
                        <option value="fasilitas">{t('form.labels.categories.fasilitas')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 mb-1">
                        {t('form.labels.urgency')}
                      </label>
                      <select
                        value={urgensi}
                        onChange={(e) => setUrgensi(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary font-semibold"
                      >
                        <option value="rendah">{t('form.labels.urgencies.rendah')}</option>
                        <option value="sedang">{t('form.labels.urgencies.sedang')}</option>
                        <option value="mendesak">{t('form.labels.urgencies.mendesak')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 mb-1">
                        {t('form.labels.photo')}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary hover:file:bg-primary-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 mb-1">
                      {t('form.labels.description')}
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                      placeholder={t('form.labels.descriptionPlaceholder')}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full font-bold text-xs sm:text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span>{t('form.submittingBtn')}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        <span>{t('form.submitBtn')}</span>
                      </>
                    )}
                  </Button>
                </form>
              )}
            </Card>
          </div>

          {/* Ticket Lookup (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 border-slate-200 bg-white space-y-4 shadow-card">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-navy-950 font-epilogue">
                  {t('track.title')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('track.subtitle')}
                </p>
              </div>

              <form onSubmit={handleSearchTicket} className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={ticketQuery}
                    onChange={(e) => setTicketQuery(e.target.value)}
                    placeholder={t('track.placeholder')}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-navy-900 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button type="submit" size="md" variant="secondary" className="w-full text-xs font-semibold">
                  {t('track.checkBtn')}
                </Button>
              </form>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                <span>{t('track.demoLabel')}</span>
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
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-navy-950">
                      {searchedTicket.ticket_number}
                    </span>
                    <StatusBadge status={searchedTicket.status} size="sm" />
                  </div>

                  <h4 className="text-xs font-bold text-navy-950">{searchedTicket.judul}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {searchedTicket.deskripsi}
                  </p>

                  {searchedTicket.tanggapan_desa && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950 space-y-1">
                      <span className="font-bold flex items-center gap-1 text-emerald-800">
                        <Building className="w-3.5 h-3.5" /> {t('track.responseLabel')}
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
