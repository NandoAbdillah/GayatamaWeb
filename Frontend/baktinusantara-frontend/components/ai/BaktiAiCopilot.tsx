'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslations } from 'next-intl';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ContextualSmartCard, SmartCardList } from './ContextualSmartCard';
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
  const [activeSlotName, setActiveSlotName] = useState('Gemini 3.6 Flash');

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

  // Quick Action Prompts based on User Role (Conversational & Friendly)
  const getQuickPrompts = () => {
    switch (activeRole) {
      case 'perangkat_desa':
        return [
          { label: 'Buat pos kebutuhan desa', prompt: 'Bisa bantu buatkan draf pos kebutuhan KKN untuk desa kami?' },
          { label: 'Info surat tugas & BAST', prompt: 'Jelaskan alur penerbitan surat tugas resmi desa dan dokumen BAST hasil KKN.' },
          { label: 'Cek jangkauan peta desa', prompt: 'Buka peta geospasial untuk melihat jangkauan kampus ke desa kami.' },
        ];
      case 'dosen':
        return [
          { label: 'Form penilaian mahasiswa', prompt: 'Bisa arahkan saya ke halaman evaluasi dan penilaian mahasiswa KKN?' },
          { label: 'Cek logbook bimbingan', prompt: 'Buka halaman verifikasi logbook harian kelompok bimbingan.' },
          { label: 'Peta wilayah penugasan', prompt: 'Cek profil geospasial wilayah penugasan mahasiswa.' },
        ];
      case 'admin':
      case 'universitas':
        return [
          { label: 'Dashboard analitik LPPM', prompt: 'Buka dashboard analytics LPPM dan monitoring evaluasi KKN.' },
          { label: 'Verifikasi mitra desa', prompt: 'Buka halaman verifikasi pendaftaran mitra desa baru.' },
          { label: 'Peta sebaran nasional', prompt: 'Buka peta sebaran kuota pos KKN se-Indonesia.' },
        ];
      default: // Mahasiswa
        return [
          { label: 'Bantu cari desa', prompt: 'Bisa bantu carikan rekomendasi desa yang cocok untuk KKN?' },
          { label: 'Cari KKN terdekat', prompt: 'Carikan pos KKN dengan radius terdekat dari lokasi saya.' },
          { label: 'Buat ide program', prompt: 'Bantu berikan ide program kerja KKN yang inovatif dan relevan.' },
          { label: 'Cek kecocokan jurusan', prompt: 'Bagaimana cara menganalisis kecocokan jurusanku dengan kebutuhan desa?' },
          { label: 'Bantu buat proposal', prompt: 'Bisa bantu susunkan draf proposal program KKN?' },
        ];
    }
  };

  // Nonaktifkan AI di halaman login - harus setelah semua hooks agar tidak violate Rules of Hooks
  if (pathname?.startsWith('/login')) return null;

  // Deteksi rute dashboard (Superadmin, LPPM Kampus, Mahasiswa, Perangkat Desa, Dosen)
  const isDashboard = Boolean(
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/kampus') ||
    pathname?.startsWith('/mahasiswa') ||
    pathname?.startsWith('/perangkat-desa') ||
    pathname?.startsWith('/dosen')
  );

  return (
    <>
      {/* Floating Trigger Aira Button */}
      {!isOpen && (
        <>
          {isDashboard ? (
            /* DASHBOARD MODE: Floating circular button persis seperti Accessibility Widget (48px × 48px, circle, right: 24px, bottom: 84px) */
            <div className="fixed bottom-[84px] right-[24px] z-40 flex items-center justify-center pointer-events-auto select-none">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-label="Buka Asisten AI Aira"
                title="Aira – AI Nusantara"
                style={{
                  width: '48px',
                  height: '48px',
                  minWidth: '48px',
                  minHeight: '48px',
                  maxWidth: '48px',
                  maxHeight: '48px',
                  borderRadius: '50%',
                  aspectRatio: '1 / 1',
                  overflow: 'hidden',
                }}
                className="group relative flex items-center justify-center w-[48px] h-[48px] min-w-[48px] min-h-[48px] max-w-[48px] max-h-[48px] rounded-full aspect-square overflow-hidden bg-[#00D492] border-2 border-white/90 dark:border-white/80 shadow-md hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 p-0"
              >
                <Image
                  src="/icons/aira-circle.svg"
                  alt="Aira - AI Nusantara"
                  width={48}
                  height={48}
                  unoptimized
                  priority
                  className="w-full h-full object-cover rounded-full select-none transition-transform duration-200 group-hover:scale-110"
                />
              </button>
            </div>
          ) : (
            /* LANDING PAGE / PUBLIC MODE: Pertahankan 100% desain existing di kiri bawah dengan speech bubble */
            <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3">
              <button
                onClick={() => setIsOpen(true)}
                aria-label="Buka Aira - AI Nusantara"
                className="group relative flex items-center justify-center w-14 h-14 bg-transparent hover:scale-110 active:scale-95 transition-all duration-300 drop-shadow-xl"
              >
                <Image
                  src="/icons/logochat.svg"
                  alt="Aira - AI Nusantara"
                  width={56}
                  height={56}
                  unoptimized
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
        </>
      )}

      {/* Interactive AI Copilot Modal / Drawer */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col shadow-2xl rounded-3xl overflow-hidden border border-slate-200/90 dark:border-navy-800 bg-slate-50/70 dark:bg-navy-950 font-jakarta ${
            isExpanded
              ? 'inset-4 sm:inset-10'
              : isDashboard
              ? 'bottom-6 right-6 sm:right-6 w-full max-w-lg sm:max-w-xl h-[650px] max-h-[85vh]'
              : 'bottom-6 left-6 w-full max-w-lg sm:max-w-xl h-[650px] max-h-[85vh]'
          }`}
        >
          {/* Friendly Profile Header */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white flex items-center justify-between border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 aspect-square flex items-center justify-center border border-white/20 bg-white/10 shadow-xs">
                <Image
                  src="/icons/aira-circle.svg"
                  alt="Aira – AI Nusantara"
                  width={36}
                  height={36}
                  unoptimized
                  className="w-full h-full object-cover rounded-full"
                  priority
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="text-sm font-bold tracking-tight text-white leading-tight truncate">
                  Aira – AI Nusantara
                </h3>
                <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium leading-tight mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                  <span className="truncate">Asisten KKN GayatamaWeb</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                title={isExpanded ? 'Kecilkan' : 'Perbesar'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Flow List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-1 bg-slate-50/60 dark:bg-[#071629]/60 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-navy-800">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isFirstInGroup = idx === 0 || messages[idx - 1].role !== msg.role;

              if (isUser) {
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col items-end max-w-[88%] sm:max-w-[80%] ml-auto ${
                      isFirstInGroup ? 'mt-3.5 sm:mt-4' : 'mt-1.5'
                    }`}
                  >
                    <div className="rounded-2xl rounded-tr-sm px-4 py-3 text-[13.5px] sm:text-[14px] leading-[1.65] bg-primary text-white shadow-xs">
                      <MarkdownRenderer content={msg.content} isUser={true} />
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 pr-1 text-right font-medium">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              }

              // Aira's Message Bubble with Left Avatar
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 max-w-[92%] sm:max-w-[86%] ${
                    isFirstInGroup ? 'mt-3.5 sm:mt-4' : 'mt-1.5'
                  }`}
                >
                  {/* Avatar Column */}
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                    {isFirstInGroup ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 aspect-square flex items-center justify-center bg-emerald-50 dark:bg-navy-900 border border-emerald-200/60 dark:border-navy-700 shadow-2xs">
                        <Image
                          src="/icons/aira-circle.svg"
                          alt="Aira"
                          width={32}
                          height={32}
                          unoptimized
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                    ) : (
                      <div className="w-8" />
                    )}
                  </div>

                  {/* Message Bubble Body */}
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <div className="w-full rounded-2xl rounded-tl-sm px-4 py-3.5 text-[13.5px] sm:text-[14px] leading-[1.65] bg-white dark:bg-navy-900/90 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-navy-800 shadow-2xs space-y-2.5">
                      <MarkdownRenderer content={msg.content} isUser={false} />

                      {/* RENDER CONTEXTUAL SMART CARDS */}
                      {msg.executedTool && msg.executedTool.result && (
                        <div className="pt-2 border-t border-slate-200/60 dark:border-navy-700/60">
                          {msg.executedTool.result.data && Array.isArray(msg.executedTool.result.data) ? (
                            <SmartCardList
                              variant={msg.executedTool.result.cardType || msg.executedTool.name}
                              items={msg.executedTool.result.data}
                              onSendMessage={(prompt) => handleSendMessage(prompt)}
                              onCloseCopilot={() => setIsOpen(false)}
                            />
                          ) : (
                            <ContextualSmartCard
                              variant={msg.executedTool.result.cardType || msg.executedTool.name}
                              data={msg.executedTool.result}
                              onSendMessage={(prompt) => handleSendMessage(prompt)}
                              onCloseCopilot={() => setIsOpen(false)}
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 pl-1 font-medium">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Natural Conversational Typing State */}
            {loading && (
              <div className="flex items-start gap-2.5 mt-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 aspect-square flex items-center justify-center bg-emerald-50 dark:bg-navy-900 border border-emerald-200/60 dark:border-navy-700 shadow-2xs">
                  <Image
                    src="/icons/aira-circle.svg"
                    alt="Aira"
                    width={32}
                    height={32}
                    unoptimized
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3 bg-white dark:bg-navy-900/90 border border-slate-200/80 dark:border-navy-800 shadow-2xs flex items-center gap-2.5">
                  <span className="text-[13px] text-slate-600 dark:text-slate-300 font-medium">
                    Aira sedang mengetik
                  </span>
                  <div className="flex items-center gap-1 pt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-4 py-2 bg-slate-100/90 dark:bg-navy-900/90 border-t border-slate-200/70 dark:border-navy-800 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            {getQuickPrompts().map((qp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-full bg-white dark:bg-navy-950 border border-slate-200/80 dark:border-navy-700 text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap hover:border-primary hover:text-primary transition-all shrink-0 shadow-2xs active:scale-95"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input & Send Form */}
          <div className="p-3 sm:p-3.5 bg-white dark:bg-navy-950 border-t border-slate-200/80 dark:border-navy-800 shrink-0">
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
                placeholder="Mau cari atau mengerjakan apa?"
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-slate-50 dark:bg-navy-900 text-[13.5px] text-navy-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-normal"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="w-10 h-10 rounded-xl bg-primary hover:bg-primary-600 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
                aria-label="Kirim pesan"
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
