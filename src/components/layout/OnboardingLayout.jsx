import { Outlet } from 'react-router-dom';
import Header from './Header';
import BackgroundDecor from './BackgroundDecor';
import BottomWaves from './BottomWaves';

/**
 * Layout wrapper for the guided onboarding experience
 * (Homepage, phone/OTP, user detection, certificate, personal details,
 * job preferences, profile setup complete).
 *
 * This is intentionally identical to the original PageLayout so completed
 * onboarding pages keep their existing Stitch header/layout untouched.
 */
export default function OnboardingLayout() {
  return (
    <div className="bg-[#F8FAFC] text-on-surface font-body-md overflow-x-hidden relative min-h-screen flex flex-col bg-soft-gradient">
      <BackgroundDecor />
      <Header />
      {/* pt-16 clears the fixed NavShell (h-16) so page content is never hidden behind it */}
      <main className="flex-grow relative z-10 flex flex-col pt-16">
        <Outlet />
      </main>
      <BottomWaves />
    </div>
  );
}
