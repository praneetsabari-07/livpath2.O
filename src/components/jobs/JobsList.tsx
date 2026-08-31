import React, { useState, useMemo } from 'react';
import { Job, EducationLevel } from '../../types';
import { INITIAL_JOBS } from '../../data/jobsData';
import { matchJobsForUser } from '../../utils/jobMatcher';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { SpeakButton } from '../common/SpeakButton';
import { JobDetailModal } from './JobDetailModal';
import { Search, Filter, Sparkles, Building, MapPin, Briefcase, GraduationCap, Award, Phone, CheckCircle2, ArrowRight, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

interface JobsListProps {
  onOpenSkillHub: () => void;
}

export const JobsList: React.FC<JobsListProps> = ({ onOpenSkillHub }) => {
  const { t, language } = useLanguage();
  const { profile, applications, submitApplication } = useAuth();
  const { speak } = useVoiceAssistant();

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | '10th_pass' | 'training' | 'near' | 'high_salary'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Matched jobs computed with ranking algorithm
  const matchedJobs = useMemo(() => {
    const scored = matchJobsForUser(INITIAL_JOBS, profile);
    return scored;
  }, [profile]);

  const filteredJobs = useMemo(() => {
    return matchedJobs.filter(job => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = job.title.toLowerCase().includes(q);
        const matchesComp = job.company.toLowerCase().includes(q);
        const matchesLoc = job.location.toLowerCase().includes(q);
        const matchesSkill = job.skillsRequired.some(s => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesComp && !matchesLoc && !matchesSkill) return false;
      }

      // Category filter
      if (filterCategory === '10th_pass') {
        return job.minEducation === '10th_pass' || job.minEducation === 'below_10th';
      }
      if (filterCategory === 'training') {
        return job.trainingAvailable;
      }
      if (filterCategory === 'near') {
        return job.distanceKm <= 6.0;
      }
      if (filterCategory === 'high_salary') {
        return job.salaryNumeric >= 20000;
      }

      return true;
    });
  }, [matchedJobs, filterCategory, searchQuery]);

  const handleApply = (job: Job) => {
    submitApplication({
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      location: job.location,
      workType: job.workType,
      salary: job.salary,
      status: 'submitted',
      interviewDate: 'To be confirmed by employer via SMS',
    });

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
    });

    speak(
      language === 'ta'
        ? `வாழ்த்துகள்! ${job.title} வேலைக்கான விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது. விரைவில் நிறுவனம் உங்களை அழைக்கும்.`
        : `Congratulations! Your application for ${job.title} has been submitted successfully.`
    );
  };

  const isJobApplied = (jobId: string) => {
    return applications.some(a => a.jobId === jobId);
  };

  const educationLabelMap: Record<EducationLevel, string> = {
    'below_10th': t('eduBelow10th'),
    '10th_pass': t('edu10th'),
    '12th_pass': t('edu12th'),
    'iti_vocational': t('eduIti'),
    'diploma': t('eduDiploma'),
    'graduate': t('eduGraduate'),
  };

  const userEduLabel = educationLabelMap[profile?.education || '10th_pass'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-3 sm:px-6 py-6">
      {/* Personalized Match Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-teal-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full uppercase tracking-wider">
              {t('matchedJobs')}
            </span>
            <span className="bg-teal-700/90 text-teal-100 text-xs font-semibold px-2.5 py-1 rounded-full border border-teal-500/40 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>{userEduLabel}</span>
            </span>
            {profile?.skills && profile.skills.length > 0 && (
              <span className="bg-slate-800 text-teal-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-slate-700">
                {profile.skills.slice(0, 2).join(', ')}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
            {language === 'ta' 
              ? `${profile?.fullName || 'நண்பரே'}, உங்கள் 10-ஆம் வகுப்பு படிப்புக்கு ஏற்ற வேலைகள்!` 
              : `Recommended Jobs for ${profile?.fullName || 'User'} (${userEduLabel})`}
          </h2>
          <p className="text-xs sm:text-sm text-teal-200/90 max-w-2xl leading-relaxed">
            {language === 'ta'
              ? 'உங்கள் கல்வித் தகுதி மற்றும் திறன்களுக்கு ஏற்ப 100% பொருந்தும் தொழிற்சாலை, ஆடை தயாரிப்பு, எலக்ட்ரிக்கல் மற்றும் தொழில்நுட்ப வேலைகள் கீழே பட்டியலிடப்பட்டுள்ளன.'
              : 'Matched directly with top employers in your district offering verified salaries, free training, and immediate joining.'}
          </p>
        </div>

        {/* Action Buttons: Audio Readout & Gemini Skill Hub */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <SpeakButton
            textToSpeak={`${language === 'ta' ? 'உங்களுக்கான பரிந்துரைக்கப்பட்ட வேலைகள்' : 'Recommended jobs'}. ${filteredJobs.length} ${language === 'ta' ? 'வேலைகள் தயாராக உள்ளன' : 'jobs available'}`}
            variant="secondary"
            size="md"
            label={t('listen')}
          />
          <button
            onClick={onOpenSkillHub}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{t('geminiSkillAdvisor')}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ta' ? 'வேலை, நிறுவனம் அல்லது திறன் தேடுங்கள் (எ.கா. தையல், எலக்ட்ரீசியன்)...' : 'Search by job title, skill or company...'}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 font-medium"
          />
        </div>

        {/* Quick Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterCategory === 'all'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {t('filterAll')} ({matchedJobs.length})
          </button>

          <button
            onClick={() => setFilterCategory('10th_pass')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterCategory === '10th_pass'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🎓 {t('filter10thPass')}
          </button>

          <button
            onClick={() => setFilterCategory('training')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterCategory === 'training'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            💡 {t('filterTraining')}
          </button>

          <button
            onClick={() => setFilterCategory('near')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterCategory === 'near'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            📍 {t('filterNearMe')}
          </button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredJobs.map((job) => {
          const applied = isJobApplied(job.id);
          const speechSummary = `${job.title} at ${job.company}. Salary ${job.salary}. Location ${job.location}. ${job.educationLabel}. ${job.matchScore ? job.matchScore + '% Match for your profile' : ''}`;

          return (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col justify-between relative group"
            >
              {/* Card Top */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Match Score Badge */}
                    {job.matchScore && (
                      <span className="bg-teal-50 border border-teal-300 text-teal-900 font-extrabold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <span>{job.matchScore}% Match</span>
                      </span>
                    )}

                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {job.workType}
                    </span>
                  </div>

                  {/* Speaker Button to read this job aloud */}
                  <SpeakButton textToSpeak={speechSummary} size="sm" />
                </div>

                {/* Job Title & Company */}
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-teal-800 transition-colors">
                  {job.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5 mt-1">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{job.company}</span>
                </p>

                {/* Meta details: Salary & Location */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{t('salary')}:</span>
                    <span className="font-extrabold text-teal-900 text-sm">{job.salary}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{t('location')}:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>{job.location} ({job.distanceKm} km)</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{t('educationRequired')}:</span>
                    <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-[11px]">
                      {job.educationLabel}
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {job.badges.map((b, bIdx) => (
                    <span key={bIdx} className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${b.color}`}>
                      {b.text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedJob(job);
                    setIsDetailOpen(true);
                  }}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors text-center cursor-pointer"
                >
                  {t('viewJobDetails')}
                </button>

                <button
                  type="button"
                  onClick={() => handleApply(job)}
                  disabled={applied}
                  className={`py-2.5 px-4 rounded-xl font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    applied
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-teal-700 hover:bg-teal-800 text-white'
                  }`}
                >
                  {applied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('appliedSuccessfully')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('applyNow')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upskilling Callout Box */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-extrabold text-amber-950">
              {language === 'ta' ? 'அதிக சம்பளம் பெற புதிய தொழில் திறன் கற்க வேண்டுமா?' : 'Want to learn new skills for higher salary?'}
            </h4>
            <p className="text-xs text-amber-900 mt-0.5">
              {language === 'ta' ? 'ஜெமினி AI மூலம் இலவச YouTube வீடியோ பாடங்கள் மற்றும் பயிற்சி வினாடி வினாக்களைப் பெறுங்கள்.' : 'Ask Gemini AI for free video tutorials and certified practice quizzes in your language.'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenSkillHub}
          className="px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow transition-all shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{t('geminiSkillAdvisor')}</span>
        </button>
      </div>

      {/* Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onApply={handleApply}
        isApplied={selectedJob ? isJobApplied(selectedJob.id) : false}
      />
    </div>
  );
};
