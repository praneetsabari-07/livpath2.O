import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguageContext } from '../../context/LanguageContext';
import { translations } from '../../translations';
import { applicationService } from '../../services/applicationService';

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

export default function ApplicationStatus() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const t = (key) => translations[language]?.[key] || translations['en']?.[key] || key;

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    applicationService.getApplicationById(applicationId).then((res) => {
      if (!active) return;
      setApplication(res.success ? res.application : null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [applicationId]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[60vh] z-10">
        <div className="w-16 h-16 rounded-full border-4 border-secondary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center min-h-[60vh] z-10 text-center px-margin-mobile">
        <span className="material-symbols-outlined text-error text-6xl mb-4">error_outline</span>
        <h2 className="font-headline-lg text-primary mb-2">{t('appStatus_notFound')}</h2>
        <button
          onClick={() => navigate('/applications')}
          className="mt-4 px-6 py-3 bg-primary text-on-primary rounded-full font-label-md"
        >
          {t('appStatus_back')}
        </button>
      </div>
    );
  }

  const { jobTitle, company, location, workType, jobId, appliedAt, timeline, nextStep } = application;

  return (
    <div className="flex-grow w-full flex flex-col relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto py-stack-md gap-stack-md">
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 10%, rgba(15,118,110,0.05) 0%, transparent 45%), radial-gradient(circle at 90% 30%, rgba(18,53,91,0.05) 0%, transparent 40%)',
        }}
      ></div>

      <div className="z-10 flex flex-col gap-stack-md pb-stack-lg">
        {/* Back */}
        <button
          onClick={() => navigate('/applications')}
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md w-max"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          {t('appStatus_back')}
        </button>

        {/* Header */}
        <section className="animate-fade-in">
          <div className="flex items-center gap-stack-sm mb-1">
            <span
              className="material-symbols-outlined text-secondary text-[32px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              description
            </span>
            <h1 className="font-display-lg-mobile md:font-display-lg text-primary">{jobTitle}</h1>
          </div>
          <p className="font-body-lg text-on-surface-variant">
            {company} • {location} • {workType}
          </p>
          <p className="font-label-sm text-outline mt-1">
            {t('appStatus_appliedOn')} {formatDate(appliedAt)} · {applicationId}
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter items-start">
          {/* Timeline */}
          <section className="lg:col-span-2 bg-surface/70 backdrop-blur-md border border-white/40 rounded-xl p-6 md:p-8 shadow-[0px_4px_20px_rgba(18,53,91,0.05)] animate-fade-in">
            <h2 className="font-headline-md text-primary mb-6">{t('appStatus_progress')}</h2>
            <ol className="relative">
              {timeline.map((step, i) => {
                const isLast = i === timeline.length - 1;
                const circle =
                  step.tone === 'positive'
                    ? 'bg-secondary text-on-secondary'
                    : step.tone === 'negative'
                      ? 'bg-error text-on-error'
                      : step.done
                        ? 'bg-secondary text-on-secondary'
                        : step.current
                          ? 'bg-primary-container text-on-primary ring-4 ring-primary-container/15'
                          : 'bg-surface border border-outline-variant text-outline';
                return (
                  <li key={step.stage} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${circle}`}>
                        <span className="material-symbols-outlined text-[20px]">
                          {step.done || step.tone === 'positive' ? 'check' : step.icon}
                        </span>
                      </span>
                      {!isLast && (
                        <span
                          className={`w-0.5 flex-1 mt-1 rounded-full ${
                            step.done ? 'bg-secondary' : 'bg-outline-variant/40'
                          }`}
                        ></span>
                      )}
                    </div>
                    <div className={`pt-1 ${!step.done && !step.current ? 'opacity-55' : ''}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-label-md font-bold text-primary">{step.label}</h3>
                        {step.date && (
                          <span className="font-label-sm text-outline">{formatDate(step.date)}</span>
                        )}
                        {step.current && (
                          <span className="font-label-sm text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">
                            Now
                          </span>
                        )}
                      </div>
                      <p className="font-body-md text-on-surface-variant mt-0.5">{step.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Side: next step + job summary */}
          <div className="flex flex-col gap-gutter animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <section className="bg-[#F0FDFA] border border-secondary/20 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2 text-secondary">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  tips_and_updates
                </span>
                <h3 className="font-label-md font-bold">{t('appStatus_nextStep')}</h3>
              </div>
              <p className="font-body-md text-on-surface">{nextStep}</p>
            </section>

            <section className="bg-surface/70 backdrop-blur-md border border-white/40 rounded-xl p-6 shadow-[0px_4px_20px_rgba(18,53,91,0.05)]">
              <h3 className="font-label-sm text-outline tracking-widest uppercase mb-3">
                {t('appStatus_jobSummary')}
              </h3>
              <p className="font-headline-md text-primary text-lg">{jobTitle}</p>
              <p className="font-body-md text-on-surface-variant mb-4">{company}</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate(`/jobs/${jobId}`)}
                  className="w-full py-3 bg-primary-container text-on-primary rounded-lg font-label-md hover:bg-primary-container/90 transition-colors flex items-center justify-center gap-2"
                >
                  {t('appStatus_viewJob')}
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                <button
                  onClick={() => navigate('/jobs')}
                  className="w-full py-3 bg-surface border border-outline text-on-surface rounded-lg font-label-md hover:bg-surface-variant transition-colors"
                >
                  {t('appStatus_findSimilar')}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
