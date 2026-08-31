import React from 'react';
import { Volume2, VolumeX, Mic } from 'lucide-react';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { useLanguage } from '../../context/LanguageContext';

interface SpeakButtonProps {
  textToSpeak: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'primary' | 'secondary' | 'subtle' | 'pill';
}

export const SpeakButton: React.FC<SpeakButtonProps> = ({
  textToSpeak,
  label,
  size = 'md',
  className = '',
  variant = 'subtle',
}) => {
  const { speak, isSpeaking, spokenText, stopSpeaking } = useVoiceAssistant();
  const { t } = useLanguage();

  const isCurrentSpeaking = isSpeaking && spokenText === textToSpeak;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentSpeaking) {
      stopSpeaking();
    } else {
      speak(textToSpeak);
    }
  };

  const sizeClasses = {
    sm: 'p-1 text-xs gap-1',
    md: 'px-2.5 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  }[size];

  const variantClasses = {
    primary: isCurrentSpeaking 
      ? 'bg-amber-500 text-white shadow-md ring-2 ring-amber-300 animate-pulse'
      : 'bg-teal-700 text-white hover:bg-teal-800 shadow-sm',
    secondary: isCurrentSpeaking
      ? 'bg-amber-500 text-white ring-2 ring-amber-300 animate-pulse'
      : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300',
    subtle: isCurrentSpeaking
      ? 'bg-teal-100 text-teal-900 border border-teal-400 font-semibold animate-pulse'
      : 'bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-200',
    pill: isCurrentSpeaking
      ? 'bg-teal-700 text-white shadow-md animate-pulse'
      : 'bg-white hover:bg-teal-50 text-teal-800 border border-teal-300 shadow-xs'
  }[variant];

  return (
    <button
      type="button"
      onClick={handleClick}
      title={isCurrentSpeaking ? t('stopListening') : t('listen')}
      aria-label={label || t('listen')}
      className={`inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer ${sizeClasses} ${variantClasses} ${className}`}
    >
      {isCurrentSpeaking ? (
        <>
          <VolumeX className="w-4 h-4 text-white animate-bounce" />
          <span className="text-xs font-semibold">{label || t('stopListening')}</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-teal-700 shrink-0" />
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
};
