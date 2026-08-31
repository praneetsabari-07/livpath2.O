import React, { useState } from 'react';
import { ShieldCheck, FileCheck, Upload, CheckCircle2, ArrowRight, Camera, Sparkles, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { SpeakButton } from '../common/SpeakButton';

interface CertificateStepProps {
  onSuccess: () => void;
  onSkip: () => void;
}

export const CertificateStep: React.FC<CertificateStepProps> = ({ onSuccess, onSkip }) => {
  const { t, language } = useLanguage();
  const { profile, verifyCertificate } = useAuth();
  const { speak } = useVoiceAssistant();

  const [selectedCert, setSelectedCert] = useState('10th Marksheet / School TC');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const certOptions = [
    { id: '10th', label: '10th Standard Pass (SSLC) / School TC', icon: '🎓' },
    { id: 'community', label: 'Community Certificate (சாதிச் சான்றிதழ்)', icon: '🏛️' },
    { id: 'iti', label: 'Vocational / ITI / Skill Training Certificate', icon: '🔧' },
    { id: 'aadhaar', label: 'Aadhaar Card / Voter ID', icon: '🪪' },
  ];

  const handleVerify = () => {
    setIsVerifying(true);
    speak(language === 'ta' ? 'சான்றிதழ் சரிபார்க்கப்படுகிறது... காத்திருக்கவும்' : 'Verifying certificate with government portal...');

    setTimeout(() => {
      setIsVerifying(false);
      setIsDone(true);
      verifyCertificate(selectedCert);
      speak(t('certificateVerified'));
      setTimeout(() => {
        onSuccess();
      }, 1400);
    }, 1500);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <SpeakButton textToSpeak={`${t('certificateTitle')}. ${t('certificateSubtitle')}`} label={t('listen')} />
      </div>

      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1">
        {t('certificateTitle')}
      </h2>
      <p className="text-xs sm:text-sm text-slate-600 mb-6">
        {t('certificateSubtitle')}
      </p>

      <div className="space-y-3 mb-6">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {language === 'ta' ? 'சரிபார்க்க வேண்டிய ஆவணம்' : 'Select Document to Verify'}
        </label>

        {certOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelectedCert(opt.label)}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
              selectedCert === opt.label
                ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold ring-2 ring-teal-500/20'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-xs sm:text-sm font-semibold">{opt.label}</span>
            </div>
            {selectedCert === opt.label && <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0" />}
          </button>
        ))}
      </div>

      {/* Simulated Upload / Scan Box */}
      <div className="border-2 border-dashed border-teal-300 bg-teal-50/40 rounded-2xl p-5 text-center mb-6 space-y-2">
        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center mx-auto">
          <Camera className="w-5 h-5" />
        </div>
        <h4 className="text-xs font-bold text-teal-950">
          {language === 'ta' ? 'கேமரா மூலம் புகைப்படம் எடுக்கலாம்' : 'Take photo or upload file'}
        </h4>
        <p className="text-[11px] text-teal-700">
          {selectedCert}
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={handleVerify}
          disabled={isVerifying || isDone}
          className="w-full py-4 bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm rounded-2xl shadow-lg hover:shadow-teal-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {isVerifying ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : isDone ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>{t('certificateVerified')}</span>
            </>
          ) : (
            <>
              <FileCheck className="w-5 h-5" />
              <span>{t('verifyDoc')}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          {t('skipStep')}
        </button>
      </div>
    </div>
  );
};
