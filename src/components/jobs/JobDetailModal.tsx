import React from 'react';
import { Job } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { SpeakButton } from '../common/SpeakButton';
import { X, MapPin, Building, Briefcase, Phone, CheckCircle2, Award, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (job: Job) => void;
  isApplied: boolean;
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  isOpen,
  onClose,
  onApply,
  isApplied,
}) => {
  const { t, language } = useLanguage();
  const { speak } = useVoiceAssistant();

  if (!isOpen || !job) return null;

  const jobDetailsSpeech = `${job.title} at ${job.company}. Location: ${job.location}. Salary: ${job.salary}. Minimum qualification: ${job.educationLabel}. ${job.description}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full">
                {job.matchScore ? `${job.matchScore}% Match` : 'Recommended'}
              </span>
              <span className="bg-teal-700 text-teal-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {job.workType}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black leading-snug text-white">{job.title}</h3>
            <p className="text-xs sm:text-sm text-teal-200 flex items-center gap-1.5 mt-1">
              <Building className="w-3.5 h-3.5" />
              <span>{job.company}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SpeakButton textToSpeak={jobDetailsSpeech} size="md" variant="secondary" />
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">{t('salary')}</span>
              <span className="text-xs sm:text-sm font-extrabold text-teal-900">{job.salary}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-medium block">{t('location')}</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900">{job.location}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-slate-500 font-medium block">{t('educationRequired')}</span>
              <span className="text-xs sm:text-sm font-extrabold text-teal-800">{job.educationLabel}</span>
            </div>
          </div>

          {/* Training & Perks Banner */}
          {job.trainingAvailable && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5">
              <Award className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-emerald-950">{t('freeTrainingBanner')}</h5>
                <p className="text-[11px] text-emerald-800 mt-0.5">{job.trainingNote}</p>
              </div>
            </div>
          )}

          {/* Job Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5">
              {language === 'ta' ? 'வேலை பற்றிய விளக்கம்' : 'Job Description'}
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              {job.description}
            </p>
          </div>

          {/* Key Requirements */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              {t('requirements')}
            </h4>
            <div className="space-y-2">
              {job.requirements.map((req, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{req}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Required */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2">
              {t('skills')}
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {job.skillsRequired.map((sk, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-teal-100 text-teal-900 font-semibold text-xs rounded-lg">
                  {sk}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={`tel:${job.contactPhone}`}
            className="w-full sm:w-auto px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Phone className="w-4 h-4 text-teal-700" />
            <span>{t('callEmployer')} ({job.contactPhone})</span>
          </a>

          <button
            type="button"
            onClick={() => onApply(job)}
            disabled={isApplied}
            className={`w-full sm:w-auto flex-1 py-3.5 px-6 rounded-xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isApplied
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-teal-700 hover:bg-teal-800 text-white hover:shadow-teal-700/30'
            }`}
          >
            {isApplied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('appliedSuccessfully')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{t('applyNow')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
