import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Application, EducationLevel, WorkType } from '../types';

interface AuthContextType {
  userPhone: string;
  setUserPhone: (phone: string) => void;
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  savePersonalDetails: (details: Partial<UserProfile>) => void;
  saveJobPreferences: (preferences: Partial<UserProfile>) => void;
  verifyCertificate: (certType?: string) => void;
  applications: Application[];
  submitApplication: (app: Omit<Application, 'applicationId' | 'appliedAt' | 'timeline' | 'nextStep' | 'statusLabel'>) => Application;
  getApplicationById: (id: string) => Application | undefined;
  isAuthenticated: boolean;
  logout: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
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
  verifiedAt: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
};

const INITIAL_APPLICATIONS: Application[] = [
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROFILE_STORAGE_KEY = 'livpath_user_profile';
const APPS_STORAGE_KEY = 'livpath_applications';
const PHONE_STORAGE_KEY = 'livpath_user_phone';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userPhone, setUserPhoneState] = useState<string>(() => {
    try {
      return localStorage.getItem(PHONE_STORAGE_KEY) || '9876543210';
    } catch {
      return '9876543210';
    }
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_PROFILE;
  });

  const [applications, setApplications] = useState<Application[]>(() => {
    try {
      const saved = localStorage.getItem(APPS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_APPLICATIONS;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const setUserPhone = (phone: string) => {
    setUserPhoneState(phone);
    setProfile(prev => ({ ...prev, phone }));
    try {
      localStorage.setItem(PHONE_STORAGE_KEY, phone);
    } catch (e) {
      console.warn(e);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  };

  const savePersonalDetails = (details: Partial<UserProfile>) => {
    updateProfile(details);
  };

  const saveJobPreferences = (preferences: Partial<UserProfile>) => {
    updateProfile(preferences);
  };

  const verifyCertificate = (certType = 'Community & Skill Certificate') => {
    updateProfile({
      certificateVerified: true,
      certificateType: certType,
      verifiedAt: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
    });
  };

  const submitApplication = (appData: Omit<Application, 'applicationId' | 'appliedAt' | 'timeline' | 'nextStep' | 'statusLabel'>): Application => {
    const newId = `APP-${Math.floor(100 + Math.random() * 900)}`;
    const newApp: Application = {
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

    setApplications(prev => {
      const updated = [newApp, ...prev];
      try {
        localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });

    return newApp;
  };

  const getApplicationById = (id: string): Application | undefined => {
    return applications.find(a => a.applicationId === id || a.jobId === id);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserPhoneState('');
  };

  return (
    <AuthContext.Provider
      value={{
        userPhone,
        setUserPhone,
        profile,
        updateProfile,
        savePersonalDetails,
        saveJobPreferences,
        verifyCertificate,
        applications,
        submitApplication,
        getApplicationById,
        isAuthenticated,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return safe fallback instead of throwing to prevent blank screen crashes
    return {
      userPhone: '9876543210',
      setUserPhone: () => {},
      profile: DEFAULT_PROFILE,
      updateProfile: () => {},
      savePersonalDetails: () => {},
      saveJobPreferences: () => {},
      verifyCertificate: () => {},
      applications: INITIAL_APPLICATIONS,
      submitApplication: () => INITIAL_APPLICATIONS[0],
      getApplicationById: () => undefined,
      isAuthenticated: true,
      logout: () => {},
    };
  }
  return context;
};
