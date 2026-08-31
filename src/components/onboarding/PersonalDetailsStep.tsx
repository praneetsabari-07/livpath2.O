import React, { useState } from 'react';
import { User, Phone, MapPin, Calendar, Sparkles, Mic, MicOff, ArrowRight, CheckCircle2, Volume2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { SpeakButton } from '../common/SpeakButton';

interface PersonalDetailsStepProps {
  onSuccess: () => void;
}

export const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({ onSuccess }) => {
  const { t, language } = useLanguage();
  const { profile, savePersonalDetails } = useAuth();
  const { speak, startListening, isListening, stopListening, triggerVoiceAutoFill } = useVoiceAssistant();

  const [formData, setFormData] = useState({
    fullName: profile?.fullName || 'Ramesh Kumar',
    phone: profile?.phone || '9876543210',
    age: profile?.age || '24',
    gender: profile?.gender || 'male',
    location: profile?.location || 'Salem, Tamil Nadu',
  });

  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);

  const handleSingleFieldVoice = (fieldName: keyof typeof formData, promptSpeech: string) => {
    setActiveVoiceField(fieldName);
    speak(promptSpeech);

    setTimeout(() => {
      startListening((spoken) => {
        let val = spoken;
        if (fieldName === 'age') {
          const m = spoken.match(/\d+/);
          if (m) val = m[0];
        } else if (fieldName === 'phone') {
          const num = spoken.replace(/\D/g, '');
          if (num.length >= 10) val = num.slice(-10);
        }

        setFormData(prev => ({ ...prev, [fieldName]: val }));
        speak(`${t(String(fieldName))}: ${val}`);
        setActiveVoiceField(null);
      });
    }, 1800);
  };

  const handleTriggerFullVoiceAutoFill = () => {
    triggerVoiceAutoFill((extracted) => {
      setFormData(prev => ({
        fullName: extracted.fullName || prev.fullName,
        phone: extracted.phone || prev.phone,
        age: extracted.age ? String(extracted.age) : prev.age,
        gender: extracted.gender || prev.gender,
        location: extracted.location || prev.location,
      }));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePersonalDetails(formData);
    speak(language === 'ta' ? 'சுயவிவரம் சேமிக்கப்பட்டது. அடுத்ததாக வேலை விருப்பங்களைத் தேர்வு செய்யுங்கள்.' : 'Personal details saved. Next, choose your job preferences.');
    onSuccess();
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 animate-fade-in">
      {/* Top Bar with Audio and Voice Dictate */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
          <User className="w-6 h-6" />
        </div>
        <SpeakButton textToSpeak={`${t('personalTitle')}. ${t('personalSubtitle')}`} label={t('listen')} />
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
        {t('personalTitle')}
      </h2>
      <p className="text-xs sm:text-sm text-slate-600 mb-5">
        {t('personalSubtitle')}
      </p>

      {/* ONE-TAP VOICE AUTO-FILL HERO BUTTON FOR ILLITERATE USERS */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-md flex items-center justify-between gap-3 border border-amber-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold">{t('voiceAutoFillBtn')}</h4>
            <p className="text-[11px] text-slate-900 leading-tight">
              {language === 'ta' ? 'பேசி பெயர், வயது, ஊர் விவரங்களை தானாக நிரப்புங்கள்' : 'Speak name, age, city to fill everything at once'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleTriggerFullVoiceAutoFill}
          className="px-4 py-2 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow transition-all shrink-0 cursor-pointer"
        >
          {t('startSpeaking')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t('fullName')}
            </label>
            <SpeakButton textToSpeak={t('fullName')} size="sm" />
          </div>
          <div className="relative">
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder={t('namePlaceholder')}
              required
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
            />
            <button
              type="button"
              onClick={() => handleSingleFieldVoice('fullName', language === 'ta' ? 'உங்கள் முழுப் பெயரைச் சொல்லுங்கள்' : 'Speak your full name')}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                activeVoiceField === 'fullName' ? 'bg-red-500 text-white animate-pulse' : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Age & Gender Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Age */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('age')}
              </label>
              <SpeakButton textToSpeak={t('age')} size="sm" />
            </div>
            <div className="relative">
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder={t('agePlaceholder')}
                min={18}
                max={70}
                required
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
              />
              <button
                type="button"
                onClick={() => handleSingleFieldVoice('age', language === 'ta' ? 'உங்கள் வயதைச் சொல்லுங்கள்' : 'Speak your age')}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                  activeVoiceField === 'age' ? 'bg-red-500 text-white animate-pulse' : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                }`}
              >
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Gender */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('gender')}
              </label>
              <SpeakButton textToSpeak={t('gender')} size="sm" />
            </div>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="male">{t('genderMale')}</option>
              <option value="female">{t('genderFemale')}</option>
              <option value="other">{t('genderOther')}</option>
            </select>
          </div>
        </div>

        {/* Contact Phone Number */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t('contactDetails')}
            </label>
            <SpeakButton textToSpeak={t('contactDetails')} size="sm" />
          </div>
          <div className="relative">
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder={t('contactPlaceholder')}
              required
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
            />
            <button
              type="button"
              onClick={() => handleSingleFieldVoice('phone', language === 'ta' ? 'உங்கள் தொடர்பு எண்ணைச் சொல்லுங்கள்' : 'Speak your phone number')}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                activeVoiceField === 'phone' ? 'bg-red-500 text-white animate-pulse' : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Location / District */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t('location')}
            </label>
            <SpeakButton textToSpeak={t('location')} size="sm" />
          </div>
          <div className="relative">
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder={t('locationPlaceholder')}
              required
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20"
            />
            <button
              type="button"
              onClick={() => handleSingleFieldVoice('location', language === 'ta' ? 'உங்கள் ஊர் பெயரைச் சொல்லுங்கள்' : 'Speak your city or district')}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                activeVoiceField === 'location' ? 'bg-red-500 text-white animate-pulse' : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-4 py-4 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-teal-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{t('saveAndContinue')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
