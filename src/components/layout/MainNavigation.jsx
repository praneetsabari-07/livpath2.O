import { Link, useLocation } from 'react-router-dom';
import NavShell, { NavBrand, VoiceHelpButton, GeminiSkillButton } from './NavShell';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Persistent navigation for the main LivPath AI experience
 * (Jobs / Discover, My Applications, My Profile).
 */
export default function MainNavigation() {
  const { pathname } = useLocation();
  const { language } = useLanguage();

  const isJobsActive =
    pathname.startsWith('/job-matching') || pathname.startsWith('/jobs');
  const isApplicationsActive =
    pathname.startsWith('/applications') || pathname.startsWith('/application/');
  const isProfileActive = pathname.startsWith('/profile');

  const navItem = (to, label, icon, active) => (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-full px-3 py-2 text-label-md font-label-md transition-colors ${
        active
          ? 'bg-primary-container/10 text-primary-container font-bold'
          : 'text-on-surface-variant hover:bg-primary-container/5 hover:text-primary-container'
      }`}
    >
      <span
        className="material-symbols-outlined text-lg"
        style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {icon}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );

  return (
    <NavShell>
      <NavBrand to="/job-matching" />

      <div className="flex items-center gap-1">
        {navItem(
          '/job-matching',
          language === 'ta' ? 'வேலைகள்' : language === 'hi' ? 'नौकरियां' : 'Jobs',
          'work',
          isJobsActive
        )}
        {navItem(
          '/applications',
          language === 'ta' ? 'விண்ணப்பங்கள்' : language === 'hi' ? 'आवेदन' : 'Applications',
          'description',
          isApplicationsActive
        )}
        {navItem(
          '/profile',
          language === 'ta' ? 'சுயவிவரம்' : language === 'hi' ? 'प्रोफ़ाइल' : 'Profile',
          'person',
          isProfileActive
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <GeminiSkillButton />
        <VoiceHelpButton />
      </div>
    </NavShell>
  );
}
