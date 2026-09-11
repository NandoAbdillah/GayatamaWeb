'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Locale } from '@/context/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

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
    { code: 'id' as Locale, name: 'Indonesia', flag: '🇮🇩', label: 'ID' },
    { code: 'en' as Locale, name: 'English', flag: '🇬🇧', label: 'EN' },
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Pilih Bahasa / Select Language"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-navy-700 bg-white/90 dark:bg-navy-900/90 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-navy-800 transition-all shadow-xs"
      >
        <span className="text-sm">{currentLang.flag}</span>
        <span className="font-mono text-[11px] font-bold">{currentLang.label}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Bahasa / Language
          </div>
          {languages.map((lang) => {
            const isSelected = lang.code === locale;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLocale(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-left transition-colors ${
                  isSelected
                    ? 'bg-primary/10 text-primary dark:text-primary-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
