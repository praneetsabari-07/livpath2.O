import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * My Profile hub for the main LivPath AI experience.
 *
 * Design ported 1:1 from the Stitch "Profile Management" screen. The top
 * navigation bar and outer page shell are provided by MainAppLayout, so this
 * component renders the page content, its atmospheric background and its
 * signature bottom waves (matching the other main-experience pages).
 *
 * Each "Update by Voice" action opens the voice confirmation modal; confirming
 * routes into the existing voice-first editing page in "edit mode" so the user
 * is returned here on save instead of re-running onboarding.
 */

const SECTION_ROUTES = {
  'Personal Details': '/personal-details',
  Skills: '/job-preferences',
  'Job Preferences': '/job-preferences',
};

export default function ProfileManagement() {
  const navigate = useNavigate();
  const { profileData, phoneData } = useAuth();

  const [voiceSection, setVoiceSection] = useState(null); // null | section name
  const [modalStep, setModalStep] = useState('listening'); // 'listening' | 'confirmation'
  const [modalShown, setModalShown] = useState(false); // controls enter/exit transition

  const prefs = profileData?.jobPreferences || {};

  // --- Display values (fall back to sample content so the demo always reads as complete) ---
  const fullName = profileData?.fullName || 'Alex Rivera';
  const locationLabel = profileData?.location || prefs.specificLocation || 'Seattle, WA';
  const mobile = phoneData
    ? `${phoneData.countryCode || '+91'} ${phoneData.number}`
    : '+1 (555) 123-4567';
  const skills =
    prefs.skills && prefs.skills.length > 0
      ? prefs.skills
      : ['Tailoring', 'Embroidery', 'Pattern Making', 'Customer Service'];
  const preferredWork =
    prefs.skills && prefs.skills.length > 0
      ? 'Matched to your skills'
      : 'Textile Manufacturing, Retail';
  const locationPreference =
    prefs.locationType === 'Specific'
      ? prefs.specificLocation || 'Specific area'
      : prefs.locationType || 'Within 15 miles of Seattle';
  const workType = prefs.workType && prefs.workType !== 'Any' ? prefs.workType : 'Full-time, Day Shift';

  const editRoute = (section) =>
    navigate(SECTION_ROUTES[section] || '/personal-details', { state: { mode: 'edit' } });

  // --- Voice modal controls ---
  const openVoiceModal = (section) => {
    setVoiceSection(section);
    setModalStep('listening');
    setModalShown(false);
    requestAnimationFrame(() => setModalShown(true));
  };

  const closeVoiceModal = () => {
    setModalShown(false);
    setTimeout(() => setVoiceSection(null), 300);
  };

  const confirmVoiceUpdate = () => {
    const section = voiceSection;
    closeVoiceModal();
    if (section) editRoute(section);
  };

  return (
    <>
      {/* Atmospheric Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-secondary-container/20 blur-[80px] animate-pulse-slow"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-inverse-primary/20 blur-[100px] animate-float"></div>
        <div
          className="absolute bottom-[10%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-tertiary-fixed-dim/10 blur-[60px] animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        ></div>
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" style={{ opacity: 0.15 }}>
          <path
            className="dotted-path"
            d="M-100 200 C 300 100, 600 400, 1000 200 S 1400 300, 1600 100"
            fill="none"
            stroke="#12355b"
            strokeWidth="2"
          ></path>
          <path
            className="dotted-path"
            d="M-100 500 C 400 600, 500 200, 900 400 S 1300 600, 1600 400"
            fill="none"
            stroke="#006a63"
            strokeWidth="2"
            style={{ animationDirection: 'reverse' }}
          ></path>
        </svg>
      </div>

      {/* Main Content */}
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-md relative z-10 flex flex-col md:flex-row gap-gutter w-full">
        {/* Left Column (Main Info) */}
        <div className="flex-1 flex flex-col gap-stack-md">
          {/* Header */}
          <div className="mb-stack-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                person
              </span>
            </div>
            <div>
              <h1 className="font-headline-lg text-headline-lg text-primary-container tracking-tight">My Profile</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                View and update your details anytime.
              </p>
            </div>
          </div>

          {/* Profile Summary Card */}
          <div className="glass-panel rounded-3xl p-8 ambient-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/30 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <img
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  alt="Profile"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4KahFx1RAcjFPALZzil4s0tLqs9vfFnLyswq0YiheTJ4ZEzVUA8ZM5MpO-OL4phje9NYhvG0AEP50GoSLG4rx2WyGtxDBlZDbK50Tyt4fOqTLkhs7mpGGPjx5Z97FRp9sm8cfm5f5ixOjd2bh6gqUWlWQBridzihZkNF5G3GCsZ5jMIDrC1C1ObW0TdLwd_Ikyg49AQ3HqweqS81SCmjLNs-oLbCv_BeTgaCLAnjX9B4NdPrh2YsUfQ"
                />
                <div
                  className="absolute bottom-0 right-0 w-6 h-6 bg-secondary text-on-secondary rounded-full flex items-center justify-center border-2 border-white"
                  title="Profile Complete"
                >
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="font-headline-md text-headline-md text-primary">{fullName}</h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {locationLabel}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-sm text-label-sm">
                    Profile Complete
                  </span>
                </div>
              </div>
              <button
                onClick={() => editRoute('Personal Details')}
                className="mt-4 sm:mt-0 px-6 py-3 rounded-full bg-primary-container text-on-primary font-label-md text-label-md hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit My Details
              </button>
            </div>
          </div>

          {/* Detail Sections Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-stack-md">
            {/* Personal Details */}
            <div className="glass-panel rounded-2xl p-6 ambient-shadow flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
                  Personal Details
                </h3>
                <span className="material-symbols-outlined text-outline-variant">badge</span>
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <p className="font-label-sm text-label-sm text-outline">Full Name</p>
                  <p className="font-body-md text-body-md text-on-surface font-medium">{fullName}</p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-outline">Mobile</p>
                  <p className="font-body-md text-body-md text-on-surface font-medium">{mobile}</p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-outline">Language</p>
                  <p className="font-body-md text-body-md text-on-surface font-medium">English (Primary)</p>
                </div>
              </div>
              <button
                className="mt-6 w-full py-3 rounded-xl bg-secondary-container/50 text-on-secondary-container font-label-md text-label-md hover:bg-secondary-container transition-colors flex items-center justify-center gap-2 group"
                onClick={() => openVoiceModal('Personal Details')}
              >
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">mic</span>
                Update by Voice <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            {/* My Skills */}
            <div className="glass-panel rounded-2xl p-6 ambient-shadow flex flex-col h-full relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full border-2 border-dashed border-tertiary-fixed-dim/50 flex items-center justify-center opacity-50">
                <div className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">My Skills</h3>
                <span className="material-symbols-outlined text-outline-variant">psychology</span>
              </div>
              <div className="flex flex-wrap gap-2 flex-1 content-start">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-lg bg-white border border-glass-stroke font-label-md text-label-md text-on-surface shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <button
                className="mt-6 w-full py-3 rounded-xl bg-secondary-container/50 text-on-secondary-container font-label-md text-label-md hover:bg-secondary-container transition-colors flex items-center justify-center gap-2 group"
                onClick={() => openVoiceModal('Skills')}
              >
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">mic</span>
                Update Skills by Voice <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            {/* Job Preferences */}
            <div className="glass-panel rounded-2xl p-6 ambient-shadow flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
                  Job Preferences
                </h3>
                <span className="material-symbols-outlined text-outline-variant">tune</span>
              </div>
              <div className="space-y-4 flex-1">
                <div>
                  <p className="font-label-sm text-label-sm text-outline">Preferred Work</p>
                  <p className="font-body-md text-body-md text-on-surface font-medium">{preferredWork}</p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-outline">Location Preference</p>
                  <p className="font-body-md text-body-md text-on-surface font-medium">{locationPreference}</p>
                </div>
                <div>
                  <p className="font-label-sm text-label-sm text-outline">Work Type</p>
                  <p className="font-body-md text-body-md text-on-surface font-medium">{workType}</p>
                </div>
              </div>
              <button
                className="mt-6 w-full py-3 rounded-xl bg-secondary-container/50 text-on-secondary-container font-label-md text-label-md hover:bg-secondary-container transition-colors flex items-center justify-center gap-2 group"
                onClick={() => openVoiceModal('Job Preferences')}
              >
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">mic</span>
                Update Preferences by Voice <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>

            {/* Community Certificate */}
            <div className="glass-panel rounded-2xl p-6 ambient-shadow flex flex-col h-full bg-gradient-to-br from-white/70 to-primary-fixed/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-label-md text-label-md text-primary font-bold uppercase tracking-wider">
                  Certifications
                </h3>
                <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center text-center p-4 border-2 border-dashed border-primary-fixed-dim/50 rounded-xl bg-white/50">
                <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center mb-3">
                  <span className="material-symbols-outlined text-[32px] text-primary-container">workspace_premium</span>
                </div>
                <h4 className="font-label-md text-label-md text-on-surface font-bold">Community Foundation Verified</h4>
                <p className="font-label-sm text-label-sm text-outline mt-1">Issued: Jan 2024</p>
              </div>
              <button
                onClick={() => navigate('/certificate-verification', { state: { mode: 'edit' } })}
                className="mt-6 w-full py-3 rounded-xl bg-white text-primary-container border border-primary-container/20 font-label-md text-label-md hover:bg-primary-container/5 transition-colors flex items-center justify-center gap-2"
              >
                View Certificate Details
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar Checklist) */}
        <aside className="w-full md:w-80 flex-shrink-0 flex-col gap-stack-md hidden lg:flex">
          <div className="glass-panel rounded-3xl p-6 ambient-shadow sticky top-20">
            <h3 className="font-headline-sm text-headline-sm text-primary mb-2">Profile Status</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6 text-sm">
              A complete profile helps mentors and employers find you faster.
            </p>
            <div className="space-y-4">
              <div className="mb-6">
                <div className="flex justify-between font-label-sm text-label-sm mb-2">
                  <span className="text-primary-container font-bold">100% Complete</span>
                  <span className="text-outline">4/4 Steps</span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full w-full"></div>
                </div>
              </div>

              {[
                ['Personal Details', 'Up to date'],
                ['My Skills', `${skills.length} skills added`],
                ['Job Preferences', 'Set for local area'],
                ['Certificate Verified', 'Identity confirmed'],
              ].map(([title, sub]) => (
                <div
                  key={title}
                  className="flex items-start gap-3 p-3 rounded-xl bg-secondary/5 border border-secondary/10"
                >
                  <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">{title}</p>
                    <p className="font-label-sm text-label-sm text-outline">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Voice Interaction Modal */}
      {voiceSection && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-white/40 transition-opacity duration-300 ${
            modalShown ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <div
            className={`glass-panel w-full max-w-md rounded-3xl p-8 ambient-shadow flex flex-col items-center relative overflow-hidden transition-all duration-300 ${
              modalShown ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
          >
            <button
              className="absolute top-4 right-4 text-outline-variant hover:text-on-surface p-2 rounded-full hover:bg-surface-container transition-colors"
              onClick={closeVoiceModal}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="bg-surface-container-high px-4 py-1.5 rounded-full text-label-sm font-label-sm text-on-surface-variant mb-8">
              Updating {voiceSection}
            </div>

            {modalStep === 'listening' ? (
              <div className="flex flex-col items-center w-full">
                <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                  <div className="absolute inset-0 bg-secondary rounded-full opacity-20 animate-ripple"></div>
                  <div className="absolute inset-0 bg-secondary rounded-full opacity-20 animate-ripple" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute inset-0 bg-secondary rounded-full opacity-20 animate-ripple" style={{ animationDelay: '1s' }}></div>
                  <div
                    className="relative z-10 w-20 h-20 bg-primary-container rounded-full flex items-center justify-center shadow-lg mic-button cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setModalStep('confirmation')}
                  >
                    <span className="material-symbols-outlined text-[36px] text-on-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      mic
                    </span>
                  </div>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-2">Listening...</h3>
                <p className="font-body-md text-body-md text-outline text-center mb-4">
                  "I want to add project management to my skills..."
                </p>
                <div className="flex items-center gap-1 h-8 mt-4">
                  <div className="w-1.5 bg-secondary-container h-3 rounded-full animate-pulse"></div>
                  <div className="w-1.5 bg-secondary-container h-6 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1.5 bg-secondary h-8 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 bg-secondary-container h-4 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="w-1.5 bg-secondary-container h-2 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[32px] text-on-secondary-container">auto_awesome</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-2 text-center">What we understood</h3>
                <div className="bg-surface-container-low w-full p-4 rounded-xl border border-glass-stroke my-4">
                  <p className="font-body-md text-body-md text-on-surface text-center">
                    Continue editing <strong className="text-primary">{voiceSection}</strong>.
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-4">
                  <button
                    className="flex-1 py-3 rounded-full border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-colors"
                    onClick={() => setModalStep('listening')}
                  >
                    Try Again
                  </button>
                  <button
                    className="flex-1 py-3 rounded-full bg-primary-container text-on-primary font-label-md text-label-md hover:shadow-lg transition-shadow"
                    onClick={confirmVoiceUpdate}
                  >
                    Confirm &amp; Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
