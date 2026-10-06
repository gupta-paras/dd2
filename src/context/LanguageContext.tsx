'use client';

import React, { createContext, useContext, useSyncExternalStore, useCallback } from 'react';

export type Language = 'en' | 'nl';

export interface LanguageContextValue {
  language: Language;
  lang: Language;
  setLanguage: (lang: Language) => void;
  setLang: (lang: Language) => void;
  t: (en: string, nl: string) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  lang: 'en',
  setLanguage: () => {},
  setLang: () => {},
  t: (en) => en,
});

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('desi_dutch_lang_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('desi_dutch_lang_change', callback);
  };
}

function getSnapshot(): Language {
  try {
    const val = localStorage.getItem('desi_dutch_lang');
    if (val === 'en' || val === 'nl') return val;
  } catch {}
  return 'en';
}

function getServerSnapshot(): Language {
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLanguage = useCallback((newLang: Language) => {
    try {
      localStorage.setItem('desi_dutch_lang', newLang);
      window.dispatchEvent(new Event('desi_dutch_lang_change'));
    } catch {}
  }, []);

  const t = useCallback(
    (en: string, nl: string) => {
      return language === 'nl' ? nl : en;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        lang: language,
        setLanguage,
        setLang: setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
