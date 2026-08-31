import NavShell, { NavBrand, VoiceHelpButton, GeminiSkillButton } from './NavShell';
import LanguageSelector from '../language/LanguageSelector';

/**
 * Onboarding header — brand + language + Skill Videos + Voice Help.
 * Shares its chrome with MainNavigation via NavShell.
 */
export default function Header() {
  return (
    <NavShell>
      <NavBrand />
      <div className="flex items-center gap-2 md:gap-3">
        <GeminiSkillButton />
        <LanguageSelector />
        <VoiceHelpButton />
      </div>
    </NavShell>
  );
}
