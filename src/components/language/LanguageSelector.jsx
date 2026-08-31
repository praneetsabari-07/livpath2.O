import { useLanguage } from '../../hooks/useLanguage';

export default function LanguageSelector() {
  const { language, setIsWelcomeModalOpen } = useLanguage();
  
  const languageNames = {
    'en': 'English',
    'ta': 'தமிழ் (Tamil)',
    'hi': 'हिन्दी (Hindi)',
    'te': 'తెలుగు (Telugu)',
    'kn': 'ಕನ್ನಡ (Kannada)',
    'ml': 'മലയാളം (Malayalam)',
    'mr': 'मराठी (Marathi)',
    'bn': 'বাংলা (Bengali)',
    'gu': 'ગુજરાતી (Gujarati)',
    'pa': 'ਪੰਜਾਬੀ (Punjabi)'
  };
  
  return (
    <button
      onClick={() => setIsWelcomeModalOpen(true)}
      className="flex items-center gap-2 rounded-full border border-primary-container/15 bg-white/60 px-4 py-2 text-on-surface-variant transition-colors hover:border-primary-container/30 hover:text-primary-container"
    >
      <span className="material-symbols-outlined text-sm">language</span>
      <span className="font-label-md text-label-md">{languageNames[language] || 'English'}</span>
    </button>
  );
}