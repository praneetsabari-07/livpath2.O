import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguageContext } from '../../context/LanguageContext';
import { translations } from '../../translations';
import { jobService } from '../../services/jobService';
import { getJobMatchInsights, getQualificationGap } from '../../utils/jobMatchUtils';
import JobLocationMap from '../../components/jobs/JobLocationMap';

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { profileData } = useAuth();
  const { language } = useLanguageContext();
  const t = (key) => translations[language]?.[key] || translations['en']?.[key] || key;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [matchInsights, setMatchInsights] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await jobService.getJobById(jobId);
        
        if (isMounted) {
          if (response && response.success && response.job) {
            setJob(response.job);
            setMatchInsights(getJobMatchInsights(response.job, profileData));
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

    return () => {
      isMounted = false;
    };
  }, [jobId, profileData]);

  const handleApply = () => {
    navigate(`/application/review/${jobId}`);
  };

  if (loading) {
    return (
      <div className="flex-grow w-full flex flex-col items-center justify-center min-h-screen z-10 px-margin-mobile">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-secondary opacity-20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-secondary border-t-transparent animate-spin"></div>
          <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary text-3xl">work</span>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex-grow w-full flex flex-col items-center justify-center min-h-screen z-10 px-margin-mobile text-center">
        <span className="material-symbols-outlined text-error text-6xl mb-4">error_outline</span>
        <h2 className="font-headline-lg text-primary mb-2">Job Not Found</h2>
        <p className="font-body-lg text-on-surface-variant mb-6">We couldn't find the details for this job.</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md"
        >
          {t('jobDetails_backToJobs')}
        </button>
      </div>
    );
  }

  const gap = getQualificationGap(job, profileData);
  const gapHeadline =
    gap.level === 'ready'
      ? t('jobDetails_gapReady')
      : gap.level === 'close'
        ? t('jobDetails_gapClose')
        : t('jobDetails_gapStretch');

  return (
    <div className="flex-grow w-full flex flex-col relative z-10 min-h-screen">

      {/* Ambient Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute rounded-full blur-[80px] opacity-30 w-[600px] h-[600px] bg-primary-fixed-dim top-[-100px] right-[-100px]"></div>
        <div className="absolute rounded-full blur-[80px] opacity-30 w-[500px] h-[500px] bg-secondary-container bottom-[200px] left-[-150px]"></div>
        
        {/* Flowing Path SVG */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <path className="animate-[dash_20s_linear_infinite]" d="M 0 100 C 300 200, 700 50, 1000 300 S 1400 400, 2000 800" fill="none" opacity="0.3" stroke="#0F766E" strokeWidth="2" strokeDasharray="8 8"></path>
          <circle className="animate-pulse" cx="300" cy="150" fill="#F59E0B" r="4"></circle>
          <circle className="animate-pulse" cx="850" cy="180" fill="#0F766E" r="4" style={{ animationDelay: '1s' }}></circle>
        </svg>
      </div>

      <div className="w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-md flex flex-col gap-stack-lg flex-grow pb-stack-lg">
        
        {/* Back Navigation */}
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md w-max"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span> {t('jobDetails_backToJobs')}
        </button>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          
          {/* Left Column (Main Details) */}
          <div className="lg:col-span-8 flex flex-col gap-stack-md">
            
            {/* Job Hero */}
            <section className="bg-surface/70 backdrop-blur-md border border-white/40 shadow-[0px_4px_24px_rgba(18,53,91,0.05)] rounded-xl p-margin-mobile flex flex-col gap-stack-sm animate-fade-in relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="font-display-lg-mobile md:font-display-lg text-primary">{job.title}</h1>
                  <p className="font-body-lg text-on-surface-variant mt-2">{job.company}</p>
                </div>
                <button 
                  onClick={() => setSaved(!saved)}
                  className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}>
                    bookmark_border
                  </span>
                </button>
              </div>
              
              {/* Quick Info Pills */}
              <div className="flex flex-wrap gap-3 mt-4">
                <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-full font-label-sm">
                  <span className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span> {job.location}
                </div>
                <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-full font-label-sm">
                  <span className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>work</span> {job.workType}
                </div>
                {job.salary && (
                  <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-full font-label-sm">
                    <span className="material-symbols-outlined text-sm text-secondary">payments</span> {job.salary}
                  </div>
                )}
              </div>
            </section>

            {/* Voice Guidance */}
            <section className="bg-secondary-container/30 border border-secondary-container rounded-xl p-4 flex items-center justify-between animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-secondary">
                  <span className={`material-symbols-outlined ${isPlaying ? 'animate-pulse' : ''}`}>volume_up</span>
                </div>
                <div>
                  <h3 className="font-label-md font-semibold text-primary">{t('jobDetails_listenJob')}</h3>
                  <p className="font-label-sm text-on-surface-variant">{t('jobDetails_listenDesc')}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-primary text-on-primary px-4 py-2 rounded-full font-label-sm hover:bg-primary/90 transition-colors"
              >
                {t('jobDetails_play')}
              </button>
            </section>

            {/* Why this suits you */}
            {matchInsights && matchInsights.reasons.length > 0 && (
              <section className="bg-surface/70 backdrop-blur-md border border-white/40 shadow-[0px_4px_24px_rgba(18,53,91,0.05)] rounded-xl p-margin-mobile animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h2 className="font-headline-md text-primary mb-4">{t('jobDetails_whySuits')}</h2>
                <ul className="space-y-3">
                  {matchInsights.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary mt-1">check_circle</span>
                      <div>
                        <span className="font-body-md text-on-surface-variant">{reason}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                
                {/* Location Map embedded within 'Why this suits you' area per Stitch */}
                <div className="mt-6 pt-6 border-t border-outline-variant/30">
                  <h3 className="font-label-md font-semibold text-primary mb-3">{t('jobDetails_location')}</h3>
                  <JobLocationMap 
                    latitude={job.latitude}
                    longitude={job.longitude}
                    location={job.location}
                    jobTitle={job.title}
                  />
                </div>
              </section>
            )}

            {/* Skills & qualifications to build */}
            {gap.toLearn.length > 0 && (
              <section className="bg-surface/70 backdrop-blur-md border border-white/40 shadow-[0px_4px_24px_rgba(18,53,91,0.05)] rounded-xl p-margin-mobile animate-fade-in" style={{ animationDelay: '0.25s' }}>
                <h2 className="font-headline-md text-primary mb-1">{t('jobDetails_gapTitle')}</h2>
                <p className="font-body-md text-on-surface-variant mb-4">{gapHeadline}</p>

                {/* Readiness bar */}
                <div className="mb-5">
                  <div className="flex justify-between font-label-sm text-on-surface-variant mb-1">
                    <span>{t('jobDetails_readiness')}</span>
                    <span className="text-primary font-bold">{gap.readiness}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${gap.readiness}%` }}></div>
                  </div>
                </div>

                {gap.have.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-label-sm text-outline tracking-widest uppercase mb-2">{t('jobDetails_youHave')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {gap.have.map((skill) => (
                        <span key={skill} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary font-label-md border border-secondary/20">
                          <span className="material-symbols-outlined text-[16px]">check</span>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-label-sm text-outline tracking-widest uppercase mb-2">{t('jobDetails_toLearn')}</h3>
                  <ul className="flex flex-col gap-2">
                    {gap.toLearn.map((item) => (
                      <li key={item.label} className="flex items-start gap-3 bg-surface-container-low rounded-lg p-3 border border-outline-variant/30">
                        <span className="material-symbols-outlined text-secondary mt-0.5">
                          {item.type === 'qualification' ? 'school' : 'add_task'}
                        </span>
                        <div>
                          <p className="font-body-md text-on-surface">{item.label}</p>
                          <p className="font-label-sm text-on-surface-variant capitalize">{item.type}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {gap.trainingAvailable && (
                  <div className="mt-4 flex items-start gap-3 bg-[#F0FDFA] border border-secondary/20 rounded-lg p-3">
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
                    <div>
                      <p className="font-label-md font-bold text-secondary">{t('jobDetails_trainingAvailable')}</p>
                      <p className="font-body-md text-on-surface">{gap.trainingNote}</p>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* About & Requirements */}
            <section className="bg-surface/70 backdrop-blur-md border border-white/40 shadow-[0px_4px_24px_rgba(18,53,91,0.05)] rounded-xl p-margin-mobile animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h2 className="font-headline-md text-primary mb-4">{t('jobDetails_aboutWork')}</h2>
              <p className="font-body-md text-on-surface-variant mb-6 whitespace-pre-line">
                {job.description || "No description provided."}
              </p>
              
              {job.requirements && job.requirements.length > 0 && (
                <>
                  <h3 className="font-headline-md text-primary mb-4">{t('jobDetails_requirements')}</h3>
                  <ul className="list-disc pl-5 space-y-2 font-body-md text-on-surface-variant">
                    {job.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            {/* Skills */}
            {job.skillsRequired && job.skillsRequired.length > 0 && (
              <section className="bg-surface/70 backdrop-blur-md border border-white/40 shadow-[0px_4px_24px_rgba(18,53,91,0.05)] rounded-xl p-margin-mobile animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <h2 className="font-headline-md text-primary mb-4">{t('jobDetails_requiredSkills')}</h2>
                <div className="flex flex-wrap gap-3">
                  {job.skillsRequired.map((skill, idx) => {
                    const hasSkill = matchInsights?.matchedSkills.includes(skill.toLowerCase());
                    return (
                      <div 
                        key={idx} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border ${hasSkill ? 'bg-surface border-secondary shadow-sm' : 'border-outline-variant text-on-surface-variant'}`}
                      >
                        {hasSkill && <span className="material-symbols-outlined text-secondary text-sm font-bold">check</span>}
                        <span className={`font-label-md ${hasSkill ? 'text-primary' : ''}`}>{skill}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </div>

          {/* Right Column (Sticky Action Panel) */}
          <div className="lg:col-span-4 lg:sticky lg:top-20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-surface/70 backdrop-blur-md border border-white/40 rounded-xl p-margin-mobile flex flex-col gap-6 shadow-md border-t-4 border-t-primary">
              <div>
                <h2 className="font-headline-md text-primary">{job.title}</h2>
                <p className="font-body-md text-on-surface-variant">{job.company}</p>
              </div>
              
              <div className="space-y-3 bg-surface-container-low/50 p-4 rounded-lg">
                {job.salary && (
                  <div className="flex justify-between items-center border-b border-outline-variant/30 pb-2">
                    <span className="font-body-md text-on-surface-variant">{t('jobDetails_salary')}</span>
                    <span className="font-label-md font-semibold text-primary">{job.salary}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-on-surface-variant">{t('jobDetails_location')}</span>
                  <span className="font-label-md font-semibold text-primary">{job.location}</span>
                </div>
              </div>
              
              {matchInsights && matchInsights.level !== 'partial' && (
                <div className="bg-secondary-container/20 p-3 rounded-lg border border-secondary-container text-sm flex gap-2 items-start">
                  <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="font-body-md text-secondary">{matchInsights.message}</span>
                </div>
              )}
              
              <button 
                onClick={handleApply}
                className="group w-full bg-primary text-on-primary py-4 rounded-full font-label-md font-semibold flex justify-center items-center gap-2 hover:bg-primary/90 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                {t('jobDetails_apply')}
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              
              <p className="font-label-sm text-center text-on-surface-variant">
                {t('jobDetails_applySubtext')}
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}