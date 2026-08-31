import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguageContext } from '../../context/LanguageContext';
import { translations } from '../../translations';
import { jobService } from '../../services/jobService';

export default function JobMatching() {
  const navigate = useNavigate();
  const { profileData } = useAuth();
  const { language } = useLanguageContext();
  const t = (key) => translations[language]?.[key] || translations['en']?.[key] || key;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [matchedJobs, setMatchedJobs] = useState([]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await jobService.getMatchedJobs(profileData);
        if (isMounted) {
          if (response && response.success) {
            setMatchedJobs(response.jobs || []);
            setLoading(false);
          } else {
            setError(true);
            setLoading(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchJobs();

    return () => {
      isMounted = false;
    };
  }, [profileData]);

  const prefs = profileData?.jobPreferences || {};
  const userSkills = prefs.skills && prefs.skills.length > 0 ? prefs.skills.join(', ') : 'No specific skills provided';

  const handleViewAllJobs = () => {
    navigate('/jobs', { state: { matchedJobs } });
  };

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`, { state: { from: 'matching' } });
  };

  return (
    <div className="flex-grow w-full flex flex-col relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-md gap-stack-lg">
      
      {/* Atmospheric Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-80" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(15, 118, 110, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.05) 0%, transparent 40%)', backgroundSize: '100% 100%' }}></div>
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-30" preserveAspectRatio="none">
        <path className="animate-[dash_20s_linear_infinite]" d="M -100 200 Q 300 100 500 300 T 1200 100" fill="none" stroke="#0F766E" strokeWidth="2" strokeDasharray="8 8" style={{ strokeDashoffset: loading ? '0' : '-100' }}></path>
        <circle className="animate-pulse" cx="500" cy="300" fill="#F59E0B" r="4"></circle>
      </svg>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center flex-grow z-10 animate-fade-in text-center mt-20">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-secondary opacity-20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-secondary border-t-transparent animate-spin"></div>
            <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary text-3xl">search</span>
          </div>
          <h2 className="font-headline-lg text-primary mb-2">{t('jobMatching_loadingTitle')}</h2>
          <p className="font-body-lg text-on-surface-variant">{t('jobMatching_loadingSubtitle')}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center flex-grow z-10 animate-fade-in text-center mt-20">
          <span className="material-symbols-outlined text-error text-6xl mb-4">error_outline</span>
          <h2 className="font-headline-lg text-primary mb-2">Oops!</h2>
          <p className="font-body-lg text-on-surface-variant mb-6">{t('jobMatching_error')}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md"
          >
            {t('jobMatching_tryAgain')}
          </button>
        </div>
      ) : (
        <div className="z-10 flex flex-col gap-stack-lg flex-grow pb-stack-lg">
          {/* Welcome & Voice Context */}
          <section className="flex flex-col gap-stack-md animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="font-display-lg-mobile md:font-display-lg text-primary mb-2">
                  {t('jobMatching_title')}
                </h1>
                <p className="font-body-lg text-on-surface-variant flex items-center gap-2 flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span>
                  {t('jobMatching_subtitle')} <strong className="text-primary">{userSkills}</strong>
                </p>
              </div>

              {/* Voice AI Integration */}
              <div className="bg-[#F0FDFA] rounded-2xl p-4 flex items-center gap-4 border border-secondary/20 shadow-[0px_4px_20px_rgba(18,53,91,0.05)] w-full md:w-auto">
                <button className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center hover:bg-secondary/90 transition-colors shrink-0">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                </button>
                <div>
                  <p className="font-label-md text-secondary mb-1">{t('jobMatching_voicePrompt')}</p>
                  <p className="font-label-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">volume_up</span> {t('jobMatching_voiceSubtext')}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2 mt-2">
              <button className="px-4 py-2 rounded-full border border-secondary text-secondary font-label-md hover:bg-[#F0FDFA] transition-colors bg-surface">
                {prefs.workType || 'Any Time'}
              </button>
              <button className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-label-md hover:bg-surface-container transition-colors bg-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">location_on</span> 
                {prefs.locationType === 'Specific' ? prefs.specificLocation : 'Near me'}
              </button>
            </div>
          </section>

          {/* Recommended Jobs Grid */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-md text-primary">{t('jobMatching_recommended')}</h2>
              <button 
                onClick={handleViewAllJobs}
                className="text-secondary font-label-md hover:underline flex items-center gap-1"
              >
                View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {matchedJobs.slice(0, 3).map((job, idx) => (
                <div 
                  key={job.id} 
                  className="bg-surface rounded-xl p-6 shadow-[0px_4px_20px_rgba(18,53,91,0.05)] hover:shadow-[0px_8px_30px_rgba(18,53,91,0.08)] transition-all duration-300 flex flex-col gap-4 animate-fade-in"
                  style={{ animationDelay: `${idx * 0.15}s` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-2xl">{job.icon || 'work'}</span>
                    </div>
                    {job.badges && job.badges.length > 0 && (
                      <span className={`px-3 py-1 bg-${job.badges[0].color}/10 text-${job.badges[0].color} rounded-full font-label-sm flex items-center gap-1`}>
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {job.badges[0].icon}
                        </span> 
                        {job.badges[0].text === 'Matches your skills' ? t('jobMatching_matchesSkills') : 
                         job.badges[0].text === 'High Demand' ? t('jobMatching_highDemand') : job.badges[0].text}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-headline-md text-primary text-xl">{job.title}</h3>
                    <p className="font-body-md text-on-surface-variant">{job.company}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-on-surface-variant font-label-sm flex items-center gap-1 bg-surface-container px-2 py-1 rounded">
                      <span className="material-symbols-outlined text-[16px]">location_on</span> {job.location}
                    </span>
                    <span className="text-on-surface-variant font-label-sm flex items-center gap-1 bg-surface-container px-2 py-1 rounded">
                      <span className="material-symbols-outlined text-[16px]">schedule</span> {job.workType}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => handleViewJob(job.id)}
                    className="mt-auto w-full py-3 bg-primary-container text-on-primary rounded-lg font-label-md hover:bg-primary-container/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {t('jobMatching_viewJob')} <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}