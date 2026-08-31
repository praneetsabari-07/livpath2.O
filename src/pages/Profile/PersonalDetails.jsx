import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguageContext } from '../../context/LanguageContext';
import { translations } from '../../translations';
import { startListening, processTranscript } from '../../services/voiceService';
import { savePersonalDetails } from '../../services/profileService';
import OnboardingStepper from '../../components/layout/OnboardingStepper';

export default function PersonalDetails() {
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
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    dob: '',
    gender: '',
    location: '',
    education: ''
  });

  // Handle the start of voice interaction
  const handleStartSpeaking = () => {
    setVoiceState('listening');
    setTranscript('');
    
    // Use the voice service to simulate listening
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
      const extractedData = await processTranscript(text);
      setFormData(prev => ({ ...prev, ...extractedData }));
      setVoiceState('confirmation');
    } catch (error) {
      console.error(error);
      setVoiceState('idle'); // fallback on error
    }
  };

  const handleConfirm = async () => {
    setVoiceState('saving');
    try {
      const result = await savePersonalDetails(formData);
      if (result.success) {
        setProfileData(formData);
        setVoiceState('success');
        setTimeout(() => {
          navigate(isEditMode ? '/profile' : '/job-preferences');
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
      await savePersonalDetails(formData);
      setProfileData(formData);
      navigate(isEditMode ? '/profile' : '/job-preferences');
    } catch (err) {
      console.error(err);
      navigate(isEditMode ? '/profile' : '/job-preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = () => {
    // Reset and try again
    setVoiceState('listening');
    setTranscript('');
    handleStartSpeaking();
  };

  const handleInputChange = (e) => {
    const { id, name, value } = e.target;
    const fieldName = id || name;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-start w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-stack-md pb-stack-lg z-10 relative">
      
      {/* Stepper */}
      <OnboardingStepper currentStep={3} className="mb-stack-md" />

      {/* Section Header */}
      <div className="w-full text-center mb-stack-md flex flex-col items-center">
        <div className="w-12 h-12 bg-primary-container text-on-primary rounded-full flex items-center justify-center mb-4 shadow-sm">
          <span className="material-symbols-outlined text-[1.5rem]">person</span>
        </div>
        <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2">
          {t('personal_headerTitle', 'Tell us a little about yourself')}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          {t('personal_headerSubtitle', 'You can speak your answers or enter them manually.')}
        </p>
      </div>

      {/* Split Layout Container */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-gutter lg:gap-stack-lg items-stretch max-w-5xl">
        
        {/* LEFT: Voice Guidance Panel */}
        <div className="glass-panel rounded-xl p-stack-md flex flex-col items-center justify-center gap-stack-md min-h-[420px] relative overflow-hidden">

          {/* Mic with concentric rings */}
          <div className="relative flex items-center justify-center py-4">
            <div className="absolute w-[200px] h-[200px] rounded-full border border-primary-container/15"></div>
            <div className="absolute w-[280px] h-[280px] rounded-full border border-secondary/15"></div>
            <button
              type="button"
              onClick={voiceState === 'idle' ? handleStartSpeaking : undefined}
              disabled={voiceState !== 'idle'}
              aria-label={t('personal_startSpeaking', 'Start Speaking')}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-on-primary shadow-lg transition-all duration-300 ${voiceState === 'listening' ? 'bg-secondary animate-pulse-ring' : 'bg-primary-container'} ${voiceState === 'idle' ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
            >
              {voiceState === 'processing' ? (
                <span className="material-symbols-outlined text-[2.5rem] animate-spin">sync</span>
              ) : voiceState === 'success' ? (
                <span className="material-symbols-outlined text-[2.5rem]">check_circle</span>
              ) : (
                <span className="material-symbols-outlined text-[2.5rem]" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
              )}
            </button>
          </div>

          {/* Status / action */}
          <div className="flex flex-col items-center justify-center text-center min-h-[48px]">
            {voiceState === 'idle' && (
              <button
                onClick={handleStartSpeaking}
                className="bg-primary-container text-on-primary px-6 py-3 rounded-lg font-label-md text-label-md hover:bg-on-primary-fixed-variant transition-colors shadow-sm flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">mic</span> {t('personal_startSpeaking', 'Start Speaking')}
              </button>
            )}
            {voiceState === 'listening' && (
              <div className="font-label-md text-label-md text-secondary animate-pulse">{t('personal_listening', 'I am listening...')}</div>
            )}
            {voiceState === 'processing' && (
              <div className="font-label-md text-label-md text-on-surface-variant">{t('personal_processing', 'Processing your details...')}</div>
            )}
          </div>

          {/* Interaction Display */}
          {(voiceState === 'confirmation' || voiceState === 'saving' || voiceState === 'success') && (
            <div className="w-full bg-surface-container-low rounded-lg p-4 border border-outline-variant/30 relative z-10 animate-fade-in">
              <div className="mb-3">
                <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">{t('personal_understood', 'Understood')}</span>
                <p className="font-body-md text-body-md text-on-surface font-medium">{t('personal_verifyDetails', 'Please verify your details')}</p>
              </div>
              <div className="bg-secondary-container/20 rounded p-3 mb-4 border-l-4 border-secondary">
                <span className="font-label-sm text-label-sm text-on-surface-variant">{t('personal_youSaid', 'You said:')}</span>
                <p className="font-body-lg text-body-lg text-primary font-medium italic">"{transcript}"</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <p className="font-label-md text-label-md text-center text-on-surface-variant">{t('personal_isCorrect', 'Is this correct?')}</p>
                <div className="flex gap-2 justify-center">
                  <button 
                    onClick={handleConfirm}
                    disabled={voiceState === 'saving' || voiceState === 'success'}
                    className={`flex-1 py-2 rounded-md font-label-md text-label-md flex items-center justify-center gap-1 transition-colors ${voiceState === 'success' ? 'bg-secondary text-on-secondary' : 'bg-secondary text-on-secondary hover:bg-on-secondary-container'}`}
                  >
                    {voiceState === 'saving' ? (
                      <><span className="material-symbols-outlined text-[1.125rem] animate-spin">sync</span> {t('personal_saving', 'Saving...')}</>
                    ) : voiceState === 'success' ? (
                      <><span className="material-symbols-outlined text-[1.125rem]">check_circle</span> {t('personal_saved', 'Saved')}</>
                    ) : (
                      <><span className="material-symbols-outlined text-[1.125rem]">check</span> {t('personal_yesCorrect', 'Yes, correct')}</>
                    )}
                  </button>
                  <button 
                    onClick={handleReject}
                    disabled={voiceState === 'saving' || voiceState === 'success'}
                    className="flex-1 border border-primary-container text-primary-container py-2 rounded-md font-label-md text-label-md flex items-center justify-center gap-1 hover:bg-surface-variant transition-colors disabled:opacity-50"
                  >
                    🎙 {t('personal_noSayAgain', 'No, say again')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* RIGHT: Personal Details Form */}
        <div className="glass-panel rounded-xl p-stack-md flex flex-col justify-center">
          <form className="space-y-4" onSubmit={handleManualNext}>
            {/* Field 1: Full Name */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="fullName">
                {t('personal_fullName', 'Full Name')}
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  id="fullName" 
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder={t('personal_fullNamePlaceholder', 'Enter your full name')} 
                  className={`w-full h-[48px] rounded-lg border-2 bg-surface-container-lowest px-4 focus:outline-none focus:ring-0 text-on-surface font-body-md transition-colors ${formData.fullName ? 'border-secondary shadow-[0_0_10px_rgba(15,118,110,0.1)]' : 'border-outline-variant focus:border-secondary'}`}
                />
                {formData.fullName && (
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-secondary">check_circle</span>
                )}
              </div>
            </div>
            
            {/* Field 2 & 3: Age & DOB */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="age">
                  {t('personal_age', 'Age')}
                </label>
                <input 
                  type="number" 
                  id="age" 
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder={t('personal_agePlaceholder', 'e.g. 25')} 
                  className={`w-full h-[48px] rounded-lg border bg-surface-container-lowest px-4 focus:outline-none focus:ring-0 text-on-surface font-body-md transition-colors ${formData.age ? 'border-secondary' : 'border-outline-variant focus:border-secondary'}`}
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="dob">
                  {t('personal_dob', 'Date of Birth')}
                </label>
                <div className="relative">
                  <input 
                    type="date" 
                    id="dob" 
                    value={formData.dob}
                    onChange={handleInputChange}
                    className={`w-full h-[48px] rounded-lg border bg-surface-container-lowest px-4 pl-10 focus:outline-none focus:ring-0 text-on-surface font-body-md transition-colors ${formData.dob ? 'border-secondary' : 'border-outline-variant focus:border-secondary'}`}
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">calendar_today</span>
                </div>
              </div>
            </div>
            
            {/* Field 4: Gender */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2">
                {t('personal_gender', 'Gender')}
              </label>
              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer">
                  <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleInputChange} className="peer sr-only" />
                  <div className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-body-md peer-checked:bg-secondary-container peer-checked:border-secondary peer-checked:text-on-secondary-container transition-colors">
                    {t('personal_female', 'Female')}
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleInputChange} className="peer sr-only" />
                  <div className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-body-md peer-checked:bg-secondary-container peer-checked:border-secondary peer-checked:text-on-secondary-container transition-colors">
                    {t('personal_male', 'Male')}
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" name="gender" value="other" checked={formData.gender === 'other'} onChange={handleInputChange} className="peer sr-only" />
                  <div className="px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant font-body-md peer-checked:bg-secondary-container peer-checked:border-secondary peer-checked:text-on-secondary-container transition-colors">
                    {t('personal_preferNotToSay', 'Prefer not to say')}
                  </div>
                </label>
              </div>
            </div>
            
            {/* Field 5: Location */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="location">
                {t('personal_location', 'Location')}
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  id="location" 
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder={t('personal_locationPlaceholder', 'Speak or type district/area')} 
                  className={`w-full h-[48px] rounded-lg border bg-surface-container-lowest px-4 pl-10 focus:outline-none focus:ring-0 text-on-surface font-body-md transition-colors ${formData.location ? 'border-secondary' : 'border-outline-variant focus:border-secondary'}`}
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">location_on</span>
              </div>
            </div>
            
            {/* Field 6: Education Level */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1" htmlFor="education">
                {t('personal_education', 'Highest Education Level')}
              </label>
              <select 
                id="education" 
                value={formData.education}
                onChange={handleInputChange}
                className={`w-full h-[48px] rounded-lg border bg-surface-container-lowest px-4 focus:outline-none focus:ring-0 text-on-surface font-body-md appearance-none transition-colors ${formData.education ? 'border-secondary' : 'border-outline-variant focus:border-secondary'}`}
              >
                <option value="" disabled>{t('personal_selectLevel', 'Select level')}</option>
                <option value="school">{t('personal_school', 'School (up to 10th/12th)')}</option>
                <option value="diploma">{t('personal_diploma', 'Diploma / ITI')}</option>
                <option value="ug">{t('personal_ug', 'Undergraduate')}</option>
                <option value="pg">{t('personal_pg', 'Postgraduate or above')}</option>
              </select>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Navigation Option: Next / Save & Continue */}
      <div className="w-full max-w-5xl mt-stack-md flex justify-end">
        <button
          type="button"
          onClick={handleManualNext}
          disabled={isSubmitting}
          className="flex items-center gap-3 px-8 py-4 rounded-xl bg-primary-container text-on-primary font-headline-md text-headline-md hover:bg-primary transition-all duration-300 shadow-[0_4px_20px_rgba(18,53,91,0.2)] hover:shadow-[0_8px_30px_rgba(18,53,91,0.3)] hover:-translate-y-1 focus:outline-none"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
              <span>{t('personal_saving', 'Saving...')}</span>
            </>
          ) : (
            <>
              <span>{t('personal_next', 'Next: Work Preferences')}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}