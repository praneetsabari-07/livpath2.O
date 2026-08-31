import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguageContext } from '../../context/LanguageContext';
import { translations } from '../../translations';
import OnboardingStepper from '../../components/layout/OnboardingStepper';

export default function ProfileSetupComplete() {
  const navigate = useNavigate();
  const { profileData } = useAuth();
  const { language } = useLanguageContext();
  const t = (key) => translations[language]?.[key] || translations['en']?.[key] || key;

  const prefs = profileData?.jobPreferences || {};

  return (
    <div className="flex-grow w-full flex flex-col relative z-10 px-margin-mobile md:px-margin-desktop py-stack-md max-w-container-max mx-auto">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '6s' }}></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
        <div className="absolute bottom-60 left-1/4 w-40 h-40 bg-secondary/5 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path className="animate-pulse" d="M-50,200 Q 300,100 500,400 T 1200,300" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="8 8" style={{ animationDuration: '30s', animationName: 'dash', animationTimingFunction: 'linear' }}></path>
          <circle className="animate-pulse" cx="200" cy="155" fill="#F59E0B" r="4"></circle>
          <circle className="animate-pulse" cx="700" cy="350" fill="#0F766E" r="4"></circle>
          <path className="animate-pulse" d="M1200,600 Q 800,800 400,600 T -100,700" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="8 8" style={{ animationDuration: '30s', animationDirection: 'reverse', animationName: 'dash', animationTimingFunction: 'linear' }}></path>
          <circle className="animate-pulse" cx="800" cy="650" fill="#0F766E" r="4"></circle>
        </svg>
      </div>

      <div className="flex flex-col items-center justify-center w-full relative z-10">
        {/* Progress Stepper */}
        <OnboardingStepper currentStep={5} className="mb-stack-md" />

        {/* Success Visual */}
        <div className="relative w-32 h-32 mb-stack-md flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse" style={{ animationDuration: '3s' }}></div>
          <div className="absolute inset-4 bg-secondary/10 rounded-full border border-secondary/20 animate-fade-in"></div>
          <div className="absolute inset-8 bg-surface rounded-full shadow-[0px_8px_30px_rgba(18,53,91,0.08)] flex items-center justify-center relative overflow-hidden animate-scale-in">
            {/* CSS Ripple alternative without requiring complex external keyframes */}
            <div className="absolute w-full h-full rounded-full border-2 border-secondary opacity-50 animate-ping" style={{ animationDuration: '2s' }}></div>
            <span className="material-symbols-outlined text-secondary text-4xl font-bold relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
          </div>
          {/* Nodes */}
          <div className="absolute top-0 right-4 w-3 h-3 bg-accent rounded-full border-2 border-[#F4F6F1]"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-secondary rounded-full"></div>
        </div>

        {/* Typography */}
        <div className="text-center max-w-xl mb-stack-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-primary mb-4">{t('profileSetup_title')}</h1>
          <p className="font-body-lg text-on-surface-variant">{t('profileSetup_subtitle')}</p>
        </div>

        {/* Voice Guidance Banner */}
        <div className="bg-[#F0FDFA] border border-secondary/20 rounded-lg p-4 flex items-start gap-4 mb-stack-lg max-w-2xl w-full animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="bg-secondary/10 rounded-full p-2 flex-shrink-0 mt-1 text-secondary">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>record_voice_over</span>
          </div>
          <div>
            <p className="font-body-md text-on-surface">{t('profileSetup_banner')}</p>
          </div>
        </div>

        {/* Profile Summary Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl w-full mb-stack-lg animate-fade-in" style={{ animationDelay: '400ms' }}>
          {/* Skills */}
          <div className="bg-surface rounded-xl p-6 shadow-[0px_4px_20px_rgba(18,53,91,0.05)] border border-outline-variant/50 relative overflow-hidden group hover:shadow-[0px_8px_30px_rgba(18,53,91,0.08)] transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -z-0"></div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <span className="material-symbols-outlined text-outline text-[20px]">design_services</span>
              <h3 className="font-label-sm text-outline tracking-widest uppercase">{t('profileSetup_skills')}</h3>
            </div>
            <div className="flex flex-wrap gap-2 relative z-10">
              {(prefs.skills || []).length > 0 ? (
                prefs.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-secondary/10 text-secondary font-label-md rounded-full border border-secondary/20">{skill}</span>
                ))
              ) : (
                <span className="font-body-md text-on-surface-variant opacity-70">None selected</span>
              )}
            </div>
          </div>

          {/* Work Type */}
          <div className="bg-surface rounded-xl p-6 shadow-[0px_4px_20px_rgba(18,53,91,0.05)] border border-outline-variant/50 relative overflow-hidden group hover:shadow-[0px_8px_30px_rgba(18,53,91,0.08)] transition-shadow">
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-secondary/5 rounded-tr-full -z-0"></div>
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <span className="material-symbols-outlined text-outline text-[20px]">schedule</span>
              <h3 className="font-label-sm text-outline tracking-widest uppercase">{t('profileSetup_workType')}</h3>
            </div>
            <p className="font-headline-md text-primary relative z-10">{prefs.workType || 'Any'}</p>
          </div>

          {/* Location */}
          <div className="bg-surface rounded-xl p-6 shadow-[0px_4px_20px_rgba(18,53,91,0.05)] border border-outline-variant/50 relative overflow-hidden group hover:shadow-[0px_8px_30px_rgba(18,53,91,0.08)] transition-shadow">
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <span className="material-symbols-outlined text-outline text-[20px]">location_on</span>
              <h3 className="font-label-sm text-outline tracking-widest uppercase">{t('profileSetup_location')}</h3>
            </div>
            <p className="font-body-lg text-on-surface relative z-10">
              {prefs.locationType === 'Specific' ? prefs.specificLocation : (prefs.locationType || 'Anywhere')}
            </p>
          </div>

          {/* Experience */}
          <div className="bg-surface rounded-xl p-6 shadow-[0px_4px_20px_rgba(18,53,91,0.05)] border border-outline-variant/50 relative overflow-hidden group hover:shadow-[0px_8px_30px_rgba(18,53,91,0.08)] transition-shadow">
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <span className="material-symbols-outlined text-outline text-[20px]">work_history</span>
              <h3 className="font-label-sm text-outline tracking-widest uppercase">{t('profileSetup_experience')}</h3>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              {prefs.hasExperience ? (
                <>
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <p className="font-body-md text-on-surface">Previous work experience</p>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-outline">cancel</span>
                  <p className="font-body-md text-on-surface-variant">No previous work experience</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <button 
            onClick={() => navigate('/job-matching')}
            className="bg-primary text-on-primary font-label-md text-lg px-8 py-4 rounded-lg hover:bg-primary/90 hover:shadow-[0px_8px_30px_rgba(18,53,91,0.15)] hover:-translate-y-0.5 transition-all group flex items-center gap-3"
          >
            {t('profileSetup_cta')}
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
          
          <button 
            onClick={() => navigate('/job-preferences')}
            className="text-on-surface-variant font-label-md hover:text-primary underline-offset-4 hover:underline transition-colors"
          >
            {t('profileSetup_edit')}
          </button>
        </div>

      </div>

    </div>
  );
}
