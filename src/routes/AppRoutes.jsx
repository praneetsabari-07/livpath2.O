import { Routes, Route } from 'react-router-dom';
import OnboardingLayout from '../components/layout/OnboardingLayout';
import MainAppLayout from '../components/layout/MainAppLayout';

import Home from '../pages/Home/Home';
import PhoneEntry from '../pages/Auth/PhoneEntry';
import OTPVerification from '../pages/Auth/OTPVerification';
import UserDetection from '../pages/Auth/UserDetection';
import CertificateVerification from '../pages/Certificate/CertificateVerification';
import PersonalDetails from '../pages/Profile/PersonalDetails';
import JobPreferences from '../pages/Profile/JobPreferences';
import ProfileSetupComplete from '../pages/Profile/ProfileSetupComplete';
import ProfileManagement from '../pages/Profile/ProfileManagement';
import JobMatching from '../pages/Jobs/JobMatching';
import JobListings from '../pages/Jobs/JobListings';
import JobDetails from '../pages/Jobs/JobDetails';
import ReviewApplication from '../pages/Applications/ReviewApplication';
import ApplicationSuccess from '../pages/Applications/ApplicationSuccess';
import MyApplications from '../pages/Applications/MyApplications';
import ApplicationStatus from '../pages/Applications/ApplicationStatus';

export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------------------------------------------------------------
          ONBOARDING EXPERIENCE
          Guided, mostly linear flow. Keeps the existing onboarding
          header/layout. No main navigation bar here.
      --------------------------------------------------------------- */}
      <Route element={<OnboardingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/auth/phone" element={<PhoneEntry />} />
        <Route path="/auth/otp" element={<OTPVerification />} />
        <Route path="/auth/user-detection" element={<UserDetection />} />
        <Route path="/certificate-verification" element={<CertificateVerification />} />
        <Route path="/personal-details" element={<PersonalDetails />} />
        <Route path="/job-preferences" element={<JobPreferences />} />
        <Route path="/profile-setup-complete" element={<ProfileSetupComplete />} />
      </Route>

      {/* ---------------------------------------------------------------
          MAIN LIVPATH AI EXPERIENCE
          Persistent navigation: Jobs / Discover, My Applications, My Profile.
          Entry point from onboarding is /job-matching.
      --------------------------------------------------------------- */}
      <Route element={<MainAppLayout />}>
        {/* Jobs / Discover */}
        <Route path="/job-matching" element={<JobMatching />} />
        <Route path="/jobs" element={<JobListings />} />
        <Route path="/jobs/:jobId" element={<JobDetails />} />

        {/* Application flow (conceptually part of My Applications) */}
        <Route path="/application/review/:jobId" element={<ReviewApplication />} />
        <Route path="/application/success/:applicationId" element={<ApplicationSuccess />} />
        <Route path="/applications" element={<MyApplications />} />
        <Route path="/applications/:applicationId" element={<ApplicationStatus />} />

        {/* Profile */}
        <Route path="/profile" element={<ProfileManagement />} />
      </Route>
    </Routes>
  );
}
