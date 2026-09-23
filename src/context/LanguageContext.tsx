import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, LanguageInfo } from '../types';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../data/translations';
import { translations as legacyTranslations } from '../translations';

interface LanguageContextType {
  language: SupportedLanguage;
  languageInfo: LanguageInfo;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  allLanguages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'livpath_language_preference';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('livpath-language-selected');
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
        return saved as SupportedLanguage;
      }
    } catch (e) {
      // localStorage may fail in some environments
    }
    return 'ta'; // Default to Tamil / Indian regional preference as highlighted by user
  });

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      localStorage.setItem('livpath-language-selected', newLang);
      document.documentElement.lang = newLang;
    } catch (e) {
      console.warn('Could not save language preference:', e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const languageInfo = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  const t = (key: string, fallback?: string): string => {
    // 1. Try TRANSLATIONS dictionary
    const langDict = TRANSLATIONS[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // 2. Try legacy translations dictionary
    const legacyDict = (legacyTranslations as any)?.[language] || (legacyTranslations as any)?.en;
    if (legacyDict && legacyDict[key]) {
      return legacyDict[key];
    }
    // 3. Fallback to English dictionary
    const enDict = TRANSLATIONS['en'];
    if (enDict && enDict[key]) {
      return enDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        languageInfo,
        setLanguage,
        t,
        allLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useLanguageContext = useLanguage;
