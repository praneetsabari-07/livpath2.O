import React, { useState } from 'react';
import { Briefcase, GraduationCap, CheckCircle2, ArrowRight, Sparkles, Plus, X, Wrench, Scissors, Zap, Flame, Truck, Utensils, Laptop, Shield } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { EducationLevel, WorkType } from '../../types';
import { SpeakButton } from '../common/SpeakButton';

interface JobPreferencesStepProps {
  onSuccess: () => void;
}

export const JobPreferencesStep: React.FC<JobPreferencesStepProps> = ({ onSuccess }) => {
  const { t, language } = useLanguage();
  const { profile, saveJobPreferences } = useAuth();
  const { speak } = useVoiceAssistant();

  const [education, setEducation] = useState<EducationLevel>(profile?.education || '10th_pass');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    profile?.skills && profile.skills.length > 0 ? profile.skills : ['Tailoring', 'Stitching']
  );
  const [workType, setWorkType] = useState<WorkType>(profile?.workType || 'Full-time');
  const [customSkill, setCustomSkill] = useState('');

  const educationOptions: { id: EducationLevel; label: string; sub: string; badge?: string }[] = [
    { id: '10th_pass', label: t('edu10th'), sub: 'SSLC / 10th Standard Pass', badge: 'High Demand' },
    { id: 'below_10th', label: t('eduBelow10th'), sub: 'Primary / 8th standard / Practical Skill' },
    { id: '12th_pass', label: t('edu12th'), sub: 'Higher Secondary School / HSC' },
    { id: 'iti_vocational', label: t('eduIti'), sub: 'Industrial Training / Vocational Certificate' },
    { id: 'diploma', label: t('eduDiploma'), sub: 'Polytechnic 3-Year Diploma' },
    { id: 'graduate', label: t('eduGraduate'), sub: 'Bachelor Degree (BA, B.Sc, B.Com, BE)' },
  ];

  const popularSkills = [
    { name: 'Tailoring', label: language === 'ta' ? 'தையல் & பிளவுஸ்' : 'Tailoring & Stitching', icon: Scissors },
    { name: 'House Wiring', label: language === 'ta' ? 'எலக்ட்ரீசியன்' : 'Electrician & Wiring', icon: Zap },
    { name: 'Welding', label: language === 'ta' ? 'வெல்டிங்' : 'Welding & Fabrication', icon: Flame },
    { name: 'Driving', label: language === 'ta' ? 'டிரைவிங் & டெலிவரி' : 'Driving & Delivery', icon: Truck },
    { name: 'Cooking', label: language === 'ta' ? 'சமையல் & கேட்டரிங்' : 'Cooking & Catering', icon: Utensils },
    { name: 'Web Design', label: language === 'ta' ? 'இணையதளம் / கம்ப்யூட்டர்' : 'Web & Computer Basics', icon: Laptop },
    { name: 'Auto Mechanic', label: language === 'ta' ? 'டூ-வீலர் மெக்கானிக்' : 'Auto Mechanic', icon: Wrench },
    { name: 'Security Guard', label: language === 'ta' ? 'பாதுகாவலர் (Security)' : 'Security Guard', icon: Shield },
  ];

  const workTypes: { id: WorkType; label: string }[] = [
    { id: 'Full-time', label: t('workTypeFullTime') },
    { id: 'Part-time', label: t('workTypePartTime') },
    { id: 'Contract', label: t('workTypeContract') },
    { id: 'Daily Wage', label: t('workTypeDailyWage') },
  ];

  const toggleSkill = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName));
    } else {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveJobPreferences({
      education,
      skills: selectedSkills,
      workType,
    });

    const eduLabel = educationOptions.find(e => e.id === education)?.label || education;
    speak(
      language === 'ta'
        ? `உங்கள் படிப்பு (${eduLabel}) மற்றும் திறன்களுக்கு ஏற்ற வேலைகள் பட்டியலிடப்படுகின்றன!`
        : `Matching top jobs for your ${eduLabel} qualification and skills!`
    );

    onSuccess();
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
          <GraduationCap className="w-6 h-6" />
        </div>
        <SpeakButton textToSpeak={`${t('jobPrefTitle')}. ${t('jobPrefSubtitle')}`} label={t('listen')} />
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
        {t('jobPrefTitle')}
      </h2>
      <p className="text-xs sm:text-sm text-slate-600 mb-6">
        {t('jobPrefSubtitle')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Education Qualification (Critical for 10th pass job matching) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-teal-700" />
              <span>{t('education')}</span>
            </label>
            <SpeakButton textToSpeak={t('education')} size="sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {educationOptions.map((opt) => {
              const isSelected = education === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setEducation(opt.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold ring-2 ring-teal-500/20'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold block">{opt.label}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 ml-1" />}
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{opt.sub}</span>
                  {opt.badge && (
                    <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                      {opt.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Skills and Work You Know */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-teal-700" />
              <span>{t('skills')}</span>
            </label>
            <SpeakButton textToSpeak={t('skills')} size="sm" />
          </div>

          {/* Quick Popular Skill Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {popularSkills.map((sk) => {
              const isSelected = selectedSkills.some(s => s.toLowerCase().includes(sk.name.toLowerCase()));
              const IconComp = sk.icon;
              return (
                <button
                  key={sk.name}
                  type="button"
                  onClick={() => toggleSkill(sk.name)}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-700 text-white font-bold border-teal-700 shadow-sm'
                      : 'bg-slate-50 hover:bg-teal-50/60 border-slate-200 text-slate-700'
                  }`}
                >
                  <IconComp className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-teal-700'}`} />
                  <span className="text-xs">{sk.label}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Skills Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {selectedSkills.map((s, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-900 border border-teal-300"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => setSelectedSkills(selectedSkills.filter((_, i) => i !== idx))}
                  className="p-0.5 hover:bg-teal-200 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add custom skill input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              placeholder={language === 'ta' ? 'வேறு ஏதேனும் தொழில் திறன்கள் இருந்தால் உள்ளிடவும்...' : 'Add any other skill...'}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-teal-600"
            />
            <button
              type="button"
              onClick={handleAddCustomSkill}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ta' ? 'சேர்' : 'Add'}</span>
            </button>
          </div>
        </div>

        {/* 3. Work Type Preference */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-teal-700" />
              <span>{t('workType')}</span>
            </label>
            <SpeakButton textToSpeak={t('workType')} size="sm" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {workTypes.map((wt) => {
              const isSelected = workType === wt.id;
              return (
                <button
                  key={wt.id}
                  type="button"
                  onClick={() => setWorkType(wt.id)}
                  className={`py-2.5 px-3 rounded-xl border text-center text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {wt.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-teal-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>{t('jobPrefMatchingBtn')}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
