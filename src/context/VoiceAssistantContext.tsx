import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AssistantMode, UserProfile } from '../types';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import { parseVoiceTranscriptWithGemini } from '../services/geminiService';

interface VoiceAssistantContextType {
  mode: AssistantMode;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  spokenText: string;
  activeFieldFocus: string | null;
  setActiveFieldFocus: (field: string | null) => void;
  speak: (text: string, langCode?: string) => void;
  stopSpeaking: () => void;
  startListening: (onResultCallback?: (text: string) => void) => void;
  stopListening: () => void;
  readScreenAloud: (title?: string, content?: string) => void;
  triggerVoiceAutoFill: (onComplete?: (extracted: Partial<UserProfile>) => void) => void;
  startConversationalGuide: (step?: number) => void;
  stopConversationalGuide: () => void;
  conversationalStep: number;
  lastFilledData: Partial<UserProfile> | null;
}

const VoiceAssistantContext = createContext<VoiceAssistantContextType | undefined>(undefined);

export const VoiceAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, languageInfo, t } = useLanguage();
  const { profile, updateProfile } = useAuth();

  const [mode, setMode] = useState<AssistantMode>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [spokenText, setSpokenText] = useState('');
  const [activeFieldFocus, setActiveFieldFocus] = useState<string | null>(null);
  const [conversationalStep, setConversationalStep] = useState<number>(0);
  const [lastFilledData, setLastFilledData] = useState<Partial<UserProfile> | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const customCallbackRef = useRef<((text: string) => void) | null>(null);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Text-To-Speech (Speak Aloud)
  const speak = useCallback((text: string, langCode?: string) => {
    if (!text || typeof window === 'undefined') return;

    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel(); // Stop any ongoing speech

        const utterance = new SpeechSynthesisUtterance(text);
        const targetLang = langCode || languageInfo.speechCode || 'ta-IN';
        utterance.lang = targetLang;
        utterance.rate = 0.93; // Slightly slower, clear cadence for accessibility
        utterance.pitch = 1.0;

        // Try selecting native voice if available
        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(v => v.lang.replace('_', '-') === targetLang.replace('_', '-') || v.lang.startsWith(language));
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }

        utterance.onstart = () => {
          setIsSpeaking(true);
          setSpokenText(text);
          setMode('speaking');
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          setSpokenText('');
          setMode('idle');
        };

        utterance.onerror = (e) => {
          console.warn('Speech synthesis notice:', e);
          setIsSpeaking(false);
          setSpokenText('');
          setMode('idle');
        };

        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
      setIsSpeaking(false);
    }
  }, [language, languageInfo]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpokenText('');
      setMode('idle');
    }
  }, []);

  // Stop recognition helper
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
    setMode('idle');
  }, []);

  // Start Speech-To-Text Recognition
  const startListening = useCallback((onResultCallback?: (text: string) => void) => {
    stopSpeaking();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      speak(language === 'ta' ? 'உங்கள் உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை. விவரங்களைத் தட்டச்சு செய்யலாம்.' : 'Speech recognition is not supported in this browser. You can type or tap the buttons.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = languageInfo.speechCode || 'ta-IN';

      customCallbackRef.current = onResultCallback || null;

      recognition.onstart = () => {
        setIsListening(true);
        setMode('listening');
        setTranscript('');
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalStr = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalStr += event.results[i][0].transcript;
          } else {
            currentInterim += event.results[i][0].transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
        }

        if (finalStr) {
          setTranscript(finalStr);
          setInterimTranscript('');
          if (customCallbackRef.current) {
            customCallbackRef.current(finalStr);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event:', event.error);
        setIsListening(false);
        setMode('idle');
      };

      recognition.onend = () => {
        setIsListening(false);
        setMode('idle');
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start error:', e);
      setIsListening(false);
      setMode('idle');
    }
  }, [language, languageInfo, speak, stopSpeaking]);

  // Read whole screen or given text aloud
  const readScreenAloud = useCallback((title?: string, content?: string) => {
    const pageText = title || content 
      ? `${title ? title + '. ' : ''}${content || ''}`
      : `${t('appName')}. ${t('appTagline')}. ${t('personalTitle')}. ${t('personalSubtitle')}`;
    speak(pageText);
  }, [speak, t]);

  // Voice Form Auto-Fill Engine (Speech -> Profile Extractor)
  const triggerVoiceAutoFill = useCallback((onComplete?: (extracted: Partial<UserProfile>) => void) => {
    // 1. Announce prompt
    const promptMessage = language === 'ta' 
      ? 'தயவுசெய்து உங்கள் பெயர், வயது, படித்த படிப்பு, ஊர் மற்றும் தெரிந்த வேலை விவரங்களைச் சொல்லுங்கள். கேட்கிறேன்...'
      : language === 'hi'
      ? 'कृपया अपना नाम, उम्र, शिक्षा, शहर और अपनी कुशलता बताएं। मैं सुन रहा हूं...'
      : 'Please speak your name, age, education, city, and skills. Listening now...';

    speak(promptMessage);

    // 2. Start listening after prompt
    setTimeout(() => {
      startListening(async (spokenText) => {
        setMode('processing');
        // Parse using Gemini server-side or local extractor
        const extracted = await parseVoiceTranscriptWithGemini(spokenText, language);

        if (extracted && Object.keys(extracted).length > 0) {
          updateProfile(extracted);
          setLastFilledData(extracted);

          const successSpeech = language === 'ta'
            ? `நன்றி ${extracted.fullName || ''}! உங்கள் விவரங்கள் தானாக நிரப்பப்பட்டன.`
            : language === 'hi'
            ? `धन्यवाद ${extracted.fullName || ''}! आपका विवरण फॉर्म में भर दिया गया है।`
            : `Thank you ${extracted.fullName || ''}! Your details have been auto-filled.`;

          speak(successSpeech);
          if (onComplete) onComplete(extracted);
        } else {
          speak(t('voiceCouldNotUnderstand'));
        }
        setMode('idle');
      });
    }, 2800);
  }, [language, speak, startListening, updateProfile, t]);

  // Conversational Interactive Voice Guide (Step by Step for Non-literate users)
  const startConversationalGuide = useCallback((step = 1) => {
    setConversationalStep(step);
    setMode('conversational_interview');

    let question = '';
    if (step === 1) {
      question = language === 'ta' ? 'வணக்கம்! உங்கள் முழுப் பெயர் என்ன? தெளிவாகச் சொல்லுங்கள்.' : language === 'hi' ? 'नमस्ते! आपका पूरा नाम क्या है? कृपया बताएं।' : 'Hello! What is your full name? Please speak.';
    } else if (step === 2) {
      question = language === 'ta' ? 'உங்கள் வயது என்ன?' : language === 'hi' ? 'आपकी उम्र कितनी है?' : 'How old are you?';
    } else if (step === 3) {
      question = language === 'ta' ? 'நீங்கள் என்ன படித்துள்ளீர்கள்? உதாரணமாக: பத்தாம் வகுப்பு அல்லது எட்டாம் வகுப்பு.' : language === 'hi' ? 'आपकी पढ़ाई कितनी हुई है? जैसे 10वीं पास या प्राथमिक स्कूल।' : 'What is your education? For example: 10th pass, 12th pass, or primary school.';
    } else if (step === 4) {
      question = language === 'ta' ? 'உங்களுக்கு என்னென்ன வேலைகள் தெரியும்? உதாரணமாக: தையல், எலக்ட்ரீசியன், வெல்டிங், ஓட்டுநர்.' : language === 'hi' ? 'आपको कौन सा काम आता है? जैसे: सिलाई, वेल्डिंग, इलेक्ट्रीशियन, ड्राइविंग।' : 'What skills or work do you know? Like tailoring, welding, electrician, or driving?';
    }

    speak(question);

    setTimeout(() => {
      startListening((ans) => {
        if (step === 1) {
          const cleanName = ans.replace(/(?:my name is|என் பெயர்|मेरा नाम)/i, '').trim();
          updateProfile({ fullName: cleanName || ans });
          speak(language === 'ta' ? `வணக்கம் ${cleanName || ans}!` : `Welcome ${cleanName || ans}!`);
          setTimeout(() => startConversationalGuide(2), 2000);
        } else if (step === 2) {
          const ageNum = ans.match(/\d+/)?.[0] || '24';
          updateProfile({ age: ageNum });
          setTimeout(() => startConversationalGuide(3), 1500);
        } else if (step === 3) {
          let edu: any = '10th_pass';
          if (ans.includes('12') || ans.includes('பன்னிரண்டு') || ans.includes('12वीं')) edu = '12th_pass';
          else if (ans.includes('8') || ans.includes('below') || ans.includes('கீழ்')) edu = 'below_10th';
          else if (ans.includes('iti') || ans.includes('diploma')) edu = 'iti_vocational';
          updateProfile({ education: edu });
          setTimeout(() => startConversationalGuide(4), 1500);
        } else if (step === 4) {
          const skillsFound: string[] = [];
          if (ans.toLowerCase().includes('tailor') || ans.includes('தையல்') || ans.includes('सिलाई')) skillsFound.push('Tailoring', 'Stitching');
          if (ans.toLowerCase().includes('electri') || ans.includes('மின்சாரம்') || ans.includes('बिजली')) skillsFound.push('Electrician', 'House Wiring');
          if (ans.toLowerCase().includes('weld') || ans.includes('வெல்டிங்') || ans.includes('वेल्डिंग')) skillsFound.push('Welding');
          if (ans.toLowerCase().includes('driv') || ans.includes('ஓட்டுநர்') || ans.includes('ड्राइव')) skillsFound.push('Driving', 'Two-wheeler Delivery');
          if (skillsFound.length === 0) skillsFound.push('Tailoring', 'Garment Finishing');

          updateProfile({ skills: skillsFound });
          speak(language === 'ta' ? 'அருமை! உங்கள் சுயவிவரம் முடிந்தது. உங்களுக்கான சிறந்த வேலைகளைத் தேடுகிறோம்.' : 'Great! Your profile is ready. Matching best jobs for you.');
          setConversationalStep(0);
          setMode('idle');
        }
      });
    }, 2500);
  }, [language, speak, startListening, updateProfile]);

  const stopConversationalGuide = useCallback(() => {
    stopSpeaking();
    stopListening();
    setConversationalStep(0);
    setMode('idle');
  }, [stopSpeaking, stopListening]);

  return (
    <VoiceAssistantContext.Provider
      value={{
        mode,
        isListening,
        isSpeaking,
        transcript,
        interimTranscript,
        spokenText,
        activeFieldFocus,
        setActiveFieldFocus,
        speak,
        stopSpeaking,
        startListening,
        stopListening,
        readScreenAloud,
        triggerVoiceAutoFill,
        startConversationalGuide,
        stopConversationalGuide,
        conversationalStep,
        lastFilledData,
      }}
    >
      {children}
    </VoiceAssistantContext.Provider>
  );
};

export const useVoiceAssistant = (): VoiceAssistantContextType => {
  const context = useContext(VoiceAssistantContext);
  if (!context) {
    throw new Error('useVoiceAssistant must be used within a VoiceAssistantProvider');
  }
  return context;
};
