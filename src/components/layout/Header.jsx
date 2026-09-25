import { Link } from 'react-router-dom';
import NavShell, { NavBrand, VoiceHelpButton, GeminiSkillButton } from './NavShell';
import LanguageSelector from '../language/LanguageSelector';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Onboarding header — brand + language + Skill Videos + Profile + Voice Help.
 * Shares its chrome with MainNavigation via NavShell.
 */
export default function Header() {
  const { language } = useLanguage();
  const profileLabel = language === 'ta' ? 'என் சுயவிவரம்' : language === 'hi' ? 'मेरी प्रोफ़ाइल' : 'My Profile';

  return (
    <NavShell>
      <NavBrand to="/" />
      <div className="flex items-center gap-2 md:gap-3">
        <Link
          to="/profile"
          className="flex items-center gap-1.5 rounded-full px-3 py-2 text-label-md font-label-md text-primary-container hover:bg-primary-container/10 transition-colors border border-primary-container/20"
          title="View My Profile"
        >
          <span className="material-symbols-outlined text-[18px]">person</span>
          <span className="hidden sm:inline font-medium">{profileLabel}</span>
        </Link>
        <GeminiSkillButton />
        <LanguageSelector />
        <VoiceHelpButton />
      </div>
    </NavShell>
  );
}
