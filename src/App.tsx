import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VoiceAssistantProvider, useVoiceAssistant } from './context/VoiceAssistantContext';
import { Header } from './components/layout/Header';
import { FloatingVoiceBall } from './components/voice/FloatingVoiceBall';
import { GeminiSkillHubModal } from './components/gemini/GeminiSkillHubModal';
import { PhoneOtpStep } from './components/onboarding/PhoneOtpStep';
import { CertificateStep } from './components/onboarding/CertificateStep';
import { PersonalDetailsStep } from './components/onboarding/PersonalDetailsStep';
import { JobPreferencesStep } from './components/onboarding/JobPreferencesStep';
import { JobsList } from './components/jobs/JobsList';
import { ApplicationsTracker } from './components/applications/ApplicationsTracker';
import { UserProfileView } from './components/profile/UserProfileView';
import { Sparkles, Phone, ShieldCheck, User, Briefcase, ChevronRight, Volume2 } from 'lucide-react';
import { SpeakButton } from './components/common/SpeakButton';

type MainView = 'onboarding' | 'jobs' | 'applications' | 'profile';
type OnboardingStep = 'phone' | 'certificate' | 'personal' | 'preferences';

const MainApp: React.FC = () => {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const { readScreenAloud } = useVoiceAssistant();

  const [currentView, setCurrentView] = useState<MainView>('jobs');
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('phone');
  const [isSkillHubOpen, setIsSkillHubOpen] = useState(false);

  const handleStartOnboarding = (initialStep: OnboardingStep = 'phone') => {
    setOnboardingStep(initialStep);
    setCurrentView('onboarding');
  };

  const renderOnboardingStep = () => {
    switch (onboardingStep) {
      case 'phone':
        return <PhoneOtpStep onSuccess={() => setOnboardingStep('certificate')} />;
      case 'certificate':
        return (
          <CertificateStep
            onSuccess={() => setOnboardingStep('personal')}
            onSkip={() => setOnboardingStep('personal')}
          />
        );
      case 'personal':
        return <PersonalDetailsStep onSuccess={() => setOnboardingStep('preferences')} />;
      case 'preferences':
        return (
          <JobPreferencesStep
            onSuccess={() => {
              setCurrentView('jobs');
            }}
          />
        );
      default:
        return null;
    }
  };

  const renderMainView = () => {
    if (currentView === 'onboarding') {
      return (
        <div className="py-6 sm:py-10 px-3 sm:px-6">
          {/* Stepper Indicator */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 -z-0"></div>
              
              {/* Step 1: Phone */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow ${
                  onboardingStep === 'phone' ? 'bg-teal-700 text-white ring-4 ring-teal-100' : 'bg-teal-600 text-white'
                }`}>
                  1
                </div>
                <span className="text-[10px] font-bold text-slate-700 mt-1">OTP</span>
              </div>

              {/* Step 2: Certificate */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow ${
                  onboardingStep === 'certificate' 
                    ? 'bg-teal-700 text-white ring-4 ring-teal-100' 
                    : ['personal', 'preferences'].includes(onboardingStep)
                    ? 'bg-teal-600 text-white'
                    : 'bg-white border-2 border-slate-300 text-slate-500'
                }`}>
                  2
                </div>
                <span className="text-[10px] font-bold text-slate-700 mt-1">Verify</span>
              </div>

              {/* Step 3: Personal Details */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow ${
                  onboardingStep === 'personal'
                    ? 'bg-teal-700 text-white ring-4 ring-teal-100'
                    : onboardingStep === 'preferences'
                    ? 'bg-teal-600 text-white'
                    : 'bg-white border-2 border-slate-300 text-slate-500'
                }`}>
                  3
                </div>
                <span className="text-[10px] font-bold text-slate-700 mt-1">Voice Profile</span>
              </div>

              {/* Step 4: Job Preferences */}
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow ${
                  onboardingStep === 'preferences'
                    ? 'bg-teal-700 text-white ring-4 ring-teal-100'
                    : 'bg-white border-2 border-slate-300 text-slate-500'
                }`}>
                  4
                </div>
                <span className="text-[10px] font-bold text-slate-700 mt-1">Job Match</span>
              </div>
            </div>
          </div>

          {renderOnboardingStep()}
        </div>
      );
    }

    switch (currentView) {
      case 'jobs':
        return <JobsList onOpenSkillHub={() => setIsSkillHubOpen(true)} />;
      case 'applications':
        return <ApplicationsTracker onNavigateJobs={() => setCurrentView('jobs')} />;
      case 'profile':
        return (
          <UserProfileView
            onEditProfile={() => handleStartOnboarding('personal')}
            onOpenSkillHub={() => setIsSkillHubOpen(true)}
          />
        );
      default:
        return <JobsList onOpenSkillHub={() => setIsSkillHubOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-teal-200">
      {/* Global Header with Indian Language Switcher & Gemini AI Hub */}
      <Header
        currentTab={currentView}
        onNavigateTab={(tab) => setCurrentView(tab)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-24">
        {renderMainView()}
      </main>

      {/* Persistent Floating 3D Voice Assistant Ball at Bottom-Right */}
      <FloatingVoiceBall />

      {/* Gemini AI Skill & YouTube Video Hub Modal */}
      <GeminiSkillHubModal
        isOpen={isSkillHubOpen}
        onClose={() => setIsSkillHubOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <VoiceAssistantProvider>
          <MainApp />
        </VoiceAssistantProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
