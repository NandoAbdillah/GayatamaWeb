'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import idMessages from '@/messages/id.json';
import enMessages from '@/messages/en.json';

export type Locale = 'id' | 'en';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const messagesMap: Record<Locale, any> = {
  id: idMessages,
  en: enMessages,
};

const LanguageContext = createContext<LanguageContextType>({
  locale: 'id',
  setLocale: () => {},
  toggleLocale: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('id');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gayatama_locale') as Locale;
      if (saved && (saved === 'id' || saved === 'en')) {
        setLocaleState(saved);
        document.documentElement.lang = saved;
      }
    } catch (e) {}
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    document.documentElement.lang = newLocale;
    try {
      localStorage.setItem('gayatama_locale', newLocale);
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    } catch (e) {}
  };

  const toggleLocale = () => {
    setLocale(locale === 'id' ? 'en' : 'id');
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale }}>
      <NextIntlClientProvider
        locale={locale}
        messages={messagesMap[locale]}
        timeZone="Asia/Jakarta"
      >
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
