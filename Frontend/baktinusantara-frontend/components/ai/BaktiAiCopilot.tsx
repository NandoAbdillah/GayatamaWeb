'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from 'next-intl';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Sparkles,
  X,
  Send,
  Minimize2,
  Maximize2,
  ArrowRight,
  MapPin,
  Compass,
  FileText,
  CheckCircle2,
  Copy,
  Layers,
  RotateCcw,
  Landmark,
  Building,
  ExternalLink,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

interface MessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  executedTool?: {
    name: string;
    args: any;
    result: any;
  } | null;
  keySlot?: string;
}

export function BaktiAiCopilot() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { locale } = useLanguage();
  const tCopilot = useTranslations('copilot');

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSlotName, setActiveSlotName] = useState('Gemini 2.5 Flash');

  const activeRole = user?.role || 'mahasiswa';

  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Halo! Aku Aira, AI Nusantara yang siap menemani kamu di GayatamaWeb.

Senang banget kamu mampir. Aku bisa bantu kamu mencari informasi, menemukan potensi desa, sampai membantu menyiapkan berbagai kebutuhan KKN. Jadi, kalau kamu lagi bingung mau mulai dari mana, tenang saja. Kita bisa cari dan kerjakan bareng-bareng.

Aku bisa membantu kamu untuk:
- Mencari informasi dan kegiatan KKN berdasarkan wilayah
- Menemukan desa yang sesuai dengan kebutuhan atau programmu
- Membantu menyusun ide dan draft proposal KKN
- Menganalisis kebutuhan dan potensi suatu desa
- Melihat informasi geografis dan demografi wilayah di Indonesia
- Menemukan dan memahami informasi yang tersedia di GayatamaWeb

Kamu juga tidak perlu menggunakan perintah khusus. Ceritakan saja apa yang sedang kamu cari atau ingin kamu kerjakan, nanti aku bantu dari sana.

Jadi, mau mulai dari mencari desa, menyusun program KKN, atau sekadar ingin mencari tahu sesuatu?

