import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { useLanguage } from '../../context/LanguageContext';
import { GeminiSkillHubModal } from '../gemini/GeminiSkillHubModal';

/**
 * Shared chrome for the top navigation bar.
 *
 * Both the onboarding Header and the main-experience MainNavigation render
 * inside this shell so the two experiences share one premium, glassy identity:
 * a translucent blurred bar, a soft depth shadow (no hard grey edge) and a
 * faint teal accent hairline along the bottom.
 */
export default function NavShell({ children }) {
  return (
    <nav className="fixed top-0 inset-x-0 z-50">
      {/* Glass background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/85 to-white/60 backdrop-blur-xl border-b border-primary-container/10 shadow-[0_10px_30px_-18px_rgba(18,53,91,0.35)]" />
      {/* Teal accent hairline */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-secondary/45 to-transparent" />

      <div className="relative mx-auto flex h-16 max-w-container-max items-center justify-between gap-3 px-margin-mobile md:px-margin-desktop">
        {children}
      </div>
    </nav>
  );
}

/**
 * The LivPath AI wordmark + journey mark. Renders as a plain element by
 * default, or as a router Link when `to` is provided.
 */
export function NavBrand({ to }) {
  const inner = (
    <>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-container to-secondary text-white shadow-lg shadow-primary-container/25">
        <span className="material-symbols-outlined text-[20px]">route</span>
      </span>
      <span className="hidden text-headline-md font-headline-md font-extrabold tracking-tight text-primary-container sm:inline">
        LivPath AI
      </span>
    </>
  );

  const className = 'flex shrink-0 items-center gap-2.5';
  return to ? (
    <Link to={to} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

/** Premium pill button used for the "Voice Help" affordance. */
export function VoiceHelpButton() {
  const { isSpeaking, isListening, readScreenAloud, stopSpeaking, stopListening } = useVoiceAssistant();

  const handleClick = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (isListening) {
      stopListening();
    } else {
      readScreenAloud();
    }
  };

  return (
    <button
      onClick={handleClick}
      title="Tap to read screen aloud"
      className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-label-md font-label-md text-white shadow-md transition-all hover:-translate-y-px hover:shadow-lg md:px-5 ${
        isSpeaking
          ? 'bg-amber-600 shadow-amber-600/30 animate-pulse'
          : isListening
          ? 'bg-red-600 shadow-red-600/30 animate-pulse'
          : 'bg-primary-container shadow-primary-container/25 hover:bg-primary-container/90'
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">
        {isSpeaking ? 'volume_up' : isListening ? 'mic' : 'campaign'}
      </span>
      <span className="hidden sm:inline">
        {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Voice Help'}
      </span>
    </button>
  );
}

/** Gemini AI YouTube Learning & Skill Video Suggestion Button */
export function GeminiSkillButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { language } = useLanguage();

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        title="AI YouTube Learning & Skill Videos"
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-container via-blue-700 to-sky-600 px-3.5 py-2 text-label-md font-label-md text-white shadow-md shadow-blue-900/25 border border-sky-300/30 transition-all hover:-translate-y-px hover:shadow-lg hover:from-primary hover:via-blue-800 hover:to-sky-700"
      >
        <span className="material-symbols-outlined text-[19px] text-sky-200">smart_display</span>
        <span className="hidden md:inline font-bold text-sky-50">
          {language === 'ta' ? 'AI வீடியோ' : language === 'hi' ? 'AI वीडियो' : 'AI Video Hub'}
        </span>
      </button>

      <GeminiSkillHubModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
