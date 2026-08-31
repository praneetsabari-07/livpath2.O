import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguageContext } from '../../context/LanguageContext';
import { translations } from '../../translations';
import { jobService } from '../../services/jobService';
import { getQualificationGap } from '../../utils/jobMatchUtils';

const WORK_TYPES = ['All', 'Full-time', 'Part-time', 'Temporary'];

export default function JobListings() {
  const navigate = useNavigate();
  const { profileData } = useAuth();
  const { language } = useLanguageContext();
  const t = (key) => translations[language]?.[key] || translations['en']?.[key] || key;

  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') === 'discover' ? 'discover' : 'matches';

  const [query, setQuery] = useState('');
  const [workType, setWorkType] = useState('All');
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  const setTab = (next) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'discover') params.set('tab', 'discover');
    else params.delete('tab');
    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    jobService.getJobs({ tab, query, workType }, profileData).then((res) => {
      if (!active) return;
      setJobs(res.success ? res.jobs : []);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [tab, query, workType, profileData]);

  const tabHint = tab === 'discover' ? t('jobsList_discoverHint') : t('jobsList_matchesHint');

  return (
    <div className="flex-grow w-full flex flex-col relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-md gap-stack-md">
      {/* Atmospheric background (consistent with Job Matching) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-80"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(15, 118, 110, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.05) 0%, transparent 40%)',
        }}
      ></div>

      <div className="z-10 flex flex-col gap-stack-md flex-grow pb-stack-lg">
        {/* Header */}
        <section className="animate-fade-in">
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary mb-1">
            {t('jobsList_title')}
          </h1>
          <p className="font-body-lg text-on-surface-variant flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">location_on</span>
            {t('jobsList_subtitle')}
          </p>
        </section>

        {/* Tabs */}
        <div className="flex flex-col gap-2 animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <div className="inline-flex self-start rounded-full bg-surface-container p-1 border border-outline-variant/40">
            {[
              ['matches', t('jobsList_tabMatches'), 'target'],
              ['discover', t('jobsList_tabDiscover'), 'explore'],
            ].map(([value, label, icon]) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 font-label-md text-label-md transition-colors ${
                  tab === value
                    ? 'bg-primary-container text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                {label}
              </button>
            ))}
          </div>
          <p className="font-label-sm text-on-surface-variant">{tabHint}</p>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col md:flex-row gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('jobsList_search')}
              className="w-full h-12 pl-10 pr-4 rounded-full border border-outline-variant bg-surface font-body-md text-on-surface focus:outline-none focus:border-secondary transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {WORK_TYPES.map((wt) => (
              <button
                key={wt}
                onClick={() => setWorkType(wt)}
                className={`px-4 py-2 rounded-full font-label-md text-label-md border transition-colors ${
                  workType === wt
                    ? 'border-secondary bg-[#F0FDFA] text-secondary'
                    : 'border-outline-variant text-on-surface-variant hover:border-secondary bg-surface'
                }`}
              >
                {wt}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-surface rounded-xl p-6 shadow-[0px_4px_20px_rgba(18,53,91,0.05)] animate-pulse h-56"
              >
                <div className="w-12 h-12 rounded-lg bg-surface-container mb-4"></div>
                <div className="h-5 bg-surface-container rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-surface-container rounded w-1/2 mb-6"></div>
                <div className="h-10 bg-surface-container rounded"></div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center text-center py-stack-lg">
            <div className="w-20 h-20 rounded-full bg-surface-variant flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">work_off</span>
            </div>
            <p className="font-body-lg text-on-surface-variant max-w-sm">{t('jobsList_empty')}</p>
          </div>
        ) : (
          <>
            <p className="font-label-md text-on-surface-variant">
              {jobs.length} {t('jobsList_count')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
              {jobs.map((job, idx) => (
                <JobListCard
                  key={job.id}
                  job={job}
                  tab={tab}
                  profileData={profileData}
                  t={t}
                  onView={() => navigate(`/jobs/${job.id}`, { state: { from: 'listings' } })}
                  delay={idx * 0.05}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function JobListCard({ job, tab, profileData, t, onView, delay }) {
  const gap = useMemo(() => getQualificationGap(job, profileData), [job, profileData]);

  return (
    <div
      className="bg-surface rounded-xl p-6 shadow-[0px_4px_20px_rgba(18,53,91,0.05)] hover:shadow-[0px_8px_30px_rgba(18,53,91,0.08)] transition-all duration-300 flex flex-col gap-3 animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center text-primary">
          <span className="material-symbols-outlined text-2xl">{job.icon || 'work'}</span>
        </div>
        {job.trainingAvailable && (
          <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full font-label-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">school</span>
            {t('jobsList_trainingBadge')}
          </span>
        )}
      </div>

      <div>
        <h3 className="font-headline-md text-primary text-xl">{job.title}</h3>
        <p className="font-body-md text-on-surface-variant">{job.company}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-on-surface-variant font-label-sm flex items-center gap-1 bg-surface-container px-2 py-1 rounded">
          <span className="material-symbols-outlined text-[16px]">location_on</span> {job.location}
        </span>
        <span className="text-on-surface-variant font-label-sm flex items-center gap-1 bg-surface-container px-2 py-1 rounded">
          <span className="material-symbols-outlined text-[16px]">schedule</span> {job.workType}
        </span>
      </div>

      {job.salary && (
        <p className="font-label-md text-primary flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-secondary">payments</span>
          {job.salary}
        </p>
      )}

      {tab === 'discover' && gap.toLearn.length > 0 && (
        <p className="font-label-sm text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px] text-secondary">school</span>
          {gap.toLearn.length} {t('jobsList_toLearn')}
        </p>
      )}

      <button
        onClick={onView}
        className="mt-auto w-full py-3 bg-primary-container text-on-primary rounded-lg font-label-md hover:bg-primary-container/90 transition-colors flex items-center justify-center gap-2"
      >
        {t('jobsList_viewJob')} <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
      </button>
    </div>
  );
}
