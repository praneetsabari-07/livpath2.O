import { createContext, useState, useContext, useEffect } from 'react';
import { saveUserToSheet } from '../services/sheetDbService';

const AuthContext = createContext();

const PROFILE_STORAGE_KEY = 'livpath_user_profile';
const APPS_STORAGE_KEY = 'livpath_applications';
const PHONE_STORAGE_KEY = 'livpath_user_phone';

const DEFAULT_PROFILE = {
  fullName: 'Ramesh Kumar',
  phone: '9876543210',
  age: '24',
  gender: 'male',
  location: 'Salem, Tamil Nadu',
  district: 'Salem',
  state: 'Tamil Nadu',
  education: '10th_pass',
  skills: ['Tailoring', 'Stitching', 'Garment Finishing'],
  workType: 'Full-time',
  locationType: 'Near me',
  preferredSalary: '₹18,000 / month',
  hasExperience: true,
  experienceDescription: '2 years working in local garment unit stitching shirts and blouses.',
  certificateVerified: true,
  certificateType: 'Community & Vocational Certificate',
  verifiedAt: 'Aug 30, 2026',
};

const DEFAULT_PROFILE_DATA = {
  fullName: 'Ramesh Kumar',
  location: 'Salem, Tamil Nadu',
  personalDetails: {
    fullName: 'Ramesh Kumar',
    age: '24',
    gender: 'male',
    location: 'Salem, Tamil Nadu',
    education: '10th Pass',
    experience: '2 years',
    experienceDetails: 'Tailoring and garment stitching unit experience in Salem',
  },
  jobPreferences: {
    skills: ['Tailoring', 'Stitching', 'Garment Finishing'],
    workType: 'Full-time',
    locationType: 'Near me',
    specificLocation: 'Salem, Tamil Nadu',
    expectedSalary: '₹18,000 – ₹24,000 / month',
  },
};