Ceritakan saja ke aku. Kita mulai dari sini, ya.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg: MessageItem = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          userRole: activeRole,
          activePage: pathname,
          locale: locale,
        }),
      });

      const json = await res.json();

      if (json.success) {
        if (json.keySlot) setActiveSlotName(`Slot: ${json.keySlot}`);

        const assistantMsg: MessageItem = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: json.reply,
          executedTool: json.executedTool,
          keySlot: json.keySlot,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);

        // If tool was navigation, handle auto/suggested route
        if (json.executedTool?.name === 'navigate_to_page' && json.executedTool?.args?.path) {
          toast.success(`AI mengarahkan ke: ${json.executedTool.args.title}`);
        }
      } else {
        toast.error(json.message || 'Gagal memproses respons AI');
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi gangguan jaringan saat menghubungi AI');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string = 'Teks') => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin ke clipboard!`);
  };

  // Quick Action Prompts based on User Role
  const getQuickPrompts = () => {
    switch (activeRole) {
      case 'perangkat_desa':
        return [
          { label: '🌾 Draf Pos Kebutuhan Pertanian', prompt: 'Bantu buatkan draf pos kebutuhan KKN desa untuk modernisasi irigasi sawah dan ketahanan pangan.' },
          { label: '📄 Syarat Surat Tugas KKN', prompt: 'Jelaskan bagaimana proses penerbitan surat tugas resmi desa dan dokumen BAST hasil KKN.' },
          { label: '🗺️ Buka Peta Sebaran Wilayah', prompt: 'Buka peta geospasial KKN untuk melihat jangkauan kampus ke desa kami.' },
        ];
      case 'dosen':
        return [
          { label: '✍️ Buka Penilaian Mahasiswa', prompt: 'Arahkan saya ke halaman form penilaian dan evaluasi mahasiswa KKN.' },
          { label: '📊 Status Logbook Bimbingan', prompt: 'Bawa saya ke halaman verifikasi logbook harian kelompok bimbingan.' },
          { label: '🗺️ Cek Wilayah Penugasan', prompt: 'Cek profil geospasial Kabupaten Bogor dan sebaran pos mahasiswa.' },
        ];
      case 'admin':
      case 'universitas':
        return [
          { label: '📈 Buka Dashboard Analitik', prompt: 'Bawa saya ke halaman analytics LPPM dan monitoring evaluasi KKN.' },
          { label: '📋 Verifikasi Mitra Desa Baru', prompt: 'Buka halaman verifikasi pendaftaran mitra desa yang masuk.' },
          { label: '🗺️ Eksplorasi Peta Nasional', prompt: 'Buka peta wilayah Indonesia untuk monitoring kuota pos se-Indonesia.' },
        ];
      default: // Mahasiswa
        return [
          { label: '🗺️ Buka Peta Radius KKN', prompt: 'Buka peta geospasial dan carikan pos KKN dengan radius kurang dari 50 km.' },
          { label: '🔍 Cari Pos KKN UMKM', prompt: 'Carikan pos kebutuhan KKN yang berfokus pada digitalisasi UMKM dan e-commerce.' },
          { label: '📝 Draf Proposal KKN', prompt: 'Bantu susunkan draf proposal KKN program digitalisasi desa Sukamaju.' },
          { label: '📊 Cek Kecocokan Jurusan', prompt: 'Hitung kecocokan jurusan Teknik Informatika untuk program pemberdayaan desa.' },
          { label: '📋 Draf Catatan Logbook', prompt: 'Buatkan draf logbook harian kegiatan instalasi sistem informasi desa.' },
        ];
    }
  };

  // Nonaktifkan AI di halaman login - harus setelah semua hooks agar tidak violate Rules of Hooks
  if (pathname?.startsWith('/login')) return null;

  return (
    <>
      {/* Floating Trigger Aura Button */}
      {!isOpen && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Buka Aira - AI Nusantara"
            className="group relative flex items-center justify-center w-14 h-14 bg-transparent hover:scale-110 active:scale-95 transition-all duration-300 "
          >
            <Image
              src="/icons/logochat.svg"
              alt="Aira - AI Nusantara"
              width={56}
              height={56}
              className="w-14 h-14 rounded-2xl object-contain drop-shadow-md group-hover:rotate-6 transition-transform duration-300"
              priority
            />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white dark:border-navy-950 rounded-full z-10 shadow-sm" />
          </button>

          <div className="hidden sm:flex items-center gap-2 bg-white/95 dark:bg-navy-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-navy-700 shadow-lg text-xs font-bold text-navy-950 dark:text-white animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Butuh bantuan? Aira siap bantu</span>
          </div>
        </div>
      )}

      {/* Interactive AI Copilot Modal / Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col shadow-2xl rounded-3xl overflow-hidden border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 font-jakarta ${isExpanded
              ? 'inset-4 sm:inset-10'
              : 'bottom-6 left-6 w-full max-w-lg sm:max-w-xl h-[650px] max-h-[85vh]'
            }`}
        >
          {/* Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm flex items-center justify-center bg-transparent">
                <Image
                  src="/icons/logochat.svg"
                  alt="Aira - AI Nusantara"
                  width={36}
                  height={36}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold font-epilogue tracking-tight text-white">
                    Aira - AI Nusantara
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Agentic Copilot
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Google Gemini • <span className="text-amber-400 font-mono">{activeSlotName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title={isExpanded ? 'Kecilkan' : 'Perbesar'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-[#071629]/50">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed shadow-sm space-y-3 ${isUser
                        ? 'bg-primary text-white rounded-br-none shadow-primary/20'
                        : 'bg-white dark:bg-navy-900 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-navy-800 rounded-bl-none shadow-slate-200/50 dark:shadow-none'
                      }`}
                  >
                    <MarkdownRenderer content={msg.content} isUser={isUser} />

                    {/* RENDER INTERACTIVE ACTION CARDS (TOOL RESULTS) */}
                    {msg.executedTool && msg.executedTool.result && (
                      <div className="pt-2 border-t border-slate-200/50 dark:border-navy-700/50 space-y-2">
                        {/* 1. Navigate Action Card */}
                        {msg.executedTool.name === 'navigate_to_page' && (
                          <div className="p-3 rounded-xl bg-primary-50 dark:bg-navy-950 border border-primary-200 dark:border-primary-900 flex items-center justify-between gap-3 text-slate-900 dark:text-white">
                            <div>
                              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                                Rekomendasi Navigasi
                              </span>
                              <h4 className="font-bold text-xs">
                                {msg.executedTool.args.title}
                              </h4>
                              <p className="text-[11px] text-slate-500">
                                {msg.executedTool.args.reason}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                router.push(msg.executedTool?.args.path);
                                setIsOpen(false);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold flex items-center gap-1 shrink-0 hover:bg-primary-600 transition-colors shadow-sm"
                            >
                              <span>Buka</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* 2. Pos List Card */}
                        {msg.executedTool.name === 'search_pos_kebutuhan' &&
                          msg.executedTool.result.data && (
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                                Ditemukan {msg.executedTool.result.total_found} Pos Kebutuhan Terpilih:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {msg.executedTool.result.data.map((pos: any) => (
                                  <div
                                    key={pos.id}
                                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-xs flex flex-col justify-between space-y-1.5"
                                  >
                                    <div>
                                      <span className="text-[10px] font-bold text-primary">
                                        {pos.sektor}
                                      </span>
                                      <h5 className="font-bold text-navy-950 dark:text-white line-clamp-1">
                                        {pos.judul}
                                      </h5>
                                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-rose-500" />
                                        {pos.desa}, {pos.kabupaten} ({pos.distance_km} km)
                                      </p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        router.push(`/search/${pos.id}`);
                                        setIsOpen(false);
                                      }}
                                      className="text-xs font-bold text-primary flex items-center gap-1 hover:underline pt-1"
                                    >
                                      <span>Lihat Rincian & Lamar</span>
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* 3. Draft Proposal Card */}
                        {msg.executedTool.name === 'draft_proposal_kkn' &&
                          msg.executedTool.result.draft && (
                            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-navy-950 border border-amber-200 dark:border-amber-900 text-xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5" />
                                  Draf Proposal Siap Diajukan
                                </span>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      JSON.stringify(msg.executedTool?.result.draft, null, 2),
                                      'Draf Proposal'
                                    )
                                  }
                                  className="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1 hover:underline"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>Salin JSON Draf</span>
                                </button>
                              </div>
                              <h5 className="font-bold text-navy-950 dark:text-white text-xs">
                                {msg.executedTool.result.draft.judul_program}
                              </h5>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                                Desa: <strong>{msg.executedTool.result.draft.desa_tujuan}</strong> • Metodologi: {msg.executedTool.result.draft.metodologi}
                              </p>
                            </div>
                          )}

                        {/* 4. Matching Score Card */}
                        {msg.executedTool.name === 'calculate_matching_score' && (
                          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-navy-950 border border-emerald-200 dark:border-emerald-900 text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                                AI Matching Score
                              </span>
                              <span className="text-sm font-extrabold text-emerald-600">
                                {msg.executedTool.result.score}%
                              </span>
                            </div>
                            <p className="text-xs font-bold text-navy-950 dark:text-white">
                              {msg.executedTool.result.predikat}
                            </p>
                            {msg.executedTool.result.analisis && (
                              <ul className="text-[11px] text-slate-600 dark:text-slate-300 list-disc pl-4 space-y-0.5">
                                {msg.executedTool.result.analisis.map((r: string, idx: number) => (
                                  <li key={idx}>{r}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}

                        {/* 5. Wilayah Card */}
                        {msg.executedTool.name === 'query_wilayah_indonesia' &&
                          msg.executedTool.result.wilayah && (
                            <div className="p-3 rounded-xl bg-sky-50 dark:bg-navy-950 border border-sky-200 dark:border-sky-900 text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider flex items-center gap-1">
                                  <Landmark className="w-3.5 h-3.5" />
                                  Profil Wilayah ({msg.executedTool.result.wilayah.name})
                                </span>
                                <button
                                  onClick={() => {
                                    router.push('/maps');
                                    setIsOpen(false);
                                  }}
                                  className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline"
                                >
                                  <span>Buka di Peta</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                                <div>Ibukota: <strong>{msg.executedTool.result.wilayah.capital || '-'}</strong></div>
                                <div>Populasi: <strong>{msg.executedTool.result.wilayah.population?.toLocaleString('id-ID') || '-'}</strong></div>
                                <div>Luas: <strong>{msg.executedTool.result.wilayah.total_area_km2?.toLocaleString('id-ID') || '-'} km²</strong></div>
                                <div>Elevasi: <strong>{msg.executedTool.result.wilayah.elevation_mdpl || '-'} mdpl</strong></div>
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 w-fit text-xs text-slate-600 dark:text-slate-300 shadow-sm animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span>AI Agent sedang berpikir & menyiapkan tindakan...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-4 py-2 bg-slate-100/80 dark:bg-navy-900/80 border-t border-slate-200 dark:border-navy-800 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            {getQuickPrompts().map((qp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={loading}
                className="px-3 py-1 rounded-full bg-white dark:bg-navy-950 border border-slate-200 dark:border-navy-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap hover:border-primary hover:text-primary transition-colors shrink-0 shadow-2xs"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input & Send Form */}
          <div className="p-3.5 bg-white dark:bg-navy-950 border-t border-slate-200 dark:border-navy-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Tanya atau minta tindakan AI (${activeRole})...`}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-900 text-xs font-semibold text-navy-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-600 disabled:opacity-50 text-white flex items-center justify-center transition-all shadow-md shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
