'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Locale } from '@/context/LanguageContext';
import { Check, ChevronDown } from 'lucide-react';

function IndonesiaFlag({ className = 'w-[19px] h-[13px]' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      className={`${className} rounded-[2.5px] shadow-[0_0_0_1px_rgba(0,0,0,0.12)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.18)] shrink-0 overflow-hidden inline-block align-middle`}
      aria-hidden="true"
    >
      <rect width="60" height="20" fill="#E70011" />
      <rect y="20" width="60" height="20" fill="#FFFFFF" />
    </svg>
  );
}

function UKFlag({ className = 'w-[19px] h-[13px]' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 40"
      className={`${className} rounded-[2.5px] shadow-[0_0_0_1px_rgba(0,0,0,0.12)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.18)] shrink-0 overflow-hidden inline-block align-middle`}
      aria-hidden="true"
    >
      <clipPath id="uk-flag-clip-ls">
        <path d="M0,0 v40 h60 v-40 z" />
      </clipPath>
      <clipPath id="uk-flag-diagonals-ls">
        <path d="M30,20 L60,40 H0 z M30,20 L60,0 H0 z M30,20 L0,40 V0 z M30,20 L60,40 V0 z" />
      </clipPath>
      <g clipPath="url(#uk-flag-clip-ls)">
        <path d="M0,0 v40 h60 v-40 z" fill="#012169" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" strokeWidth="6.67" />
        <path d="M0,0 L60,40 M60,0 L0,40" clipPath="url(#uk-flag-diagonals-ls)" stroke="#C8102E" strokeWidth="4.44" />
        <path d="M30,0 v40 M0,20 h60" stroke="#fff" strokeWidth="10.67" />
        <path d="M30,0 v40 M0,20 h60" stroke="#C8102E" strokeWidth="6.4" />
      </g>
    </svg>
  );
}

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'id' as Locale, label: 'IDN' },
    { code: 'en' as Locale, label: 'ENG' },
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  return (
    <div className={`relative inline-block text-left font-jakarta ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Pilih Bahasa / Select Language"
        className="inline-flex items-center gap-1.5 px-2.5 h-9 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200/80 dark:bg-navy-900 dark:hover:bg-navy-800 text-navy-950 dark:text-slate-100 border border-slate-200/80 dark:border-navy-700 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20"
        title={locale === 'id' ? 'Bahasa Indonesia' : 'English'}
      >
        <span className="flex items-center shrink-0">
          {currentLang.code === 'id' ? <IndonesiaFlag /> : <UKFlag />}
        </span>
        <span className="font-bold text-[12px] tracking-wide text-navy-950 dark:text-white">
          {currentLang.label}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 ml-0.5 ${
            isOpen ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-2xl bg-white dark:bg-navy-900 p-1.5 shadow-2xl ring-1 ring-slate-900/10 dark:ring-black/40 border border-slate-100 dark:border-navy-800 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-navy-800/80 mb-1">
            Bahasa / Language
          </div>
          <div className="space-y-1">
            {languages.map((lang) => {
              const isSelected = lang.code === locale;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLocale(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all duration-150 ${
                    isSelected
                      ? 'bg-primary/10 text-primary dark:text-primary-300 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 hover:text-navy-950 dark:hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="flex items-center shrink-0">
                      {lang.code === 'id' ? <IndonesiaFlag /> : <UKFlag />}
                    </span>
                    <span className="font-bold tracking-wide">{lang.label}</span>
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
