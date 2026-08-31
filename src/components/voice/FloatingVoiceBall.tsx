import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Bot,
  User,
  X,
  ChevronDown,
  Minimize2,
  Maximize2,
  RotateCcw,
  CheckCircle,
  Briefcase,
  PlayCircle,
  HelpCircle,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { ChatMessage } from '../../types';
import { sendAssistantChatMessage, parseVoiceTranscriptWithGemini } from '../../services/geminiService';

export const FloatingVoiceBall: React.FC = () => {
  const {
    mode,
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    spokenText,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    readScreenAloud,
  } = useVoiceAssistant();

  const { t, language } = useLanguage();
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [autoSpeakReplies, setAutoSpeakReplies] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message based on language
  useEffect(() => {
    if (messages.length === 0) {
      const isTa = language === 'ta';
      const isHi = language === 'hi';
      const userName = profile?.fullName || '';
      const initialText = isTa
        ? `வணக்கம் ${userName}! நான் LivPath AI உதவியாளர். உங்களுக்கு பொருத்தமான வேலைகளைத் தேடவா, விவரங்களை நிரப்பவா அல்லது வழிகாட்டவா? பேசலாம் அல்லது எழுதலாம்.`
        : isHi
        ? `नमस्ते ${userName}! मैं आपका LivPath AI सहायक हूँ। मैं आपको उपयुक्त नौकरी खोजने और फॉर्म भरने में मदद कर सकता हूँ।`
        : `Hello ${userName}! I am your LivPath AI career assistant. Ask me to find jobs, fill your profile by voice, or guide you through applications!`;

      setMessages([
        {
          id: 'welcome-msg',
          sender: 'assistant',
          text: initialText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [language, profile?.fullName, messages.length]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, interimTranscript]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsAiLoading(true);

    try {
      // 1. Check if user provided profile details to auto-fill
      if (
        query.toLowerCase().includes('name') ||
        query.toLowerCase().includes('பெயர்') ||
        query.toLowerCase().includes('age') ||
        query.toLowerCase().includes('வயது') ||
        query.toLowerCase().includes('tailor') ||
        query.toLowerCase().includes('தையல்')
      ) {
        const extracted = await parseVoiceTranscriptWithGemini(query, language);
        if (extracted && Object.keys(extracted).length > 0) {
          updateProfile(extracted);
        }
      }

      // 2. Call server-side Gemini Chat Assistant
      const response = await sendAssistantChatMessage(
        query,
        [...messages, userMsg],
        language,
        profile,
        location.pathname
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: response.action,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Handle TTS spoken response
      if (autoSpeakReplies && (response.speechText || response.reply)) {
        speak(response.speechText || response.reply);
      }

      // If action is navigate, handle navigation
      if (response.action?.type === 'navigate' && response.action?.data?.path) {
        navigate(response.action.data.path);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'ta'
            ? 'நான் உங்கள் குரலைக் கேட்டேன். வேலைகள் பக்கத்தில் பல புதிய வாய்ப்புகள் உள்ளன.'
            : 'I got your request. You can browse all verified job roles in the Jobs section.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
    }

    startListening((recognizedText) => {
      if (recognizedText && recognizedText.trim().length > 0) {
        handleSendMessage(recognizedText);
      }
    });
  };

  const handleQuickChip = (chipQuery: string) => {
    if (!isOpen) setIsOpen(true);
    handleSendMessage(chipQuery);
  };

  return (
    <aside aria-label="AI Voice & Chat Assistant" className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-auto">
      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div className="mb-3 w-[92vw] max-w-sm sm:max-w-md h-[32rem] max-h-[82vh] bg-white/95 backdrop-blur-2xl border border-primary-container/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up z-50">
          {/* Drawer Header */}
          <div className="bg-gradient-to-r from-primary-container to-blue-800 text-white p-3.5 px-4 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-white/15 border border-white/20 text-white shadow-inner">
                <Bot className="w-5 h-5 text-sky-300" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-primary-container"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  LivPath AI Assistant
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-sky-400/20 text-sky-200 border border-sky-300/30">
                    {language.toUpperCase()}
                  </span>
                </h3>
                <p className="text-[11px] text-sky-100 font-medium">
                  {isListening
                    ? '🎙️ Listening to your voice...'
                    : isSpeaking
                    ? '🔊 Reading answer aloud...'
                    : isAiLoading
                    ? '✨ Thinking...'
                    : 'Voice & Text Active'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setAutoSpeakReplies((v) => !v)}
                title={autoSpeakReplies ? 'Mute AI Voice' : 'Enable AI Voice'}
                className={`p-1.5 rounded-xl transition-all ${
                  autoSpeakReplies ? 'bg-white/20 text-sky-200' : 'bg-white/10 text-white/50'
                }`}
              >
                {autoSpeakReplies ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  stopListening();
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Action Chips Bar */}
          <div className="bg-slate-50/90 border-b border-slate-100 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => handleQuickChip(language === 'ta' ? 'சேலத்தில் தையல் வேலைகள்' : 'Find Tailoring jobs in Salem')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 rounded-full border border-slate-200 shadow-2xs whitespace-nowrap transition-colors"
            >
              ✂️ {language === 'ta' ? 'தையல் வேலைகள்' : 'Tailoring Jobs'}
            </button>
            <button
              onClick={() => handleQuickChip(language === 'ta' ? 'எலக்ட்ரீசியன் வேலைகள்' : 'Electrician jobs near me')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 rounded-full border border-slate-200 shadow-2xs whitespace-nowrap transition-colors"
            >
              ⚡ {language === 'ta' ? 'எலக்ட்ரீசியன்' : 'Electrician'}
            </button>
            <button
              onClick={() => handleQuickChip(language === 'ta' ? 'என் விவரங்களை பதிவு செய்' : 'Fill my profile with voice')}
              className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 rounded-full border border-slate-200 shadow-2xs whitespace-nowrap transition-colors"
            >
              🎙️ {language === 'ta' ? 'குரல் பதிவு' : 'Voice Autofill'}
            </button>
            <button
              onClick={() => readScreenAloud()}
              className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-full border border-amber-200 shadow-2xs whitespace-nowrap transition-colors"
            >
              📢 {language === 'ta' ? 'திரையை வாசி' : 'Read Screen'}
            </button>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary-container to-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs text-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-primary-container text-white rounded-tr-xs'
                      : 'bg-slate-100 text-slate-900 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Action Link Button if present */}
                  {msg.action && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                      {msg.action.type === 'navigate' && (
                        <button
                          onClick={() => {
                            if (msg.action?.data?.path) navigate(msg.action.data.path);
                          }}
                          className="flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900 bg-sky-100/80 hover:bg-sky-200/80 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{language === 'ta' ? 'வேலைகளைப் பார்க்க' : 'Open Jobs'}</span>
                        </button>
                      )}

                      {msg.action.type === 'profile_updated' && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          <CheckCircle className="w-3 h-3" />
                          <span>{language === 'ta' ? 'விவரங்கள் சேமிக்கப்பட்டன' : 'Profile Updated'}</span>
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-1 flex items-center justify-between text-[10px] opacity-70">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <button
                        onClick={() => speak(msg.text)}
                        title="Read aloud"
                        className="hover:opacity-100 p-0.5"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 shadow-xs text-xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Live speech feedback transcript */}
            {isListening && (
              <div className="flex gap-2.5 justify-start animate-fade-in">
                <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="bg-red-50 text-red-900 border border-red-200 rounded-2xl rounded-tl-xs p-3 text-xs sm:text-sm max-w-[85%]">
                  <div className="flex items-center gap-1.5 font-bold text-red-700 text-xs mb-1">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                    <span>{language === 'ta' ? 'குரல் கேட்கிறது...' : 'Listening to you...'}</span>
                  </div>
                  <p className="italic text-slate-800">
                    {interimTranscript || transcript || (language === 'ta' ? 'பேசுங்கள்...' : 'Speak now...')}
                  </p>
                </div>
              </div>
            )}

            {isAiLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-primary-container text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-100 text-slate-600 rounded-2xl p-2.5 text-xs flex items-center gap-2 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {language === 'ta' ? 'பதிலளிக்கிறது...' : 'Generating response...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center gap-2 shrink-0">
            <button
              onClick={handleVoiceInput}
              title={isListening ? 'Stop recording' : 'Speak with AI'}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-red-500/40 ring-4 ring-red-300'
                  : 'bg-primary-container hover:bg-primary text-white'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex-1 flex items-center gap-1.5 bg-white border border-slate-300 rounded-2xl px-3 py-1.5 focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary-container/20 shadow-inner"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  language === 'ta'
                    ? 'கேளுங்கள் அல்லது பேசவும்...'
                    : language === 'hi'
                    ? 'पूछें या बोलें...'
                    : 'Type or tap mic to talk...'
                }
                className="flex-1 bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isAiLoading}
                className="w-7 h-7 rounded-xl bg-primary-container disabled:bg-slate-200 text-white disabled:text-slate-400 flex items-center justify-center transition-colors shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating 3D AI Orb Ball Trigger Button */}
      <button
        onClick={() => {
          if (isSpeaking) {
            stopSpeaking();
          } else if (isListening) {
            stopListening();
          } else {
            setIsOpen((prev) => !prev);
          }
        }}
        aria-label="Open AI Assistant Chat and Voice"
        className="relative group focus:outline-none"
      >
        {/* Glow halo */}
        <div
          className={`absolute -inset-1.5 rounded-full blur-md opacity-70 transition-all duration-500 group-hover:opacity-100 ${
            isListening
              ? 'bg-red-500 animate-pulse'
              : isSpeaking
              ? 'bg-amber-400 animate-pulse'
              : 'bg-gradient-to-tr from-sky-400 via-primary-container to-blue-600 animate-tilt'
          }`}
        />

        {/* Core AI Sphere Ball */}
        <div
          className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white shadow-[0_10px_25px_-5px_rgba(18,53,91,0.5)] transition-all duration-300 group-hover:scale-105 ${
            isListening
              ? 'bg-gradient-to-tr from-red-600 to-rose-500 ring-4 ring-red-300 animate-pulse'
              : isSpeaking
              ? 'bg-gradient-to-tr from-amber-600 to-yellow-500 ring-4 ring-amber-300 animate-pulse'
              : 'bg-gradient-to-tr from-primary-container via-blue-800 to-sky-600 border border-white/30'
          }`}
        >
          {isListening ? (
            <Mic className="w-7 h-7 text-white animate-bounce" />
          ) : isSpeaking ? (
            <Volume2 className="w-7 h-7 text-white animate-bounce" />
          ) : isOpen ? (
            <X className="w-7 h-7 text-white" />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Bot className="w-7 h-7 text-sky-200 drop-shadow-sm" />
              <span className="text-[9px] font-bold tracking-wider text-sky-100 uppercase">AI</span>
            </div>
          )}

          {/* Active notification badge */}
          {!isOpen && (
            <span className="absolute top-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500 border-2 border-white items-center justify-center text-[8px] font-black text-white">
                ✓
              </span>
            </span>
          )}
        </div>

        {/* Hover Label */}
        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 hidden sm:group-hover:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-semibold whitespace-nowrap shadow-lg backdrop-blur-sm pointer-events-none transition-all">
          <Sparkles className="w-3.5 h-3.5 text-sky-300" />
          <span>{language === 'ta' ? 'AI உதவி & குரல் சாட்' : 'AI Voice & Chat'}</span>
        </div>
      </button>
    </aside>
  );
};
