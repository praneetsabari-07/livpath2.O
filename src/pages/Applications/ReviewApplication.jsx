import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguageContext } from '../../context/LanguageContext';
import { translations } from '../../translations';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';

export default function ReviewApplication() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { profileData } = useAuth();
  const { language } = useLanguageContext();
  const t = (key) => translations[language]?.[key] || translations['en']?.[key] || key;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Application submission states: 'idle', 'confirmation', 'submitting', 'error'
  const [submissionState, setSubmissionState] = useState('idle');

  useEffect(() => {
    let isMounted = true;
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await jobService.getJobById(jobId);
        if (isMounted) {
          if (response && response.success && response.job) {
            setJob(response.job);
          } else {
            setError(true);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };
    fetchJob();
    return () => { isMounted = false; };
  }, [jobId]);

  const handleConfirmClick = () => {
    // Move to confirmation state instead of submitting immediately
    setSubmissionState('confirmation');
  };

  const handleCancel = () => {
    setSubmissionState('idle');
  };

  const submitApplication = async () => {
    setSubmissionState('submitting');
    try {
      // Clean payload construction
      const applicationData = {
        jobId,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        workType: job.workType,
        profileId: profileData?.personalDetails?.phone || 'unknown',
        applicant: {
          fullName: profileData?.personalDetails?.fullName,
          age: profileData?.personalDetails?.age,
          gender: profileData?.personalDetails?.gender,
          location: profileData?.personalDetails?.location,
        },
        preferences: profileData?.jobPreferences,
      };

      const response = await applicationService.submitApplication(applicationData);
      
      if (response && response.success) {
        navigate(`/application/success/${response.applicationId}`, {
          state: {
            jobTitle: job.title,
            company: job.company,
            jobLocation: job.location,
            workType: job.workType
          }
        });
      } else {
        setSubmissionState('error');
      }
    } catch (err) {
      setSubmissionState('error');
    }
  };

  if (loading) {
    return (
      <div className="flex-grow w-full flex flex-col items-center justify-center min-h-screen z-10 px-margin-mobile">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-secondary opacity-20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-secondary border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex-grow w-full flex flex-col items-center justify-center min-h-screen z-10 px-margin-mobile text-center">
        <span className="material-symbols-outlined text-error text-6xl mb-4">error_outline</span>
        <h2 className="font-headline-lg text-primary mb-2">Job Not Found</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md">
          {t('jobDetails_backToJobs')}
        </button>
      </div>
    );
  }

  const personal = profileData?.personalDetails || {};
  const prefs = profileData?.jobPreferences || {};

  return (
    <div className="flex-grow w-full flex flex-col relative z-10 min-h-screen">
      {/* Atmospheric Background Layers */}
      <div className="fixed inset-0" style={{ backgroundImage: 'radial-gradient(rgba(0, 106, 99, 0.1) 2px, transparent 2px)', backgroundSize: '30px 30px', zIndex: -2, pointerEvents: 'none', opacity: 0.6 }}></div>
      <div className="fixed rounded-full blur-[80px] opacity-30 pointer-events-none z-[-1] bg-secondary w-[60vw] h-[60vw] top-[-10vw] right-[-20vw]"></div>
      <div className="fixed rounded-full blur-[80px] opacity-30 pointer-events-none z-[-1] bg-primary-fixed-dim w-[50vw] h-[50vw] bottom-[20vw] left-[-10vw]"></div>
      
      {/* Animated SVG Dotted Pathway */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-[-1]" preserveAspectRatio="none" viewBox="0 0 1280 1500">
        <path className="animate-[dash_20s_linear_infinite]" d="M -100 400 C 300 400, 200 800, 600 1200 S 1000 1400, 1400 1600" fill="none" stroke="#006a63" strokeWidth="3" strokeDasharray="8 8" strokeLinecap="round" opacity="0.4"></path>
      </svg>

      <div className="w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-sm flex flex-col gap-stack-lg flex-grow pb-stack-lg">
        
        {/* Back Navigation & Journey Indicator */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-stack-sm">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md group">
            <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
            {t('jobDetails_backToJobs')}
          </button>
          
          {/* Journey Indicator */}
          <div className="flex items-center gap-2 font-label-sm">
            <div className="flex items-center gap-1 text-secondary">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <span className="hidden sm:inline">{t('reviewApp_journeyJobDetails')}</span>
            </div>
            <div className="h-px w-6 bg-outline-variant"></div>
            <div className="flex items-center gap-1 text-primary font-bold">
              <span className="material-symbols-outlined text-[16px] animate-pulse">radio_button_checked</span>
              <span>{t('reviewApp_journeyReview')}</span>
            </div>
            <div className="h-px w-6 bg-outline-variant"></div>
            <div className="flex items-center gap-1 text-outline">
              <span className="material-symbols-outlined text-[16px]">radio_button_unchecked</span>
              <span className="hidden sm:inline">{t('reviewApp_journeySubmitted')}</span>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          
          {/* Left Column: Review Sections */}
          <div className="lg:col-span-8 flex flex-col gap-stack-md">
            
            {/* Header & Summary */}
            <div className="flex flex-col gap-stack-sm mb-stack-sm animate-fade-in">
              <h1 className="font-display-lg-mobile md:font-display-lg text-primary flex items-center gap-stack-sm">
                <span className="material-symbols-outlined text-4xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
                {t('reviewApp_title')}
              </h1>
              <p className="font-body-lg text-on-surface-variant">
                {t('reviewApp_applyingFor')} <strong className="text-primary font-semibold uppercase">{job.title}, {job.company}, {job.location}, {job.workType}</strong>
              </p>
            </div>

            {/* Accessibility Button */}
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="self-start flex items-center gap-2 bg-secondary-container/30 text-on-secondary-container hover:bg-secondary-container/50 border border-secondary-fixed transition-colors px-4 py-2 rounded-full font-label-md shadow-sm mb-stack-sm group animate-fade-in"
            >
              <span className={`material-symbols-outlined text-secondary group-hover:text-primary transition-colors ${isPlaying ? 'animate-pulse' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>volume_up</span>
              {t('reviewApp_listen')}
            </button>

            {/* Profile Information Summary Sections */}
            <div className="bg-surface/70 backdrop-blur-md border border-white/40 shadow-[0px_8px_32px_rgba(18,53,91,0.05)] rounded-2xl p-stack-md flex flex-col gap-stack-md relative overflow-hidden animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/20 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
              
              {/* Personal Details */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-stack-sm pb-stack-sm border-b border-white/40">
                <div>
                  <h3 className="font-label-md text-on-surface-variant mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">person</span> {t('reviewApp_personalDetails')}
                  </h3>
                  <p className="font-body-md text-primary font-medium">{personal.fullName || 'Not provided'}</p>
                  <p className="font-body-md text-on-surface-variant text-sm">
                    {personal.gender || ''}{personal.gender && personal.age ? ' • ' : ''}{personal.age ? `${personal.age} years` : ''}{personal.location ? ` • ${personal.location}` : ''}
                  </p>
                </div>
                <Link to="/personal-details" className="font-label-sm text-secondary hover:text-primary transition-colors underline decoration-secondary/30 underline-offset-4 flex items-center gap-1">
                  {t('reviewApp_edit')} <span className="material-symbols-outlined text-[14px]">edit</span>
                </Link>
              </div>

              {/* Skills */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-stack-sm pb-stack-sm border-b border-white/40">
                <div>
                  <h3 className="font-label-md text-on-surface-variant mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">build</span> {t('reviewApp_skills')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {prefs.skills && prefs.skills.length > 0 ? prefs.skills.map((skill, idx) => (
                      <span key={idx} className="bg-surface-container-high px-3 py-1 rounded-full font-label-sm text-primary border border-outline-variant/30">{skill}</span>
                    )) : (
                      <span className="text-on-surface-variant font-label-sm">No skills added</span>
                    )}
                  </div>
                </div>
                <Link to="/job-preferences" className="font-label-sm text-secondary hover:text-primary transition-colors underline decoration-secondary/30 underline-offset-4 flex items-center gap-1 mt-2 sm:mt-0">
                  {t('reviewApp_edit')} <span className="material-symbols-outlined text-[14px]">edit</span>
                </Link>
              </div>

              {/* Work Preferences */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-stack-sm">
                <div>
                  <h3 className="font-label-md text-on-surface-variant mb-1 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">tune</span> {t('reviewApp_workPrefs')}
                  </h3>
                  <p className="font-body-md text-primary">
                    {prefs.workType || 'Any'}, {prefs.locationType === 'Specific' ? prefs.specificLocation : 'Near me'}
                  </p>
                </div>
                <Link to="/job-preferences" className="font-label-sm text-secondary hover:text-primary transition-colors underline decoration-secondary/30 underline-offset-4 flex items-center gap-1">
                  {t('reviewApp_edit')} <span className="material-symbols-outlined text-[14px]">edit</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Action Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-surface/70 backdrop-blur-md border border-white/40 rounded-2xl p-stack-md flex flex-col gap-stack-md text-center shadow-lg transform transition-transform duration-300">
              
              <div className="flex justify-center mb-2">
                <div className="w-16 h-16 rounded-full bg-secondary-container/50 flex items-center justify-center border-2 border-secondary-fixed">
                  <span className="material-symbols-outlined text-3xl text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>assignment_turned_in</span>
                </div>
              </div>
              
              <div>
                <h2 className="font-headline-md text-primary mb-1">Applying for {job.title}</h2>
                <p className="font-body-md text-on-surface-variant">{job.company}, {job.location}</p>
              </div>
              
              <div className="bg-surface-container-high/50 rounded-lg p-3 flex items-center justify-center gap-2 text-secondary font-medium font-label-md border border-white/40">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                ✓ {t('reviewApp_profileReady')}
              </div>
              
              <p className="font-label-sm text-on-surface-variant mt-2">
                {t('reviewApp_confirmText')}
              </p>

              {/* Error Message */}
              {submissionState === 'error' && (
                <div className="p-3 mt-2 bg-error-container text-on-error-container rounded-lg font-label-sm">
                  {t('reviewApp_submitError')}
                </div>
              )}

              {/* Actions based on state */}
              {submissionState === 'idle' || submissionState === 'error' ? (
                <button 
                  onClick={handleConfirmClick}
                  className="mt-4 w-full bg-primary-container text-on-primary font-label-md py-4 px-6 rounded-full flex justify-center items-center gap-2 hover:bg-primary-fixed-dim hover:text-primary transition-all duration-300 shadow-md transform hover:-translate-y-1 group"
                >
                  {t('reviewApp_confirmBtn')}
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              ) : submissionState === 'confirmation' ? (
                <div className="flex flex-col gap-3 mt-4">
                  <p className="font-label-md text-primary font-bold">Are you sure you want to submit?</p>
                  <button 
                    onClick={submitApplication}
                    className="w-full bg-primary text-on-primary font-label-md py-4 px-6 rounded-full flex justify-center items-center shadow-md transform hover:-translate-y-1 transition-transform"
                  >
                    Yes, Submit
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="w-full text-on-surface-variant font-label-sm py-2 px-4 rounded-full flex justify-center items-center hover:bg-surface-container-high transition-colors"
                  >
                    {t('reviewApp_cancelBtn')}
                  </button>
                </div>
              ) : (
                <button 
                  disabled
                  className="mt-4 w-full bg-surface-variant text-on-surface-variant font-label-md py-4 px-6 rounded-full flex justify-center items-center gap-2 shadow-sm cursor-not-allowed opacity-80"
                >
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  {t('reviewApp_submitting')}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}