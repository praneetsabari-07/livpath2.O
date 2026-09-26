import { useLocation } from 'react-router-dom';
import NavShell, { NavBrand, VoiceHelpButton } from './NavShell';
import LanguageSelector from '../language/LanguageSelector';

/**
 * Onboarding header:
 * - Brand logo
 * - Language selector: only visible on the homepage ('/')
 * - Voice Help: accessible for speech assistance
 * (My Profile and Video suggestions are removed from onboarding/home and belong exclusively to the dashboard)
 */
export default function Header() {
  const { pathname } = useLocation();
  const isHomePage = pathname === '/';

  return (
    <NavShell>
      <NavBrand to="/" />
      <div className="flex items-center gap-2 md:gap-3">
        {isHomePage && <LanguageSelector />}
        <VoiceHelpButton />
      </div>
    </NavShell>
  );
}
