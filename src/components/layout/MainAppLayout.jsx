import { Outlet } from 'react-router-dom';
import MainNavigation from './MainNavigation';
import BackgroundDecor from './BackgroundDecor';
import BottomWaves from './BottomWaves';
import ErrorBoundary from '../common/ErrorBoundary';

/**
 * Layout wrapper for the persistent main LivPath AI experience.
 *
 * Same shell as the onboarding layout, but the guided onboarding Header is
 * replaced with the persistent MainNavigation (Jobs / Discover, My
 * Applications, My Profile). Page content and page-level waves are preserved.
 */
export default function MainAppLayout() {
  return (
    <div className="bg-[#F8FAFC] text-on-surface font-body-md overflow-x-hidden relative min-h-screen flex flex-col bg-soft-gradient">
      <BackgroundDecor />
      <MainNavigation />
      {/* pt-16 clears the fixed NavShell (h-16) so page content is never hidden behind it */}
      <main className="flex-grow relative z-10 flex flex-col pt-16">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <BottomWaves />
    </div>
  );
}
