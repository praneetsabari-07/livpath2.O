import { useState, useEffect, useMemo } from 'react';
import { useLanguageContext } from '../../context/LanguageContext';
import { translations } from '../../translations';
import { applicationService } from '../../services/applicationService';
import ApplicationCard from '../../components/applications/ApplicationCard';
import { useNavigate } from 'react-router-dom';

export default function MyApplications() {
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const t = (key) => translations[language]?.[key] || translations['en']?.[key] || key;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;
    const fetchApps = async () => {
      try {
        setLoading(true);
        const response = await applicationService.getMyApplications();
        if (isMounted) {
          if (response && response.success) {
            setApplications(response.applications);
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
    fetchApps();
    return () => { isMounted = false; };
  }, []);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      underReview: applications.filter(a => a.status === 'under_review').length,
      interview: applications.filter(a => a.status === 'interview').length,
      selected: applications.filter(a => a.status === 'selected').length
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    if (filter === 'All') return applications;
    if (filter === 'Applied') return applications.filter(a => a.status === 'submitted');
    if (filter === 'Under Review') return applications.filter(a => a.status === 'under_review');
    if (filter === 'Interview') return applications.filter(a => a.status === 'interview');
    if (filter === 'Selected') return applications.filter(a => a.status === 'selected');
    return applications;
  }, [applications, filter]);

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

  if (error) {
    return (
      <div className="flex-grow w-full flex flex-col items-center justify-center min-h-screen z-10 px-margin-mobile text-center">
        <span className="material-symbols-outlined text-error text-6xl mb-4">error_outline</span>
        <h2 className="font-headline-lg text-primary mb-2">{t('myApps_errorLoad')}</h2>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md">
          {t('myApps_retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex-grow w-full flex flex-col relative z-10 min-h-screen pb-stack-lg">
      {/* Atmospheric Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 rounded-full mix-blend-multiply opacity-50 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(157,238,229,0.3) 0%, rgba(157,238,229,0) 70%)' }}></div>
        <div className="absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-secondary-fixed/20 rounded-full mix-blend-multiply opacity-40 blur-3xl"></div>
        <div className="absolute bottom-[20%] left-[20%] w-[400px] h-[400px] rounded-full mix-blend-multiply opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, rgba(157,238,229,0.3) 0%, rgba(157,238,229,0) 70%)' }}></div>
        
        {/* Dotted Path Background */}
        <svg className="absolute inset-0 w-full h-full hidden md:block" xmlns="http://www.w3.org/2000/svg">
          <path className="animate-[dash_20s_linear_infinite]" d="M 0,100 C 300,200 400,-50 800,100 S 1200,300 1600,150" fill="none" stroke="rgba(12, 111, 103, 0.2)" strokeWidth="2" strokeDasharray="10 10"></path>
          <path className="animate-[dash_20s_linear_infinite]" d="M -200,400 C 200,500 500,200 900,400 S 1400,600 1800,350" fill="none" stroke="rgba(18, 53, 91, 0.15)" strokeWidth="2" strokeDasharray="10 10" style={{ animationDirection: 'reverse' }}></path>
        </svg>
      </div>

      <div className="flex-grow w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-sm flex flex-col relative z-10 pb-stack-lg">
        
        {/* Introduction */}
        <section className="mb-stack-lg flex flex-col md:flex-row justify-between items-start md:items-end gap-stack-md animate-fade-in">
          <div>
            <div className="flex items-center gap-stack-sm mb-2">
              <span className="material-symbols-outlined text-secondary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
              <h1 className="font-display-lg-mobile md:font-display-lg text-primary">{t('myApps_title')}</h1>
            </div>
            <p className="font-body-lg text-on-surface-variant">{t('myApps_subtitle')}</p>
          </div>
          <button className="bg-surface/70 backdrop-blur-md border border-white/40 flex items-center gap-base px-4 py-3 rounded-full hover:-translate-y-1 transition-transform duration-300 shadow-[0_8px_32px_rgba(18,53,91,0.05)]">
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-secondary-container">record_voice_over</span>
            </div>
            <span className="font-label-md text-primary font-semibold">{t('myApps_listenUpdates')}</span>
          </button>
        </section>

        {/* Overview & Filters */}
        <section className="mb-stack-lg flex flex-col xl:flex-row justify-between items-center gap-stack-md bg-surface/70 backdrop-blur-md border border-white/40 rounded-xl p-stack-sm md:p-6 shadow-[0_8px_32px_rgba(18,53,91,0.05)] animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-wrap gap-stack-sm w-full xl:w-auto justify-center xl:justify-start">
            <div className="flex flex-col items-center px-4 py-2 bg-surface-container-low rounded-lg min-w-[100px] border border-outline-variant/30">
              <span className="font-headline-md text-primary font-bold">{stats.total}</span>
              <span className="font-label-sm text-on-surface-variant uppercase tracking-wide">{t('myApps_total')}</span>
            </div>
            <div className="flex flex-col items-center px-4 py-2 bg-primary-fixed rounded-lg min-w-[100px] border border-primary-fixed-dim/30">
              <span className="font-headline-md text-primary-container font-bold">{stats.underReview}</span>
              <span className="font-label-sm text-on-primary-container uppercase tracking-wide">{t('myApps_underReview')}</span>
            </div>
            <div className="flex flex-col items-center px-4 py-2 bg-tertiary-fixed rounded-lg min-w-[100px] border border-tertiary-fixed-dim/30">
              <span className="font-headline-md text-on-tertiary-fixed font-bold">{stats.interview}</span>
              <span className="font-label-sm text-on-tertiary-fixed-variant uppercase tracking-wide">{t('myApps_interview')}</span>
            </div>
            <div className="flex flex-col items-center px-4 py-2 bg-secondary-fixed rounded-lg min-w-[100px] border border-secondary-fixed-dim/30">
              <span className="font-headline-md text-on-secondary-fixed font-bold">{stats.selected}</span>
              <span className="font-label-sm text-on-secondary-fixed-variant uppercase tracking-wide">{t('myApps_selected')}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-base w-full xl:w-auto justify-center xl:justify-end">
            {['All', 'Applied', 'Under Review', 'Interview', 'Selected'].map((btnFilter) => {
              // Map English filter name to translated text
              let translationKey;
              if (btnFilter === 'All') translationKey = 'myApps_all';
              if (btnFilter === 'Applied') translationKey = 'myApps_applied';
              if (btnFilter === 'Under Review') translationKey = 'myApps_underReview';
              if (btnFilter === 'Interview') translationKey = 'myApps_interview';
              if (btnFilter === 'Selected') translationKey = 'myApps_selected';

              return (
                <button 
                  key={btnFilter}
                  onClick={() => setFilter(btnFilter)}
                  className={`px-4 py-2 rounded-full font-label-md transition-all ${
                    filter === btnFilter 
                    ? 'bg-primary-container text-on-primary shadow-md' 
                    : 'bg-surface/70 backdrop-blur-md border border-white/40 text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  {t(translationKey)}
                </button>
              );
            })}
          </div>
        </section>

        {/* Application List */}
        {filteredApplications.length > 0 ? (
          <section className="flex flex-col gap-stack-md relative z-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {filteredApplications.map(app => (
              <ApplicationCard key={app.applicationId} application={app} />
            ))}
          </section>
        ) : (
          <section className="flex flex-col items-center justify-center py-stack-lg relative z-10 animate-fade-in">
             <div className="w-24 h-24 bg-surface-variant rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">inbox</span>
             </div>
             <h2 className="font-headline-md text-primary mb-2">{t('myApps_emptyTitle')}</h2>
             <p className="font-body-md text-on-surface-variant text-center max-w-md mb-8">{t('myApps_emptySubtitle')}</p>
             <button onClick={() => navigate('/jobs')} className="px-6 py-3 bg-primary text-on-primary rounded-full font-label-md">
                {t('myApps_findJobs')}
             </button>
          </section>
        )}
      </div>

    </div>
  );
}