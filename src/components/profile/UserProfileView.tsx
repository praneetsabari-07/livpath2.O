import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { SpeakButton } from '../common/SpeakButton';
import { User, Phone, MapPin, GraduationCap, ShieldCheck, Award, Edit3, Mic, CheckCircle2, Sparkles } from 'lucide-react';

interface UserProfileViewProps {
  onEditProfile: () => void;
  onOpenSkillHub: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onEditProfile, onOpenSkillHub }) => {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const { speak } = useVoiceAssistant();

  const fullName = profile?.fullName || 'Ramesh Kumar';
  const skillsList = profile?.skills ? profile.skills.join(', ') : 'Tailoring, Stitching';
  const profileSpeech = `Profile of ${fullName}. Age: ${profile?.age || '24'}. Contact: ${profile?.phone || '9876543210'}. Education: ${profile?.education || '10th Pass'}. Verified skills: ${skillsList}. Location: ${profile?.location || 'Salem'}.`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-3 sm:px-6 py-6 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-700/50 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-teal-800/80 border border-teal-600 text-teal-300 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-8 h-8 text-teal-300" />
            </div>
            {profile?.certificateVerified && (
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-slate-900 shadow">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">{fullName}</h2>
              <span className="bg-teal-700 text-teal-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-teal-500/40">
                10th Pass Candidate
              </span>
            </div>
            <p className="text-xs text-teal-200 flex items-center justify-center sm:justify-start gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{profile?.location || 'Salem, Tamil Nadu'}</span>
              <span>•</span>
              <Phone className="w-3.5 h-3.5" />
              <span>+91 {profile?.phone || '9876543210'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SpeakButton textToSpeak={profileSpeech} variant="secondary" size="md" />
          <button
            onClick={onEditProfile}
            className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-xl border border-teal-500 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'விவரங்களை மாற்று' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {/* Verified Certificate Card */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-extrabold text-emerald-950">
                {t('certificateVerified')}
              </h4>
              <span className="bg-emerald-200 text-emerald-900 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                Govt Verified
              </span>
            </div>
            <p className="text-xs text-emerald-800 mt-0.5">
              {profile.certificateType} • {profile.verifiedAt}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSkillHub}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Award className="w-4 h-4" />
          <span>{t('downloadCertificate')}</span>
        </button>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Education & Age Card */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-teal-700" />
            <span>{t('education')} & {t('age')}</span>
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500">{t('education')}:</span>
              <span className="text-xs font-bold text-teal-950 bg-teal-100 px-2.5 py-1 rounded-lg">
                {t('edu10th')}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500">{t('age')}:</span>
              <span className="text-xs font-bold text-slate-900">{profile.age} {t('yearsOld')}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500">{t('gender')}:</span>
              <span className="text-xs font-bold text-slate-900 capitalize">{profile.gender}</span>
            </div>
          </div>
        </div>

        {/* Skills & Preferences */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-teal-700" />
            <span>{t('skills')} & {t('workType')}</span>
          </h4>

          <div className="space-y-3">
            <div>
              <span className="text-xs text-slate-500 block mb-1.5">{t('skills')}:</span>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((sk, idx) => (
                  <span key={idx} className="px-3 py-1 bg-teal-50 text-teal-900 border border-teal-200 text-xs font-bold rounded-lg">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500">{t('workType')}:</span>
              <span className="text-xs font-bold text-slate-900">{profile.workType}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
