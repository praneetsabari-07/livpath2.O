import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguageContext } from '../../context/LanguageContext';
import { checkUser } from '../../services/authService';

export default function UserDetection() {
  const navigate = useNavigate();
  const { phoneData, updateProfile, setProfileData, setUser } = useAuth();
  const { language, setLanguage } = useLanguageContext();
  const [statusText, setStatusText] = useState('Checking Excel sheet account status...');
  const [foundUser, setFoundUser] = useState(null);

  useEffect(() => {
    // Guard: cannot detect a user without a verified phone number.
    if (!phoneData?.number) {
      navigate('/auth/phone', { replace: true });
      return;
    }

    let cancelled = false;

    const detect = async () => {
      let isExistingUser = false;
      let userData = null;

      try {
        const result = await checkUser(phoneData.number);
        isExistingUser = !!result?.isExistingUser;
        userData = result?.user;
      } catch (err) {
        console.error('User detection failed:', err);
      }

      if (cancelled) return;

      if (isExistingUser && userData) {
        setFoundUser(userData);
        setStatusText(`Welcome back, ${userData.fullName}! Redirecting to dashboard...`);

        const rawSkills = userData.skills || [];
        const normalizedSkills = Array.isArray(rawSkills)
          ? rawSkills
          : typeof rawSkills === 'string'
          ? rawSkills.split(',').map((s) => s.trim()).filter(Boolean)
          : [];

        // Populate AuthContext profile from SheetDB Excel sheet
        if (updateProfile) {
          updateProfile({
            fullName: userData.fullName,
            phone: userData.phone,
            skills: normalizedSkills,
            location: userData.location || '',
            workType: userData.workType || 'Full-time',
          });
        }

        if (setProfileData) {
          setProfileData(prev => ({
            ...(prev || {}),
            fullName: userData.fullName,
            location: userData.location,
            personalDetails: {
              ...(prev?.personalDetails || {}),
              fullName: userData.fullName,
              location: userData.location,
            },
            jobPreferences: {
              ...(prev?.jobPreferences || {}),
              skills: normalizedSkills,
              workType: userData.workType,
              locationType: 'Near me',
              specificLocation: userData.location,
            },
          }));
        }

        if (setUser) {
          setUser({
            id: `user-${userData.phone}`,
            name: userData.fullName,
            phone: userData.phone,
          });
        }

        if (userData.language && setLanguage) {
          setLanguage(userData.language);
        }

        // Existing user -> straight into dashboard (/job-matching), skipping middle steps!
        setTimeout(() => {
          if (!cancelled) {
            navigate('/job-matching', { replace: true });
          }
        }, 1200);
      } else {
        // New user -> proceed through middle steps
        setStatusText('New user detected. Starting your guided profile setup...');
        setTimeout(() => {
          if (!cancelled) {
            navigate('/certificate-verification', { replace: true });
          }
        }, 1200);
      }
    };

    const timer = setTimeout(detect, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [navigate, phoneData]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F6F1] font-body-md text-primary gap-4 px-4 text-center">
      <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
        {statusText}
      </h2>
      <p className="text-xs sm:text-sm text-slate-500">
        Referencing live database from SheetDB Excel sheet.
      </p>
    </div>
  );
}