const INITIAL_APPLICATIONS = [
  {
    applicationId: 'APP-101',
    jobId: 'job-1',
    jobTitle: 'Senior Tailor & Garment Stitcher',
    company: 'Salem Textiles & Exports Ltd.',
    location: 'Salem, Tamil Nadu',
    workType: 'Full-time',
    salary: '₹18,000 – ₹24,000 / month',
    appliedAt: '2 days ago',
    status: 'interview_scheduled',
    statusLabel: 'Interview Scheduled',
    interviewDate: 'Tomorrow at 10:30 AM (In-person at Salem Factory)',
    nextStep: 'Attend factory practical stitch test with your ID card.',
    timeline: [
      { stage: 'submitted', label: 'Application Submitted', desc: 'Profile and certificate received by HR team.', icon: 'Check', done: true, current: false, tone: 'positive' },
      { stage: 'under_review', label: 'Profile Verified', desc: '10th pass qualification & tailoring skills confirmed.', icon: 'FileText', done: true, current: false, tone: 'positive' },
      { stage: 'interview_scheduled', label: 'Interview & Machine Test', desc: 'Scheduled for Tomorrow, 10:30 AM.', icon: 'Calendar', done: true, current: true, tone: 'warning' },
      { stage: 'selected', label: 'Job Offer & Joining', desc: 'Final appointment letter and joining kit.', icon: 'Award', done: false, current: false, tone: 'neutral' },
    ]
  }
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => ({
    id: 'user-1',
    name: 'Ramesh Kumar',
    phone: '9876543210',
  }));

  const [phoneData, setPhoneData] = useState(() => ({
    countryCode: '+91',
    number: '9876543210',
    demoOtp: '123456',
    smsSent: true,
  }));

  const [userPhone, setUserPhoneState] = useState(() => {
    try {
      return localStorage.getItem(PHONE_STORAGE_KEY) || '9876543210';
    } catch {
      return '9876543210';
    }
  });

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_PROFILE;
  });

  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem('livpath_profile_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return DEFAULT_PROFILE_DATA;
  });

  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem(APPS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_APPLICATIONS;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const setUserPhone = (phone) => {
    setUserPhoneState(phone);
    setPhoneData((prev) => ({ ...(prev || {}), number: phone }));
    updateProfile({ phone });
    try {
      localStorage.setItem(PHONE_STORAGE_KEY, phone);
    } catch (e) {
      console.warn(e);
    }
  };

  const updateProfile = (updates) => {
    if (!updates) return;
    setProfile((prev) => {
      const next = { ...(prev || DEFAULT_PROFILE), ...updates };
      try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });

    // Also sync profileData
    setProfileData((prev) => {
      const current = prev || DEFAULT_PROFILE_DATA;
      const next = {
        ...current,
        fullName: updates.fullName || current.fullName,
        location: updates.location || current.location,
        personalDetails: {
          ...(current.personalDetails || {}),
          fullName: updates.fullName || current.personalDetails?.fullName,
          age: updates.age || current.personalDetails?.age,
          gender: updates.gender || current.personalDetails?.gender,
          location: updates.location || current.personalDetails?.location,
          education: updates.education || current.personalDetails?.education,
        },
        jobPreferences: {
          ...(current.jobPreferences || {}),
          skills: updates.skills
            ? (Array.isArray(updates.skills) ? updates.skills : String(updates.skills).split(',').map((s) => s.trim()).filter(Boolean))
            : current.jobPreferences?.skills,
          workType: updates.workType || current.jobPreferences?.workType,
          locationType: updates.locationType || current.jobPreferences?.locationType,
        }
      };
      try {
        localStorage.setItem('livpath_profile_data', JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });

    // Automatically persist to SheetDB Excel sheet
    try {
      const activePhone = updates.phone || userPhone || (typeof localStorage !== 'undefined' ? localStorage.getItem(PHONE_STORAGE_KEY) : null);
      if (activePhone && String(activePhone).replace(/\D/g, '').length >= 10) {
        const activeName = updates.fullName || profile?.fullName || 'LivPath User';
        const activeSkills = updates.skills || profile?.skills || [];
        const activeLoc = updates.location || profile?.location || 'Tamil Nadu';
        const activeWorkType = updates.workType || profile?.workType || 'Full-time';
        const activeLang = updates.lang || updates.language || 'en';

        saveUserToSheet({
          name: activeName,
          phone: activePhone,
          lang: activeLang,
          skills: activeSkills,
          location: activeLoc,
          workType: activeWorkType,
        }).catch((err) => console.warn('Background SheetDB sync error:', err));
      }
    } catch (err) {
      console.warn('SheetDB sync trigger error:', err);
    }
  };

  const savePersonalDetails = (details) => {
    updateProfile(details);
  };

  const saveJobPreferences = (preferences) => {
    updateProfile(preferences);
  };

  const verifyCertificate = (certType = 'Community & Skill Certificate') => {
    updateProfile({
      certificateVerified: true,
      certificateType: certType,
      verifiedAt: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
    });
  };

  const submitApplication = (appData) => {
    const newId = `APP-${Math.floor(100 + Math.random() * 900)}`;
    const newApp = {
      ...appData,
      applicationId: newId,
      appliedAt: 'Just now',
      status: 'submitted',
      statusLabel: 'Submitted',
      nextStep: 'Employer HR team will review your application and contact you via SMS / Phone call within 24 hours.',
      timeline: [
        { stage: 'submitted', label: 'Application Submitted', desc: 'Application delivered directly to employer.', icon: 'Check', done: true, current: true, tone: 'positive' },
        { stage: 'under_review', label: 'Under Review', desc: 'HR is checking profile & certificate.', icon: 'FileText', done: false, current: false, tone: 'neutral' },
        { stage: 'interview_scheduled', label: 'Interview Call', desc: 'Interview slot will be communicated.', icon: 'Calendar', done: false, current: false, tone: 'neutral' },
        { stage: 'selected', label: 'Selected / Offer Letter', desc: 'Joining confirmation.', icon: 'Award', done: false, current: false, tone: 'neutral' },
      ]
    };

    setApplications((prev) => {
      const updated = [newApp, ...(prev || [])];
      try {
        localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    return newApp;
  };

  const getApplicationById = (id) => {
    return applications?.find((a) => a.applicationId === id || a.jobId === id);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setUserPhoneState('');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        phoneData,
        setPhoneData,
        profileData,
        setProfileData,
        userPhone,
        setUserPhone,
        profile: profile || DEFAULT_PROFILE,
        setProfile,
        updateProfile,
        savePersonalDetails,
        saveJobPreferences,
        verifyCertificate,
        applications: applications || INITIAL_APPLICATIONS,
        setApplications,
        submitApplication,
        getApplicationById,
        isAuthenticated,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a safe fallback object instead of crashing if used outside provider
    return {
      profile: DEFAULT_PROFILE,
      profileData: DEFAULT_PROFILE_DATA,
      userPhone: '9876543210',
      user: { id: 'user-1', name: 'Ramesh Kumar' },
      phoneData: { countryCode: '+91', number: '9876543210', demoOtp: '123456' },
      applications: INITIAL_APPLICATIONS,
      updateProfile: () => {},
      setUserPhone: () => {},
      setPhoneData: () => {},
      setProfileData: () => {},
      setUser: () => {},
      savePersonalDetails: () => {},
      saveJobPreferences: () => {},
      verifyCertificate: () => {},
      submitApplication: () => ({}),
      getApplicationById: () => undefined,
      isAuthenticated: true,
      logout: () => {},
    };
  }
  return context;
};
