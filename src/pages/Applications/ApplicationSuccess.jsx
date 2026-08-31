import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguageContext } from '../../context/LanguageContext';
import { translations } from '../../translations';
// We would ideally fetch the job based on applicationId, but for the prototype
// we can hardcode or retrieve from a lightweight state.
// Since the prompt allows simulating the job details from a mock, let's just 
// use a fallback if not provided via navigation state.
import { useLocation } from 'react-router-dom';

export default function ApplicationSuccess() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const locationState = useLocation().state || {};
  const { language } = useLanguageContext();
  const t = (key) => translations[language]?.[key] || translations['en']?.[key] || key;

  const [isPlaying, setIsPlaying] = useState(false);

  // Use state from previous page if available, else mock fallback for display
  const jobTitle = locationState.jobTitle || 'Tailor';
  const company = locationState.company || 'ABC Garments';
  const jobLocation = locationState.jobLocation || 'Salem';
  const workType = locationState.workType || 'Full-time';

  const subtitle = t('appSuccess_subtitle').replace('{company}', company);

  return (
    <div className="flex-grow w-full flex flex-col relative z-10 min-h-screen">
      {/* Atmospheric Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 rounded-full mix-blend-multiply opacity-50 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(157,238,229,0.3) 0%, rgba(157,238,229,0) 70%)' }}></div>
        <div className="absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-secondary-fixed/20 rounded-full mix-blend-multiply opacity-40 blur-3xl"></div>
        <div className="absolute bottom-[20%] left-[20%] w-[400px] h-[400px] rounded-full mix-blend-multiply opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(157,238,229,0.3) 0%, rgba(157,238,229,0) 70%)' }}></div>
        
        {/* Dotted Path Background */}
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path className="animate-[dash_20s_linear_infinite]" d="M 0,100 C 300,200 400,-50 800,100 S 1200,300 1600,150" fill="none" stroke="rgba(12, 111, 103, 0.2)" strokeWidth="2" strokeDasharray="10 10"></path>
          <path className="animate-[dash_20s_linear_infinite]" d="M -200,400 C 200,500 500,200 900,400 S 1400,600 1800,350" fill="none" stroke="rgba(18, 53, 91, 0.15)" strokeWidth="2" strokeDasharray="10 10" style={{ animationDirection: 'reverse' }}></path>
        </svg>
      </div>

      <div className="relative z-10 pt-stack-sm md:pt-stack-md pb-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex flex-col items-center w-full">
        
        {/* Application Journey */}
        <div className="w-full max-w-3xl mb-stack-lg hidden md:block">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-surface-variant -z-10"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-primary-container -z-10"></div>
            
            <div className="flex flex-col items-center gap-base bg-surface px-4">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">check</span>
              </div>
              <span className="font-label-sm text-on-surface-variant">{t('reviewApp_journeyJobDetails')}</span>
            </div>
            
            <div className="flex flex-col items-center gap-base bg-surface px-4">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[16px]">check</span>
              </div>
              <span className="font-label-sm text-on-surface-variant">{t('reviewApp_journeyReview')}</span>
            </div>
            
            <div className="flex flex-col items-center gap-base bg-surface px-4">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              </div>
              <span className="font-label-sm text-primary font-bold">{t('reviewApp_journeySubmitted')}</span>
            </div>
          </div>
        </div>

        {/* Central Success Element */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-stack-lg mt-stack-md">
          <div className="absolute inset-0 rounded-full bg-secondary-container/20 animate-[pulseSuccess_2s_infinite]"></div>
          <div className="absolute inset-4 rounded-full bg-secondary-container/40 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-surface shadow-[0_8px_32px_rgba(18,53,91,0.15)] flex items-center justify-center border-4 border-on-secondary-container z-10">
              <svg className="w-16 h-16 text-on-secondary-container" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24">
                <path className="animate-[drawCheck_1s_ease-out_forwards_0.5s]" strokeDasharray="100" strokeDashoffset="100" d="M20 6L9 17l-5-5"></path>
              </svg>
            </div>
          </div>
          {/* Decorative Nodes around Success Element */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-tertiary-fixed rounded-full animate-ping"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 bg-secondary-fixed rounded-full"></div>
        </div>

        {/* Success Message */}
        <div className="text-center max-w-2xl mb-stack-lg animate-fade-in">
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary-container mb-stack-sm">{t('appSuccess_title')}</h1>
          <p className="font-body-lg text-on-surface-variant">{subtitle}</p>
          {applicationId && (
            <p className="font-label-sm text-outline mt-2 tracking-wide">ID: {applicationId}</p>
          )}
        </div>

        {/* Job Confirmation Card */}
        <div className="bg-surface/70 backdrop-blur-md w-full max-w-2xl rounded-xl p-stack-md mb-stack-lg flex flex-col md:flex-row items-center gap-stack-md shadow-[0_4px_24px_rgba(18,53,91,0.08)] border border-white/40 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex-grow text-center md:text-left">
            <h3 className="font-headline-md text-primary mb-1">{jobTitle} at {company}</h3>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-on-surface-variant font-body-md">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">location_on</span> {jobLocation}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">schedule</span> {workType}</span>
            </div>
          </div>
          <div className="bg-secondary-container/30 text-on-secondary-container px-4 py-2 rounded-full font-label-md flex items-center gap-2 border border-secondary-fixed">
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span> {t('appSuccess_sent')}
          </div>
        </div>

        {/* What Happens Next */}
        <div className="w-full max-w-2xl mb-stack-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h4 className="font-headline-lg text-on-surface mb-stack-md text-center">{t('appSuccess_happensNext')}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter relative">
            {/* Connecting Line for desktop */}
            <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-0.5 bg-outline-variant/30 border-t-2 border-dashed border-outline-variant/50 -z-10"></div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center mb-stack-sm shadow-sm z-10">
                <span className="material-symbols-outlined">send</span>
              </div>
              <span className="font-label-md text-on-surface font-semibold mb-1">{t('appSuccess_step1Title')}</span>
              <span className="font-label-sm text-on-surface-variant">{t('appSuccess_step1Desc')}</span>
            </div>
            
            <div className="flex flex-col items-center text-center mt-6 md:mt-0">
              <div className="w-14 h-14 rounded-full bg-surface border-2 border-primary-container text-primary-container flex items-center justify-center mb-stack-sm z-10">
                <span className="material-symbols-outlined">visibility</span>
              </div>
              <span className="font-label-md text-on-surface font-semibold mb-1">{t('appSuccess_step2Title')}</span>
              <span className="font-label-sm text-on-surface-variant">{t('appSuccess_step2Desc')}</span>
            </div>
            
            <div className="flex flex-col items-center text-center mt-6 md:mt-0">
              <div className="w-14 h-14 rounded-full bg-surface border-2 border-outline-variant text-outline flex items-center justify-center mb-stack-sm z-10">
                <span className="material-symbols-outlined">notifications_active</span>
              </div>
              <span className="font-label-md text-on-surface font-semibold mb-1">{t('appSuccess_step3Title')}</span>
              <span className="font-label-sm text-on-surface-variant">{t('appSuccess_step3Desc')}</span>
            </div>
          </div>
          
          {/* Voice Guidance Button */}
          <div className="flex justify-center mt-stack-md">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-base bg-secondary-container/50 hover:bg-secondary-container text-on-secondary-container px-6 py-3 rounded-full transition-colors duration-300 font-label-md group"
            >
              <span className={`material-symbols-outlined transition-transform ${isPlaying ? 'animate-pulse' : 'group-hover:scale-110'}`} style={{ fontVariationSettings: "'FILL' 1" }}>volume_up</span>
              {t('appSuccess_listen')}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-stack-sm w-full max-w-md justify-center mb-stack-lg z-20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <button 
            onClick={() => navigate('/applications')}
            className="bg-primary-container hover:bg-on-primary-fixed-variant text-on-primary px-8 py-4 rounded-full font-label-md flex-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2 group"
          >
            {t('appSuccess_trackApp')}
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
          <button 
            onClick={() => navigate('/jobs')}
            className="bg-surface hover:bg-surface-variant border border-outline text-on-surface px-8 py-4 rounded-full font-label-md flex-1 transition-colors duration-300 text-center"
          >
            {t('appSuccess_findJobs')}
          </button>
        </div>
      </div>

      {/* Required keyframes are usually in index.css but added inline support via tailwind plugins if needed */}
      <style>{`
        @keyframes pulseSuccess {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(12, 111, 103, 0.3); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(12, 111, 103, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(12, 111, 103, 0); }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
}