import { useNavigate } from 'react-router-dom';
import { useLanguageContext } from '../../context/LanguageContext';
import { translations } from '../../translations';

export default function ApplicationCard({ application }) {
  const navigate = useNavigate();
  const { language } = useLanguageContext();
  const t = (key) => translations[language]?.[key] || translations['en']?.[key] || key;

  const { jobId, jobTitle, company, location, workType, status, applicationId } = application;

  // Determine styling and display based on status
  let statusConfig = {
    bgClass: 'bg-surface-container-low',
    textClass: 'text-on-surface-variant',
    borderClass: 'border-outline-variant',
    dotClass: 'bg-outline',
    icon: 'check_circle',
    iconBgClass: 'bg-surface-container-high',
    iconTextClass: 'text-on-surface-variant',
    blurClass: 'bg-primary-fixed-dim',
    label: t('myApps_appSent')
  };

  switch (status) {
    case 'under_review':
      statusConfig = {
        bgClass: 'bg-primary-fixed',
        textClass: 'text-primary-container',
        borderClass: 'border-primary-fixed-dim',
        dotClass: 'bg-primary-container',
        icon: 'radio_button_checked',
        iconBgClass: 'bg-primary-fixed',
        iconTextClass: 'text-primary-container',
        blurClass: 'bg-primary-fixed',
        label: t('myApps_underReview'),
        hasPulse: true
      };
      break;
    case 'interview':
      statusConfig = {
        bgClass: 'bg-tertiary-fixed',
        textClass: 'text-on-tertiary-fixed',
        borderClass: 'border-tertiary-fixed-dim',
        dotClass: 'bg-on-tertiary-container shadow-[0_0_8px_rgba(176,123,74,0.8)]',
        icon: 'calendar_month',
        iconBgClass: 'bg-tertiary-fixed',
        iconTextClass: 'text-on-tertiary-fixed',
        blurClass: 'bg-tertiary-fixed-dim',
        label: t('myApps_interview')
      };
      break;
    case 'selected':
      statusConfig = {
        bgClass: 'bg-secondary-fixed',
        textClass: 'text-on-secondary-fixed',
        borderClass: 'border-secondary-fixed-dim',
        dotClass: 'bg-on-secondary-container',
        icon: 'check_circle',
        iconBgClass: 'bg-secondary-fixed',
        iconTextClass: 'text-on-secondary-fixed',
        blurClass: 'bg-secondary-fixed-dim',
        label: t('myApps_selected')
      };
      break;
    case 'submitted':
    default:
      break; // Uses default config
  }

  return (
    <div className="bg-surface/70 backdrop-blur-md border border-white/40 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-stack-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
      <div className={`absolute right-0 top-0 w-32 h-32 ${statusConfig.blurClass} rounded-full filter blur-3xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>
      
      <div className="flex items-center gap-stack-md relative z-10">
        <div className={`w-12 h-12 rounded-full ${statusConfig.iconBgClass} flex items-center justify-center flex-shrink-0 relative`}>
          <span className={`material-symbols-outlined ${statusConfig.iconTextClass} z-10`}>{statusConfig.icon}</span>
          {statusConfig.hasPulse && (
            <div className={`absolute inset-0 rounded-full ${statusConfig.iconBgClass} animate-[pulse_2s_infinite] opacity-50 z-0`}></div>
          )}
        </div>
        <div>
          <h3 className="font-headline-md md:font-headline-lg text-primary mb-1">{jobTitle}</h3>
          <p className="font-body-md text-on-surface-variant">
            {company} • {location} • {workType}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col md:items-end gap-2 relative z-10 w-full md:w-auto mt-4 md:mt-0">
        <div className={`px-3 py-1 rounded-full ${statusConfig.bgClass} ${statusConfig.textClass} font-label-sm border ${statusConfig.borderClass} flex items-center gap-2 w-fit`}>
          <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`}></span> {statusConfig.label}
        </div>
        <button 
          onClick={() => navigate(`/applications/${applicationId}`)}
          className="text-secondary font-label-md font-semibold hover:text-secondary-fixed-dim transition-colors flex items-center gap-1 group-hover:gap-2"
        >
          {t('myApps_viewStatus')} <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}