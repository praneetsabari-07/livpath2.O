import { useLanguageContext } from '../context/LanguageContext';
import { translations } from '../translations';

export const useLanguage = () => {
  const { language, setLanguage, isWelcomeModalOpen, setIsWelcomeModalOpen, isInitialized } = useLanguageContext();
  const t = (key) => translations[language]?.[key] || key;
  return { language, setLanguage, t, isWelcomeModalOpen, setIsWelcomeModalOpen, isInitialized };
};