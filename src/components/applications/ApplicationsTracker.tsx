import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { SpeakButton } from '../common/SpeakButton';
import { Application } from '../../types';
import { FileCheck, CheckCircle2, Clock, Calendar, Award, Building, MapPin, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

export const ApplicationsTracker: React.FC<{ onNavigateJobs: () => void }> = ({ onNavigateJobs }) => {
  const { t, language } = useLanguage();
  const { applications } = useAuth();
  const { speak } = useVoiceAssistant();

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-3 sm:px-6 py-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-teal-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full">
              Status Tracker
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">{t('navApplications')}</h2>
          <p className="text-xs sm:text-sm text-teal-200 mt-1">
            {language === 'ta' ? 'நீங்கள் விண்ணப்பித்த வேலைகளின் நேரடி நிலை மற்றும் நேர்காணல் விபரம்' : 'Track live status, interview schedules, and employer offer letters'}
          </p>
        </div>

        <SpeakButton
          textToSpeak={`${t('navApplications')}. You have ${applications.length} active job applications.`}
          variant="secondary"
          size="md"
        />
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
            <FileCheck className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No applications yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Explore recommended jobs matching your qualification and apply with 1-click.
          </p>
          <button
            onClick={onNavigateJobs}
            className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow transition-all"
          >
            {t('navJobs')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const appSpeech = `Application for ${app.jobTitle} at ${app.company}. Status: ${app.statusLabel}. ${app.nextStep}`;

            return (
              <div
                key={app.applicationId}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md hover:shadow-lg transition-all space-y-5"
              >
                {/* Application Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono font-bold text-slate-400">ID: {app.applicationId}</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        app.status === 'interview_scheduled'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}>
                        {app.statusLabel}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">{app.jobTitle}</h3>
                    <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{app.company}</span>
                      <span>•</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{app.location}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-teal-900 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
                      {app.salary}
                    </span>
                    <SpeakButton textToSpeak={appSpeech} size="sm" />
                  </div>
                </div>

                {/* Timeline Stages */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {app.timeline.map((step, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        step.done
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                          : step.current
                          ? 'bg-amber-50/80 border-amber-300 text-amber-950 ring-2 ring-amber-400/20'
                          : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full mx-auto flex items-center justify-center mb-1.5 bg-white shadow-xs">
                        {step.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : step.current ? (
                          <Calendar className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <h4 className="text-xs font-bold leading-tight">{step.label}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{step.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Interview / Next Step Banner */}
                {app.interviewDate && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold">{t('interviewDate')}: {app.interviewDate}</h5>
                      <p className="text-[11px] text-amber-900 mt-0.5">{app.nextStep}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
