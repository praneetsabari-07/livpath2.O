import { useLanguage } from '../../hooks/useLanguage';

export default function LanguageWelcomeModal() {
  const { isWelcomeModalOpen, setIsWelcomeModalOpen, setLanguage, isInitialized } = useLanguage();

  if (!isInitialized || !isWelcomeModalOpen) return null;

  const handleSelect = (lang) => {
    setLanguage(lang);
    setIsWelcomeModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-on-background/30 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in zoom-in-95">
      <div className="bg-surface-container-lowest rounded-2xl shadow-[0_8px_30px_rgba(18,53,91,0.15)] p-8 max-w-md w-full mx-4 border border-outline-variant/30">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center mb-4 text-primary">
            <span className="material-symbols-outlined text-3xl">language</span>
          </div>
          <h2 className="font-headline-lg text-headline-md text-primary mb-2">Choose your language</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Select the language you are most comfortable with.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[
            { code: 'en', native: 'English', english: 'English' },
            { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
            { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
            { code: 'te', native: 'తెలుగు', english: 'Telugu' },
            { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada' },
            { code: 'ml', native: 'മലയാളം', english: 'Malayalam' },
            { code: 'mr', native: 'मराठी', english: 'Marathi' },
            { code: 'bn', native: 'বাংলা', english: 'Bengali' },
            { code: 'gu', native: 'ગુજરાતી', english: 'Gujarati' },
            { code: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi' },
          ].map((lang) => (
            <button 
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-outline-variant hover:border-secondary hover:bg-secondary/5 transition-colors group text-left"
            >
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-on-surface group-hover:text-primary">
                  {lang.native}
                </span>
                {lang.code !== 'en' && (
                  <span className="text-label-sm text-on-surface-variant font-medium">
                    {lang.english}
                  </span>
                )}
              </div>
              <span className="material-symbols-outlined text-outline group-hover:text-secondary opacity-0 group-hover:opacity-100 transition-opacity">
                chevron_right
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
