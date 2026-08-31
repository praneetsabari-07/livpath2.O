import { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { translations } from '../translations';

const SPEECH_CODES = {
  en: 'en-IN',
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
};

const LANGUAGE_NAMES = {
  en: 'English',
  ta: 'தமிழ் (Tamil)',
  hi: 'हिन्दी (Hindi)',
  te: 'తెలుగు (Telugu)',
  kn: 'ಕನ್ನಡ (Kannada)',
  ml: 'മലയാളം (Malayalam)',
  mr: 'मराठी (Marathi)',
  bn: 'বাংলা (Bengali)',
  gu: 'ગુજરાતી (Gujarati)',
  pa: 'ਪੰਜਾਬੀ (Punjabi)',
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('livpath-language-selected');
    if (stored && translations[stored]) {
      setLanguageState(stored);
    } else {
      setIsWelcomeModalOpen(true);
    }
    setIsInitialized(true);
  }, []);

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      localStorage.setItem('livpath-language-selected', lang);
    }
  };

  const t = useMemo(() => {
    return (key, fallback) => {
      const currentDict = translations[language] || translations.en || {};
      const fallbackDict = translations.en || {};
      return currentDict[key] || fallbackDict[key] || fallback || key;
    };
  }, [language]);

  const languageInfo = useMemo(() => {
    return {
      code: language,
      name: LANGUAGE_NAMES[language] || 'English',
      speechCode: SPEECH_CODES[language] || 'en-IN',
    };
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
    languageInfo,
    isWelcomeModalOpen,
    setIsWelcomeModalOpen,
    isInitialized,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useLanguageContext = useLanguage;
