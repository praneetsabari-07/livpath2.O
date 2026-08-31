import React, { useState, useRef, useEffect } from 'react';
import { Globe, Sparkles, Volume2, Bot, Briefcase, FileCheck, User, ChevronDown, Check, GraduationCap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { GeminiSkillHubModal } from '../gemini/GeminiSkillHubModal';
import { SupportedLanguage } from '../../types';

interface HeaderProps {
  currentTab: 'onboarding' | 'jobs' | 'applications' | 'profile';
  onNavigateTab: (tab: 'jobs' | 'applications' | 'profile') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onNavigateTab }) => {
  const { language, languageInfo, setLanguage, allLanguages, t } = useLanguage();
  const { speak, readScreenAloud } = useVoiceAssistant();

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isSkillAdvisorOpen, setIsSkillAdvisorOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectLanguage = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsLangMenuOpen(false);
    // Announce in that language
    if (code === 'ta') speak('மொழி தமிழுக்கு மாற்றப்பட்டது', 'ta-IN');
    else if (code === 'hi') speak('भाषा बदलकर हिंदी कर दी गई है', 'hi-IN');
    else if (code === 'te') speak('భాష తెలుగులోకి మార్చబడింది', 'te-IN');
    else if (code === 'kn') speak('ಭಾಷೆ ಬದಲಾಗಿದೆ', 'kn-IN');
    else if (code === 'ml') speak('ഭാഷ മലയാളത്തിലേക്ക് മാറ്റി', 'ml-IN');
    else speak('Language updated successfully', 'en-IN');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Left: Brand Logo & Title */}
          <div 
            onClick={() => onNavigateTab('jobs')}
            className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg group-hover:scale-105 transition-transform">
              LP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">LivPath AI</span>
                <span className="bg-teal-500/20 border border-teal-400/40 text-teal-300 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
                  India
                </span>
              </div>
              <p className="text-[11px] text-teal-300/80 hidden sm:block leading-tight font-medium">
                {t('appName')}
              </p>
            </div>
          </div>

          {/* Center: Main Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-2xl border border-slate-700">
            <button
              onClick={() => onNavigateTab('jobs')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'jobs'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>{t('navJobs')}</span>
            </button>

            <button
              onClick={() => onNavigateTab('applications')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'applications'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{t('navApplications')}</span>
            </button>

            <button
              onClick={() => onNavigateTab('profile')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentTab === 'profile'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('navProfile')}</span>
            </button>
          </nav>

          {/* Right Action Tools: Language Dropdown & TOP-RIGHT GEMINI SKILL & VIDEO HUB */}
          <div className="flex items-center gap-2">
            {/* Top Right: GEMINI AI SKILL & YOUTUBE VIDEO HUB (Replaces voice help as requested!) */}
            <button
              onClick={() => setIsSkillAdvisorOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-md hover:shadow-amber-500/25 transition-all cursor-pointer group"
              title={t('geminiSkillAdvisorDesc')}
            >
              <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
              <span className="hidden sm:inline">{t('geminiSkillAdvisor')}</span>
              <span className="sm:hidden">AI Hub</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
            </button>

            {/* Read Screen Aloud Button */}
            <button
              onClick={() => readScreenAloud()}
              title={t('speakPage')}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold border border-slate-700"
            >
              <Volume2 className="w-3.5 h-3.5 text-teal-400" />
              <span>{t('listen')}</span>
            </button>

            {/* Persistent Indian Languages Switcher */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(prev => !prev)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all"
                aria-expanded={isLangMenuOpen}
              >
                <Globe className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span className="font-extrabold text-teal-300">{languageInfo.nativeName}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Language Dropdown Menu (All 10 Indian Languages) */}
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 md:w-72 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-scale-up max-h-96 overflow-y-auto">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      {t('selectLanguage')} (Indian Languages)
                    </span>
                  </div>

                  <div className="space-y-1">
                    {allLanguages.map((l) => {
                      const isSelected = l.code === language;
                      return (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => handleSelectLanguage(l.code)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                            isSelected
                              ? 'bg-teal-50 text-teal-950 font-bold border border-teal-200'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{l.flag}</span>
                            <div>
                              <span className="font-bold text-sm block leading-tight">{l.nativeName}</span>
                              <span className="text-[10px] text-slate-500">{l.name} • {l.regionName}</span>
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-teal-700 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur px-2 py-1.5 flex items-center justify-around">
          <button
            onClick={() => onNavigateTab('jobs')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-[11px] font-bold ${
              currentTab === 'jobs' ? 'text-teal-400' : 'text-slate-400'
            }`}
          >
            <Briefcase className="w-4 h-4 mb-0.5" />
            <span>{t('navJobs')}</span>
          </button>
          <button
            onClick={() => onNavigateTab('applications')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-[11px] font-bold ${
              currentTab === 'applications' ? 'text-teal-400' : 'text-slate-400'
            }`}
          >
            <FileCheck className="w-4 h-4 mb-0.5" />
            <span>{t('navApplications')}</span>
          </button>
          <button
            onClick={() => onNavigateTab('profile')}
            className={`flex flex-col items-center py-1 px-3 rounded-lg text-[11px] font-bold ${
              currentTab === 'profile' ? 'text-teal-400' : 'text-slate-400'
            }`}
          >
            <User className="w-4 h-4 mb-0.5" />
            <span>{t('navProfile')}</span>
          </button>
        </div>
      </header>

      {/* Gemini AI Skill & YouTube Video Modal */}
      <GeminiSkillHubModal
        isOpen={isSkillAdvisorOpen}
        onClose={() => setIsSkillAdvisorOpen(false)}
      />
    </>
  );
};
