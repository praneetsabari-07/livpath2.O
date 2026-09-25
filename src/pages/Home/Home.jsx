import { useNavigate } from 'react-router-dom';
import LanguageWelcomeModal from '../../components/language/LanguageWelcomeModal';
import { useLanguageContext } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../translations';

export default function Home() {
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const { profileData } = useAuth();
  const t = (key, fallback) => translations[language]?.[key] || translations['en']?.[key] || fallback || key;

  return (
    <>
      <LanguageWelcomeModal />
      <div className="pt-12 pb-24 px-margin-mobile md:px-margin-desktop relative z-10 flex flex-col items-center justify-center text-center">
      {/* Header Section */}
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-6 mb-16 relative">
        <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center shadow-md mb-4 transform hover:scale-105 transition-transform duration-300">
          <span className="material-symbols-outlined text-4xl text-secondary">route</span>
        </div>
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary tracking-tight">
          LivPath AI
        </h1>
        <h2 className="font-headline-lg text-headline-lg text-on-surface max-w-2xl">
          <span className="text-secondary relative">{t('home_findWork', 'Find work')}
            <svg className="absolute -bottom-2 left-0 w-full h-2 text-secondary/30" preserveAspectRatio="none" viewBox="0 0 100 10"><path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4"></path></svg>
          </span>
          {' '}{t('home_thatsRight', 'that’s right for you.')}
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
          {t('home_subtitle', 'LivPath AI helps you get guidance and find suitable jobs in a simple way.')}
        </p>
      </div>

      {/* Hero Visual (Interactive Microphone) */}
      <div className="relative w-full max-w-2xl mx-auto h-[25rem] flex items-center justify-center mb-16">
        {/* Connecting Paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 400">
          <path className="dotted-path" d="M400,200 C300,100 200,150 150,150" fill="none" stroke="#006a63" strokeOpacity="0.5" strokeWidth="2"></path>
          <path className="dotted-path" d="M400,200 C500,100 600,150 650,150" fill="none" stroke="#006a63" strokeOpacity="0.5" strokeWidth="2"></path>
          <path className="dotted-path" d="M400,200 C300,300 200,250 150,250" fill="none" stroke="#006a63" strokeOpacity="0.5" strokeWidth="2"></path>
          <path className="dotted-path" d="M400,200 C500,300 600,250 650,250" fill="none" stroke="#006a63" strokeOpacity="0.5" strokeWidth="2"></path>
          {/* Paths extending outward */}
          <path className="dotted-path" d="M400,200 C200,200 100,50 -50,100" fill="none" stroke="#12355b" strokeOpacity="0.4" strokeWidth="1.5"></path>
          <path className="dotted-path" d="M400,200 C600,200 700,350 850,300" fill="none" stroke="#f7ba83" strokeOpacity="0.4" strokeWidth="1.5"></path>
        </svg>

        {/* Feature Nodes */}
        <div className="absolute top-10 left-10 md:left-20 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center shadow-sm text-primary">
            <span className="material-symbols-outlined">person_add</span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">{t('home_createProfile', 'Create Profile')}</span>
        </div>
        <div className="absolute top-10 right-10 md:right-20 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center shadow-sm text-primary">
            <span className="material-symbols-outlined">translate</span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">{t('home_yourLanguage', 'Your Language')}</span>
        </div>
        <div className="absolute bottom-10 left-10 md:left-20 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center shadow-sm text-primary">
            <span className="material-symbols-outlined">psychology</span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">{t('home_weUnderstand', 'We Understand You')}</span>
        </div>
        <div className="absolute bottom-10 right-10 md:right-20 flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center shadow-sm text-primary">
            <span className="material-symbols-outlined">work</span>
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant whitespace-nowrap">{t('home_findJobs', 'Find Suitable Jobs')}</span>
        </div>

        {/* Central Microphone Cluster */}
        <div className="relative group cursor-pointer z-10" onClick={() => navigate('/auth/phone')}>
          {/* Soft ambient glow behind mic */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary-container rounded-full blur-3xl opacity-40"></div>
          
          {/* Concentric Rings */}
          <div className="absolute -inset-32 rounded-full border border-secondary/10 pulse-ring" style={{ animationDelay: '-2s' }}></div>
          <div className="absolute -inset-24 rounded-full border border-secondary/15 pulse-ring" style={{ animationDelay: '-1.5s' }}></div>
          <div className="absolute -inset-16 rounded-full border border-secondary/20 pulse-ring"></div>
          <div className="absolute -inset-10 rounded-full border border-secondary/30 pulse-ring" style={{ animationDelay: '-0.5s' }}></div>
          <div className="absolute -inset-4 rounded-full border border-secondary/40 pulse-ring" style={{ animationDelay: '-1s' }}></div>
          
          {/* Orbital Nodes */}
          <div className="absolute -inset-24 rounded-full border border-dashed border-secondary/30 animate-[spin_20s_linear_infinite]">
            <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
            <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-secondary shadow-[0_0_10px_rgba(0,106,99,0.5)]"></div>
            <div className="absolute top-1/2 -right-3 w-2 h-2 rounded-full bg-primary-container shadow-[0_0_8px_rgba(18,53,91,0.5)]"></div>
          </div>
          
          {/* Main Button */}
          <div className="relative w-24 h-24 rounded-full bg-white shadow-[0_8px_30px_rgba(18,53,91,0.15)] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <span className="material-symbols-outlined text-4xl text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
          </div>
          
          {/* Indicators below mic */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-primary-container"></div>
          </div>
        </div>
      </div>

      {/* User Profile Card & Call to Action */}
      <div className="flex flex-col items-center gap-6 mb-20 z-10 relative w-full max-w-xl">
        {/* Profile Card if details are present */}
        {profileData && (profileData.fullName || profileData.skills?.length > 0) && (
          <div 
            onClick={() => navigate('/profile')} 
            className="w-full glass-panel p-5 rounded-2xl border border-secondary/30 bg-surface/80 hover:border-secondary shadow-md transition-all duration-300 cursor-pointer flex items-center justify-between gap-4 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-container to-secondary text-on-primary flex items-center justify-center font-headline-md font-bold shadow-md">
                {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-headline-md text-primary font-bold group-hover:text-secondary transition-colors">
                    {profileData.fullName || 'My Profile'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-secondary-container text-on-secondary-container">
                    {profileData.age ? `${profileData.age} yrs` : 'Active'}
                  </span>
                </div>
                <p className="font-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
                  {profileData.location || 'Salem, Tamil Nadu'}
                </p>
                {/* Skills tags */}
                {profileData.skills && profileData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {profileData.skills.slice(0, 4).map((sk) => (
                      <span key={sk} className="px-2 py-0.5 rounded-md text-[11px] bg-secondary/10 text-secondary font-medium">
                        {sk}
                      </span>
                    ))}
                    {profileData.skills.length > 4 && (
                      <span className="text-[11px] text-on-surface-variant font-medium self-center">
                        +{profileData.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 text-secondary font-label-md shrink-0">
              <span className="hidden sm:inline font-semibold">{t('home_viewProfile', 'View Profile')}</span>
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button onClick={() => navigate('/auth/phone')} className="flex items-center gap-3 px-8 py-4 rounded-xl bg-primary-container text-on-primary font-headline-md text-headline-md hover:bg-primary transition-all duration-300 shadow-[0_4px_20px_rgba(18,53,91,0.2)] hover:shadow-[0_8px_30px_rgba(18,53,91,0.3)] hover:-translate-y-1">
            {t('home_getStarted', 'Get Started')}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
          <button onClick={() => navigate('/profile')} className="flex items-center gap-2 px-6 py-4 rounded-xl border-2 border-primary-container/30 bg-surface/80 text-primary-container font-headline-md text-headline-md hover:bg-primary-container/10 transition-all duration-300 shadow-sm">
            <span className="material-symbols-outlined">person</span>
            <span>{t('home_myProfile', 'My Profile')}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-on-surface-variant bg-surface-container-low px-4 py-1.5 rounded-full border border-surface-variant">
          <span className="material-symbols-outlined text-sm text-secondary">language</span>
          <span className="font-label-sm text-label-sm">{t('home_voiceGuidanceAvailable', 'Voice guidance available in 10+ languages')}</span>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="w-full max-w-4xl mx-auto glass-panel rounded-2xl p-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-6 shadow-sm z-10 mb-20 relative">
        <div className="flex flex-col items-center justify-center flex-1 min-w-[9.375rem] text-center">
          <span className="material-symbols-outlined text-primary mb-2">touch_app</span>
          <span className="font-label-md text-label-md text-on-surface">{t('home_trustEasy', 'Easy to Use')}</span>
        </div>
        <div className="hidden md:block w-px h-10 bg-outline-variant/30"></div>
        <div className="flex flex-col items-center justify-center flex-1 min-w-[9.375rem] text-center">
          <span className="material-symbols-outlined text-primary mb-2">record_voice_over</span>
          <span className="font-label-md text-label-md text-on-surface">{t('home_trustVoice', 'Voice Guided')}</span>
        </div>
        <div className="hidden md:block w-px h-10 bg-outline-variant/30"></div>
        <div className="flex flex-col items-center justify-center flex-1 min-w-[9.375rem] text-center">
          <span className="material-symbols-outlined text-primary mb-2">translate</span>
          <span className="font-label-md text-label-md text-on-surface">{t('home_trustLang', 'In Your Language')}</span>
        </div>
        <div className="hidden md:block w-px h-10 bg-outline-variant/30"></div>
        <div className="flex flex-col items-center justify-center flex-1 min-w-[9.375rem] text-center">
          <span className="material-symbols-outlined text-primary mb-2">shield</span>
          <span className="font-label-md text-label-md text-on-surface">{t('home_trustSecure', 'Secure & Private')}</span>
        </div>
      </div>
      </div>
    </>
  );
}