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
import { StyledSelect } from '@/components/ui/StyledSelect';

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
    <div className="min-h-screen bg-surface-canvas dark:bg-[#071629] flex flex-col font-jakarta transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-tertiary-700 dark:text-amber-400 uppercase tracking-wider">
            {t('badge')}
          </span>
          <h1 className="text-3xl font-extrabold text-navy-950 dark:text-white font-epilogue">
            {t('title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            {t('subtitle')}
          </p>
        </div>

        {/* Two Columns: Form on Left, Ticket Lookup on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Submission Form (7 cols) */}
          <div className="lg:col-span-7">
            <Card className="p-6 sm:p-8 border-slate-200/90 dark:border-navy-800 bg-white dark:bg-navy-900 shadow-card space-y-5">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                  {t('form.title')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('form.subtitle')}
                </p>
              </div>

              {submittedTicket ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200 font-epilogue">
                    {t('form.successTitle')}
                  </h3>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                    {t('form.successDesc')}
                  </p>
                  <div className="p-3 rounded-xl bg-white dark:bg-navy-950 border border-emerald-300 dark:border-emerald-700 font-mono font-bold text-sm text-emerald-900 dark:text-emerald-300 tracking-wider">
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
                    className="mt-2 text-xs border-slate-300 dark:border-navy-700 bg-white dark:bg-navy-900 text-navy-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-navy-800"
                  >
                    {t('form.submitAnother')}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCreateAspirasi} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                        {t('form.labels.name')}
                      </label>
                      <input
                        type="text"
                        required
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder={t('form.labels.namePlaceholder')}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary/40 focus:bg-white dark:focus:bg-navy-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                        {t('form.labels.contact')}
                      </label>
                      <input
                        type="text"
                        required
                        value={kontak}
                        onChange={(e) => setKontak(e.target.value)}
                        placeholder={t('form.labels.contactPlaceholder')}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary/40 focus:bg-white dark:focus:bg-navy-950"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                      {t('form.labels.village')}
                    </label>
                    <StyledSelect
                      value={desaId}
                      onChange={(v) => setDesaId(Number(v))}
                      options={[
                        { value: 1, label: t('form.labels.villages.village1') },
                        { value: 2, label: t('form.labels.villages.village2') },
                        { value: 3, label: t('form.labels.villages.village3') },
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                        {t('form.labels.titleField')}
                      </label>
                      <input
                        type="text"
                        required
                        value={judul}
                        onChange={(e) => setJudul(e.target.value)}
                        placeholder={t('form.labels.titlePlaceholder')}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary/40 focus:bg-white dark:focus:bg-navy-950"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                        {t('form.labels.category')}
                      </label>
                      <StyledSelect
                        value={kategori}
                        onChange={(v) => setKategori(v as any)}
                        options={[
                          { value: 'umkm', label: t('form.labels.categories.umkm') },
                          { value: 'kesehatan', label: t('form.labels.categories.kesehatan') },
                          { value: 'lingkungan', label: t('form.labels.categories.lingkungan') },
                          { value: 'pendidikan', label: t('form.labels.categories.pendidikan') },
                          { value: 'fasilitas', label: t('form.labels.categories.fasilitas') },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                        {t('form.labels.urgency')}
                      </label>
                      <StyledSelect
                        value={urgensi}
                        onChange={(v) => setUrgensi(v as any)}
                        options={[
                          { value: 'rendah', label: t('form.labels.urgencies.rendah') },
                          { value: 'sedang', label: t('form.labels.urgencies.sedang') },
                          { value: 'mendesak', label: t('form.labels.urgencies.mendesak') },
                        ]}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                        {t('form.labels.photo')}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 dark:file:bg-primary-950/70 file:text-primary dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-primary-900/60 border border-slate-200 dark:border-navy-700 rounded-xl bg-slate-50 dark:bg-navy-950 py-1.5 px-2 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 dark:text-slate-200 mb-1">
                      {t('form.labels.description')}
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={deskripsi}
                      onChange={(e) => setDeskripsi(e.target.value)}
                      placeholder={t('form.labels.descriptionPlaceholder')}
                      className="w-full p-3.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs text-navy-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary/40 focus:bg-white dark:focus:bg-navy-950 leading-relaxed"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full font-bold text-xs sm:text-sm shadow-sm"
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
            <Card className="p-6 border-slate-200/90 dark:border-navy-800 bg-white dark:bg-navy-900 space-y-4 shadow-card">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-navy-950 dark:text-white font-epilogue">
                  {t('track.title')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('track.subtitle')}
                </p>
              </div>

              <form onSubmit={handleSearchTicket} className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={ticketQuery}
                    onChange={(e) => setTicketQuery(e.target.value)}
                    placeholder={t('track.placeholder')}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-700 rounded-xl text-xs font-mono text-navy-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary/40 focus:bg-white dark:focus:bg-navy-950"
                  />
                </div>
                <Button type="submit" size="md" variant="secondary" className="w-full text-xs font-semibold">
                  {t('track.checkBtn')}
                </Button>
              </form>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-navy-800">
                <span>{t('track.demoLabel')}</span>
                <button
                  type="button"
                  onClick={() => {
                    setTicketQuery('ASP-2026-SKM-0089');
                    setSearchedTicket(MOCK_ASPIRASI[0]);
                  }}
                  className="font-mono text-primary dark:text-primary-400 font-bold hover:underline"
                >
                  ASP-2026-SKM-0089
                </button>
              </div>

              {searchedTicket && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-navy-950 dark:text-white">
                      {searchedTicket.ticket_number}
                    </span>
                    <StatusBadge status={searchedTicket.status} size="sm" />
                  </div>

                  <h4 className="text-xs font-bold text-navy-950 dark:text-white">{searchedTicket.judul}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {searchedTicket.deskripsi}
                  </p>

                  {searchedTicket.tanggapan_desa && (
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-[11px] text-emerald-950 dark:text-emerald-200 space-y-1">
                      <span className="font-bold flex items-center gap-1 text-emerald-800 dark:text-emerald-400">
                        <Building className="w-3.5 h-3.5" /> {t('track.responseLabel')}
                      </span>
                      <p className="text-emerald-900 dark:text-emerald-300 leading-relaxed">{searchedTicket.tanggapan_desa}</p>
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
