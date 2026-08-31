import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { checkUser } from '../../services/authService';

export default function UserDetection() {
  const navigate = useNavigate();
  const { phoneData } = useAuth();

  useEffect(() => {
    // Guard: cannot detect a user without a verified phone number.
    if (!phoneData) {
      navigate('/auth/phone', { replace: true });
      return;
    }

    let cancelled = false;

    const detect = async () => {
      let isExistingUser = false;
      try {
        const result = await checkUser(phoneData.number);
        isExistingUser = !!result?.isExistingUser;
      } catch (err) {
        console.error('User detection failed:', err);
      }

      if (cancelled) return;

      if (isExistingUser) {
        // Existing user -> straight into the main experience.
        navigate('/job-matching', { replace: true });
      } else {
        // New user -> continue the guided onboarding flow.
        navigate('/certificate-verification', { replace: true });
      }
    };

    // Small delay so the "checking" state is visible.
    const timer = setTimeout(detect, 1500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [navigate, phoneData]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-f4f6f1 font-body-md text-primary gap-4">
      <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      <h2 className="text-2xl font-bold animate-pulse">Checking account status...</h2>
      <p className="text-on-surface-variant">Please wait a moment.</p>
    </div>
  );
}
