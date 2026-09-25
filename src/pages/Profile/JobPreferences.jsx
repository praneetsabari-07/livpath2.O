import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguageContext } from '../../context/LanguageContext';
import { translations } from '../../translations';
import { startListening, processJobPreferencesTranscript } from '../../services/voiceService';
import { saveJobPreferences } from '../../services/profileService';
import OnboardingStepper from '../../components/layout/OnboardingStepper';

export default function JobPreferences() {
  const navigate = useNavigate();
  const location = useLocation();
  // 'edit' when reached from My Profile; otherwise part of onboarding.
  const isEditMode = location.state?.mode === 'edit';
  const { setProfileData } = useAuth();
  const { language } = useLanguageContext();
  const t = (key, fallback) => translations[language]?.[key] || translations['en']?.[key] || fallback || key;
  
  // Voice interaction states: 'idle', 'listening', 'processing', 'confirmation', 'saving', 'success'
  const [voiceState, setVoiceState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Temporary Form state
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [tempPrefs, setTempPrefs] = useState({
    skills: [],
    workType: 'Any',
    locationType: 'Anywhere',
    specificLocation: '',
    hasExperience: false,
    experienceDescription: ''
  });

  const SUGGESTED_SKILLS = ['Driving', 'Cooking', 'Cleaning', 'Data Entry', 'Tailoring', 'Customer Service'];

  const WORK_TYPE_OPTIONS = [
    { value: 'Full-time', key: 'jobPrefs_fullTime', fallback: 'Full-time' },
    { value: 'Part-time', key: 'jobPrefs_partTime', fallback: 'Part-time' },
    { value: 'Temporary', key: 'jobPrefs_temporary', fallback: 'Temporary' },
    { value: 'Any', key: 'jobPrefs_any', fallback: 'Any' },
  ];

  const LOCATION_TYPE_OPTIONS = [
    { value: 'Near me', key: 'jobPrefs_nearMe', fallback: 'Near me' },
    { value: 'Within my district', key: 'jobPrefs_withinDistrict', fallback: 'Within my district' },
    { value: 'Anywhere', key: 'jobPrefs_anywhere', fallback: 'Anywhere' },
  ];

  // Handle the start of voice interaction
  const handleStartSpeaking = () => {
    setVoiceState('listening');
    setTranscript('');
    
    startListening(
      (text) => {
        setTranscript(text);
        handleTranscriptReceived(text);
      },
      (err) => {
        console.error(err);
        setVoiceState('idle');
      },
      () => {
        // on end
      }
    );
  };

  const handleTranscriptReceived = async (text) => {
    setVoiceState('processing');
    try {
      const extractedData = await processJobPreferencesTranscript(text);
      setTempPrefs(extractedData);
      setVoiceState('confirmation');
    } catch (error) {
      console.error(error);
      setVoiceState('idle');
    }
  };

  const handleConfirm = async () => {
    setVoiceState('saving');
    try {
      const result = await saveJobPreferences(tempPrefs);
      if (result.success) {
        setProfileData(prev => ({ ...prev, jobPreferences: tempPrefs }));
        setVoiceState('success');
        setTimeout(() => {
          navigate(isEditMode ? '/profile' : '/profile-setup-complete');
        }, 1500);
      }
    } catch (error) {
      console.error(error);
      setVoiceState('confirmation');
    }
  };

  const handleManualNext = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveJobPreferences(tempPrefs);
      setProfileData(prev => ({ ...prev, jobPreferences: tempPrefs }));
      navigate(isEditMode ? '/profile' : '/profile-setup-complete');
    } catch (err) {
      console.error(err);
      navigate(isEditMode ? '/profile' : '/profile-setup-complete');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = () => {
    setVoiceState('listening');
    setTranscript('');
    handleStartSpeaking();
  };

  // Manual Updates
  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (!tempPrefs.skills.includes(trimmed)) {
      const updatedSkills = [...tempPrefs.skills, trimmed];
      const updatedPrefs = { ...tempPrefs, skills: updatedSkills };
      setTempPrefs(updatedPrefs);
      // Synchronize with active profile data immediately
      setProfileData(prev => ({
        ...prev,
        skills: updatedSkills,
        jobPreferences: {
          ...(prev?.jobPreferences || {}),
          skills: updatedSkills,
        },
      }));
    }
    setCustomSkillInput('');
  };

  const toggleSkill = (skill) => {
    setTempPrefs(prev => {
      const exists = prev.skills.includes(skill);
      const updated = exists ? prev.skills.filter(s => s !== skill) : [...prev.skills, skill];
      setProfileData(p => ({
        ...p,
        skills: updated,
        jobPreferences: {
          ...(p?.jobPreferences || {}),
          skills: updated,
        },
      }));
      return { ...prev, skills: updated };
    });
  };

  const removeSkill = (skill) => {
    setTempPrefs(prev => {
      const updated = prev.skills.filter(s => s !== skill);
      setProfileData(p => ({
        ...p,
        skills: updated,
        jobPreferences: {
          ...(p?.jobPreferences || {}),
          skills: updated,
        },
      }));
      return { ...prev, skills: updated };
    });
  };

  const updateField = (field, value) => {
    setTempPrefs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-stack-md pb-stack-lg relative z-10">
      
      {/* Progress Indicator */}
      <OnboardingStepper currentStep={4} className="mb-stack-md" />

      <div className="flex flex-col md:flex-row gap-stack-lg max-w-5xl mx-auto items-stretch">
        
        {/* LEFT / TOP: Voice Guidance Panel */}
        <div className="flex-1 w-full flex flex-col">
          <div className="mb-stack-md text-center md:text-left">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-container text-on-primary-container mb-4 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">work</span>
            </div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-primary mb-2">
              {t('jobPrefs_title', 'What kind of work are you looking for?')}
            </h1>
            <p className="font-body-lg text-on-surface-variant">
              {t('jobPrefs_subtitle', 'You can speak your answers or select them manually.')}
            </p>
          </div>
          
          <div className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container-high mb-stack-md relative overflow-hidden group flex-grow flex flex-col justify-center min-h-[300px]">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div className="relative flex items-center justify-center flex-shrink-0">
                <span className="absolute w-[128px] h-[128px] rounded-full border border-secondary/15 pointer-events-none"></span>
                <span className="absolute w-[168px] h-[168px] rounded-full border border-primary-container/10 pointer-events-none hidden md:block"></span>
                <button
                  onClick={voiceState === 'idle' ? handleStartSpeaking : undefined}
                  aria-label={t('jobPrefs_startSpeaking', 'Start Speaking')}
                  className={`relative w-20 h-20 rounded-full border-2 flex items-center justify-center transition-transform ${voiceState === 'listening' ? 'bg-[#0F766E] text-white border-[#0F766E] animate-pulse-ring scale-110' : voiceState === 'processing' ? 'bg-[#F0FDFA] border-[#0F766E] text-[#0F766E]' : voiceState === 'success' ? 'bg-[#0F766E] text-white border-[#0F766E]' : 'bg-[#F0FDFA] border-[#0F766E] text-[#0F766E] hover:scale-105 cursor-pointer'}`}
                >
                  {voiceState === 'processing' ? (
                    <span className="material-symbols-outlined text-[32px] animate-spin">sync</span>
                  ) : voiceState === 'success' ? (
                    <span className="material-symbols-outlined text-[32px]">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-[32px]">mic</span>
                  )}
                </button>
              </div>
              
              <div className="text-center md:text-left flex-1 w-full">
                {voiceState === 'idle' && (
                  <>
                    <h3 className="font-headline-md text-primary mb-1">{t('jobPrefs_startSpeaking', 'Start Speaking')}</h3>
                    <p className="font-body-md text-on-surface-variant">{t('jobPrefs_demoHint', '"I am looking for part-time driving work nearby."')}</p>
                  </>
                )}
                
                {voiceState === 'listening' && (
                  <div className="font-headline-md text-secondary animate-pulse">{t('jobPrefs_listening', 'Listening...')}</div>
                )}
                
                {voiceState === 'processing' && (
                  <div className="font-headline-md text-primary animate-pulse">{t('jobPrefs_processing', 'Processing your preferences...')}</div>
                )}
                
                {(voiceState === 'confirmation' || voiceState === 'saving' || voiceState === 'success') && (
                  <div className="bg-[#F4F6F1] rounded-lg p-4 border border-[#0F766E]/20 mt-4 animate-fade-in w-full text-left">
                    <p className="font-body-md text-on-surface mb-2">
                      <span className="font-bold">{t('jobPrefs_youSaid', 'You said:')}</span> "{transcript}"
                    </p>
                    <p className="font-label-md text-on-surface-variant mb-3">{t('jobPrefs_isCorrect', 'Is this correct?')}</p>
                    <div className="flex gap-3 justify-start">
                      <button 
                        onClick={handleConfirm}
                        disabled={voiceState === 'saving' || voiceState === 'success'}
                        className={`px-4 py-2 rounded-lg font-label-md transition-opacity flex items-center gap-2 ${voiceState === 'success' ? 'bg-secondary text-on-secondary' : 'bg-secondary text-on-secondary hover:opacity-90'}`}
                      >
                        {voiceState === 'saving' ? (
                          <><span className="material-symbols-outlined text-[16px] animate-spin">sync</span> {t('jobPrefs_saving', 'Saving...')}</>
                        ) : voiceState === 'success' ? (
                          <><span className="material-symbols-outlined text-[16px]">check</span> {t('jobPrefs_saved', 'Saved')}</>
                        ) : (
                          t('jobPrefs_yesCorrect', 'Yes, correct')
                        )}
                      </button>
                      <button 
                        onClick={handleReject}
                        disabled={voiceState === 'saving' || voiceState === 'success'}
                        className="px-4 py-2 rounded-lg border border-outline text-on-surface font-label-md hover:bg-surface-container-low transition-colors disabled:opacity-50"
                      >
                        {t('jobPrefs_noSayAgain', 'No, say again')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT / BOTTOM: Manual Fallback Forms */}
        <div className="flex-1 w-full space-y-stack-md flex flex-col justify-center">
          
          {/* Skills Section */}
          <section className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container-high transition-colors">
            <h2 className="font-headline-md text-primary mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">psychology</span>
              {t('jobPrefs_skills', 'What are you good at?')}
            </h2>
            <p className="font-body-sm text-on-surface-variant mb-4">
              {t('jobPrefs_skillsSubtitle', 'Add skills you know to update your profile and match with relevant jobs.')}
            </p>

            {/* Custom Skill Input Box */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomSkill();
                  }
                }}
                placeholder={t('jobPrefs_skillPlaceholder', 'Type what you are good at (e.g. Electrical, Cooking)...')}
                className="flex-1 h-[46px] rounded-lg border border-outline-variant bg-surface-container-lowest px-4 text-on-surface font-body-md focus:outline-none focus:border-secondary transition-colors"
              />
              <button
                type="button"
                onClick={handleAddCustomSkill}
                className="px-5 h-[46px] rounded-lg bg-secondary text-on-secondary font-label-md hover:bg-on-secondary-container transition-colors flex items-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>{t('jobPrefs_addSkill', 'Add')}</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {tempPrefs.skills.length === 0 && (
                <span className="text-on-surface-variant font-body-md italic opacity-70">
                  {t('jobPrefs_noSkills', 'No skills added yet')}
                </span>
              )}
              {tempPrefs.skills.map((skill) => (
                <div key={skill} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0FDFA] border border-[#0F766E] text-[#0F766E] font-label-md animate-fade-in shadow-xs">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-primary transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
            </div>
            
            <p className="font-label-sm text-on-surface-variant mb-2">
              {t('jobPrefs_suggested', 'Suggested (tap to add):')}
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SKILLS.filter(s => !tempPrefs.skills.includes(s)).map(skill => (
                <button 
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className="px-3 py-1.5 rounded-full border border-outline-variant text-on-surface-variant font-label-md hover:border-secondary hover:text-secondary transition-colors"
                >
                  {skill}
                </button>
              ))}
            </div>
          </section>

          {/* Work Type */}
          <section className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container-high">
            <h2 className="font-headline-md text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">schedule</span>
              {t('jobPrefs_workType', 'Work Type')}
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {WORK_TYPE_OPTIONS.map(opt => (
                <button 
                  key={opt.value}
                  onClick={() => updateField('workType', opt.value)}
                  className={`py-3 px-2 rounded-lg border font-label-md text-center transition-colors ${tempPrefs.workType === opt.value ? 'border-secondary border-2 bg-[#F0FDFA] text-[#0F766E] font-bold' : 'border-outline-variant text-on-surface-variant hover:border-secondary'}`}
                >
                  {t(opt.key, opt.fallback)}
                </button>
              ))}
            </div>
          </section>

          {/* Location */}
          <section className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container-high">
            <h2 className="font-headline-md text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">location_on</span>
              {t('jobPrefs_location', 'Location')}
            </h2>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 mb-4">
              {LOCATION_TYPE_OPTIONS.map(locOpt => (
                <label key={locOpt.value} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="locationType" 
                    checked={tempPrefs.locationType === locOpt.value}
                    onChange={() => {
                      updateField('locationType', locOpt.value);
                      if (locOpt.value !== 'Specific') updateField('specificLocation', '');
                    }}
                    className="text-secondary focus:ring-secondary cursor-pointer" 
                  />
                  <span className="font-body-md text-on-surface group-hover:text-secondary transition-colors">
                    {t(locOpt.key, locOpt.fallback)}
                  </span>
                </label>
              ))}
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
              <input 
                type="text" 
                value={tempPrefs.specificLocation}
                onChange={(e) => {
                  updateField('locationType', 'Specific');
                  updateField('specificLocation', e.target.value);
                }}
                className={`w-full h-12 pl-10 pr-4 rounded-lg border focus:ring-0 font-body-md bg-surface transition-all ${tempPrefs.locationType === 'Specific' || tempPrefs.specificLocation ? 'border-2 border-[#0F766E]' : 'border-[#CBD5E1] focus:border-2 focus:border-[#0F766E]'}`}
                placeholder={t('jobPrefs_locationSearchPlaceholder', 'Or enter a specific city or area...')} 
              />
            </div>
          </section>

          {/* Experience */}
          <section className="bg-surface rounded-xl p-6 shadow-sm border border-surface-container-high">
            <h2 className="font-headline-md text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">history</span>
              {t('jobPrefs_experience', 'Experience')}
            </h2>
            <p className="font-body-md text-on-surface mb-3">{t('jobPrefs_haveWorked', 'Have you worked before?')}</p>
            <div className="flex gap-4 mb-4">
              <button 
                onClick={() => updateField('hasExperience', true)}
                className={`px-6 py-2 rounded-lg border font-label-md transition-colors ${tempPrefs.hasExperience ? 'border-secondary border-2 bg-[#F0FDFA] text-[#0F766E] font-bold' : 'border-outline-variant text-on-surface-variant hover:border-secondary'}`}
              >
                {t('jobPrefs_yes', 'Yes')}
              </button>
              <button 
                onClick={() => {
                  updateField('hasExperience', false);
                  updateField('experienceDescription', '');
                }}
                className={`px-6 py-2 rounded-lg border font-label-md transition-colors ${!tempPrefs.hasExperience ? 'border-secondary border-2 bg-[#F0FDFA] text-[#0F766E] font-bold' : 'border-outline-variant text-on-surface-variant hover:border-secondary'}`}
              >
                {t('jobPrefs_no', 'No')}
              </button>
            </div>
            
            {tempPrefs.hasExperience && (
              <div className="animate-fade-in mt-4 border-t border-surface-container-high pt-4">
                <label className="block font-body-md text-on-surface mb-2">{t('jobPrefs_workDescription', 'What kind of work have you done?')}</label>
                <textarea 
                  value={tempPrefs.experienceDescription}
                  onChange={(e) => updateField('experienceDescription', e.target.value)}
                  className="w-full rounded-lg border border-[#CBD5E1] focus:border-2 focus:border-[#0F766E] focus:ring-0 font-body-md bg-surface p-3 transition-all" 
                  placeholder={t('jobPrefs_experiencePlaceholder', 'Describe your past experience...')} 
                  rows="3"
                ></textarea>
              </div>
            )}
          </section>

        </div>
      </div>

      {/* Bottom Navigation Option: Next / Save & Continue */}
      <div className="w-full max-w-5xl mx-auto mt-stack-md flex justify-end">
        <button
          type="button"
          onClick={handleManualNext}
          disabled={isSubmitting}
          className="flex items-center gap-3 px-8 py-4 rounded-xl bg-primary-container text-on-primary font-headline-md text-headline-md hover:bg-primary transition-all duration-300 shadow-[0_4px_20px_rgba(18,53,91,0.2)] hover:shadow-[0_8px_30px_rgba(18,53,91,0.3)] hover:-translate-y-1 focus:outline-none"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
              <span>{t('jobPrefs_saving', 'Saving...')}</span>
            </>
          ) : (
            <>
              <span>{t('jobPrefs_next', 'Next: Find Jobs')}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}