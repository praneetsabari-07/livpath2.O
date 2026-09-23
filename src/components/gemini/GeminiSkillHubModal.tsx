import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Mic,
  MicOff,
  Send,
  Play,
  Youtube,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  RotateCcw,
  Volume2,
  X,
  ExternalLink,
  GraduationCap,
  ChevronRight,
  Link2,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../../context/LanguageContext';
import { useVoiceAssistant } from '../../context/VoiceAssistantContext';
import { fetchSkillAdvisor, generateQuizFromVideo } from '../../services/geminiService';
import { SkillAdvisorResult, SkillVideo, QuizQuestion } from '../../types';
import { SpeakButton } from '../common/SpeakButton';

interface GeminiSkillHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const GeminiSkillHubModal: React.FC<GeminiSkillHubModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
}) => {
  const { t, language } = useLanguage();
  const { speak, startListening, isListening, stopListening } = useVoiceAssistant();

  const [searchQuery, setSearchQuery] = useState(
    initialQuery || (language === 'ta' ? 'தையல் மற்றும் பிளவுஸ் தைப்பது' : 'Tailoring & Garment Stitching')
  );
  const [loading, setLoading] = useState(false);
  const [advisorData, setAdvisorData] = useState<SkillAdvisorResult | null>(null);

  // Active video player state
  const [activeVideo, setActiveVideo] = useState<SkillVideo | null>(null);

  // Custom YouTube video input
  const [customYoutubeUrl, setCustomYoutubeUrl] = useState('');
  const [isGeneratingVideoQuiz, setIsGeneratingVideoQuiz] = useState(false);
  const quizSectionRef = useRef<HTMLDivElement>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const popularTopics = [
    {
      label: language === 'ta' ? 'தையல் & பிளவுஸ்' : language === 'hi' ? 'सिलाई और कटिंग' : 'Tailoring & Stitching',
      query: 'Tailoring and blouse stitching',
    },
    {
      label: language === 'ta' ? 'இணையதள வடிவமைப்பு' : language === 'hi' ? 'वेबसाइट डिजाइन' : 'Website Design & Development',
      query: 'Website design and development',
    },
    {
      label: language === 'ta' ? 'எலக்ட்ரீசியன் வயரிங்' : language === 'hi' ? 'इलेक्ट्रीशियन हाउस वायरिंग' : 'House Electrician & Wiring',
      query: 'House wiring and electrician',
    },
    {
      label: language === 'ta' ? 'வெல்டிங் பயிற்சி' : language === 'hi' ? 'वेल्डिंग कार्य' : 'Arc & MIG Welding',
      query: 'Welding basics and fabrication',
    },
    {
      label: language === 'ta' ? 'டூ-வீலர் மெக்கானிக்' : language === 'hi' ? 'बाइक रिपेयरिंग' : 'Two-Wheeler Mechanic',
      query: 'Two wheeler bike repair',
    },
    {
      label: language === 'ta' ? 'சமையல் & கேட்டரிங்' : language === 'hi' ? 'कुकिंग व कैटरिंग' : 'Cooking & Catering',
      query: 'Cooking and catering recipes',
    },
  ];

  const handleSearch = async (queryToSearch?: string) => {
    const q = queryToSearch || searchQuery;
    if (!q.trim()) return;

    setLoading(true);
    setIsQuizSubmitted(false);
    setQuizAnswers({});
    setActiveVideo(null);

    try {
      const result = await fetchSkillAdvisor(q, language);
      setAdvisorData(result);
      if (result.videos && result.videos.length > 0) {
        setActiveVideo(result.videos[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleSearch(initialQuery || searchQuery);
    }
  }, [isOpen, language]);

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((text) => {
        setSearchQuery(text);
        handleSearch(text);
      });
    }
  };

  // Helper to extract YouTube video ID from any link format
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    );
    return match ? match[1] : null;
  };

  // Generate AI Quiz tailored to the active video
  const handleGenerateQuizFromActiveVideo = async (videoToUse?: SkillVideo) => {
    const targetVideo = videoToUse || activeVideo;
    if (!targetVideo) return;

    setIsGeneratingVideoQuiz(true);
    const speechPrompt =
      language === 'ta'
        ? 'வீடியோவிலிருந்து AI வினாடி வினா உருவாக்கப்படுகிறது...'
        : 'Generating AI quiz questions directly from this video...';
    speak(speechPrompt);

    try {
      const generatedQuestions = await generateQuizFromVideo(
        targetVideo.title,
        targetVideo.youtubeUrl,
        searchQuery,
        language
      );

      if (generatedQuestions && generatedQuestions.length > 0) {
        setAdvisorData((prev) => (prev ? { ...prev, quiz: generatedQuestions } : null));
        setQuizAnswers({});
        setIsQuizSubmitted(false);
        setQuizScore(0);

        const readyMsg =
          language === 'ta'
            ? 'வினாடி வினா தயார்! பதில்களைத் தேர்வு செய்யுங்கள்.'
            : 'AI Quiz ready! Test your knowledge below.';
        speak(readyMsg);

        setTimeout(() => {
          quizSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 250);
      }
    } catch (err) {
      console.error('Failed to generate quiz from video:', err);
    } finally {
      setIsGeneratingVideoQuiz(false);
    }
  };

  // Load custom YouTube link pasted by the user
  const handleLoadCustomYoutubeVideo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const ytId = extractYouTubeId(customYoutubeUrl.trim());
    if (!ytId) {
      const invalidMsg =
        language === 'ta' ? 'சரியான YouTube லிங்க் உள்ளிடவும்' : 'Please enter a valid YouTube video link';
      speak(invalidMsg);
      return;
    }

    const newVideo: SkillVideo = {
      id: `custom-${Date.now()}`,
      title:
        language === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட YouTube வீடியோ பாடம்' : 'Selected YouTube Skill Video',
      channelName: 'YouTube Creator',
      duration: 'Tutorial',
      youtubeUrl: `https://www.youtube.com/watch?v=${ytId}`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      difficulty: 'Beginner',
      summary:
        language === 'ta'
          ? 'நேரடி YouTube வீடியோவிலிருந்து AI வினாடி வினா.'
          : 'Practical learning from YouTube video with AI quiz.',
      keySkillsTaught: ['Core Practical Skill', 'Hands-on Practice'],
    };

    setActiveVideo(newVideo);
    setAdvisorData((prev) => {
      if (!prev) {
        return {
          query: 'Custom YouTube Video',
          topicTitle: newVideo.title,
          language,
          overview: newVideo.summary,
          videos: [newVideo],
          quiz: [],
          relatedJobs: ['Technician', 'Trainee'],
          recommendedCertification: 'PMKVY Certificate',
        };
      }
      return {
        ...prev,
        videos: [newVideo, ...prev.videos.filter((v) => v.id !== newVideo.id)],
      };
    });

    setCustomYoutubeUrl('');
    await handleGenerateQuizFromActiveVideo(newVideo);
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (isQuizSubmitted) return;
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!advisorData?.quiz) return;

    let score = 0;
    advisorData.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });

    setQuizScore(score);
    setIsQuizSubmitted(true);

    if (score >= Math.ceil(advisorData.quiz.length * 0.6)) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      speak(
        language === 'ta'
          ? `அருமை! நீங்கள் ${advisorData.quiz.length}-க்கு ${score} மதிப்பெண்கள் பெற்று தேர்ச்சி அடைந்துவிட்டீர்கள்!`
          : `Great job! You scored ${score} out of ${advisorData.quiz.length} and passed the skill quiz!`
      );
    } else {
      speak(
        language === 'ta'
          ? `தொடர்ந்து கற்றுக்கொள்ளுங்கள்! மீண்டும் வீடியோக்களைப் பார்த்து முயற்சிக்கவும்.`
          : `Keep learning! Watch the tutorials again and re-take the quiz.`
      );
    }
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers({});
    setIsQuizSubmitted(false);
    setQuizScore(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-teal-100 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-4 md:p-6 flex items-center justify-between border-b border-teal-700/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg md:text-xl font-bold tracking-tight">
                  {language === 'ta' ? 'ஜெமினி AI YouTube கற்றல் & வினாடி வினா' : 'Gemini AI YouTube Learning & Quiz Hub'}
                </h3>
                <span className="bg-teal-700/80 text-teal-200 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border border-teal-500/40">
                  Gemini 3.7 AI
                </span>
              </div>
              <p className="text-xs text-teal-200">
                {language === 'ta'
                  ? 'YouTube வீடியோ பரிந்துரைகள் மற்றும் நேரடி AI வினாடி வினா பயிற்சி'
                  : 'Recommended YouTube videos with AI-based quiz generation'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-teal-200 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* Search / Voice Bar */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={
                    language === 'ta'
                      ? 'கற்க விரும்பும் தொழிலைத் தட்டச்சு செய்யுங்கள் (எ.கா: தையல், எலக்ட்ரீசியன்)...'
                      : 'Search skill to learn (e.g. Tailoring, Electrician, Driving)...'
                  }
                  className="w-full pl-4 pr-12 py-3 bg-white rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-sm text-slate-900 placeholder:text-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  title="Speak your topic"
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={loading}
                className="px-5 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {language === 'ta' ? 'தேடு' : 'Search'}
                </span>
              </button>
            </div>

            {/* Paste Custom YouTube URL Option */}
            <form onSubmit={handleLoadCustomYoutubeVideo} className="flex items-center gap-2 pt-1 border-t border-slate-200/80">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600">
                  <Youtube className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={customYoutubeUrl}
                  onChange={(e) => setCustomYoutubeUrl(e.target.value)}
                  placeholder={
                    language === 'ta'
                      ? 'அல்லது ஏதேனும் YouTube வீடியோ லிங்கை ஒட்டவும் (URL)...'
                      : 'Or paste any YouTube video link to learn and generate AI quiz...'
                  }
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-lg border border-slate-300 focus:border-red-500 focus:ring-1 focus:ring-red-400 text-xs text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={!customYoutubeUrl.trim() || isGeneratingVideoQuiz}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'AI வினாடி வினா உருவாக்கு' : 'Generate Quiz'}</span>
              </button>
            </form>

            {/* Quick Topic Chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 mr-1">
                {language === 'ta' ? 'முக்கிய தலைப்புகள்:' : 'Popular:'}
              </span>
              {popularTopics.map((pt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(pt.query);
                    handleSearch(pt.query);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 hover:border-teal-300 font-medium transition-all cursor-pointer"
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-700 animate-spin"></div>
              <p className="text-sm font-semibold text-slate-700">
                {language === 'ta'
                  ? 'ஜெமினி AI உங்களுக்கான சிறந்த YouTube வீடியோ மற்றும் வினாடி வினாவை உருவாக்குகிறது...'
                  : 'Gemini AI is finding top video lessons and generating your skill quiz...'}
              </p>
            </div>
          )}

          {/* Results Display */}
          {!loading && advisorData && (
            <div className="space-y-6">
              {/* Topic Overview Card with Speech Readout */}
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50/50 p-4 md:p-5 rounded-2xl border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-teal-700" />
                    <h4 className="text-base font-bold text-teal-950">{advisorData.topicTitle}</h4>
                  </div>
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                    {advisorData.overview}
                  </p>
                </div>
                <SpeakButton
                  textToSpeak={`${advisorData.topicTitle}. ${advisorData.overview}`}
                  size="md"
                  variant="primary"
                  label={language === 'ta' ? 'கேட்க' : 'Listen'}
                />
              </div>

              {/* Video Player & Tutorials Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-red-600" />
                    <h4 className="text-sm font-bold text-slate-900">
                      {language === 'ta' ? 'பரிந்துரைக்கப்பட்ட YouTube வீடியோக்கள்' : 'Recommended YouTube Tutorials'}
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {advisorData.videos.length} {language === 'ta' ? 'வீடியோ பாடங்கள்' : 'tutorials'}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Active Video Player / Embed */}
                  {activeVideo && (
                    <div className="lg:col-span-2 bg-slate-950 rounded-2xl overflow-hidden shadow-md flex flex-col">
                      <div className="relative aspect-video w-full bg-slate-900">
                        <iframe
                          src={activeVideo.embedUrl}
                          title={activeVideo.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        ></iframe>
                      </div>

                      <div className="p-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs sm:text-sm font-bold text-white mb-1 line-clamp-2">
                            {activeVideo.title}
                          </h5>
                          <div className="flex items-center gap-3 text-xs text-slate-300">
                            <span>{activeVideo.channelName}</span>
                            <span>•</span>
                            <span>{activeVideo.duration}</span>
                            <span>•</span>
                            <span className="bg-teal-800 text-teal-200 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                              {activeVideo.difficulty}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* AI-BASED QUIZ GENERATION FROM THIS VIDEO BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleGenerateQuizFromActiveVideo()}
                            disabled={isGeneratingVideoQuiz}
                            className="px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow transition-all cursor-pointer disabled:opacity-60"
                            title="Generate Quiz from this Video"
                          >
                            {isGeneratingVideoQuiz ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                            )}
                            <span>
                              {isGeneratingVideoQuiz
                                ? language === 'ta'
                                  ? 'உருவாகிறது...'
                                  : 'Generating Quiz...'
                                : language === 'ta'
                                ? 'இந்த வீடியோவிற்கான AI வினாடி வினா'
                                : 'AI Quiz from this Video'}
                            </span>
                          </button>

                          <a
                            href={activeVideo.youtubeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <span>YouTube</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Video List Column */}
                  <div className="space-y-2.5">
                    {advisorData.videos.map((vid) => (
                      <div
                        key={vid.id}
                        onClick={() => {
                          setActiveVideo(vid);
                          handleGenerateQuizFromActiveVideo(vid);
                        }}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex gap-3 ${
                          activeVideo?.id === vid.id
                            ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20'
                            : 'bg-white hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-slate-200">
                          <img
                            src={vid.thumbnailUrl}
                            alt={vid.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h6 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                            {vid.title}
                          </h6>
                          <p className="text-[11px] text-slate-500 mt-1">{vid.channelName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-teal-800 font-semibold bg-teal-100 px-1.5 py-0.5 rounded">
                              {vid.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Skill Training Quiz Generated from Video */}
              <div ref={quizSectionRef}>
                {advisorData.quiz && advisorData.quiz.length > 0 ? (
                  <div className="bg-slate-50 p-4 md:p-6 rounded-3xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-teal-700" />
                          <h4 className="text-base font-bold text-slate-900">
                            {language === 'ta'
                              ? 'வீடியோ அடிப்படையிலான AI வினாடி வினா'
                              : 'AI Quiz Generated from Video'}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600">
                          {language === 'ta'
                            ? 'வீடியோவில் உள்ள தொழில்நுட்பங்களை சரியாகப் பதிலளியுங்கள்'
                            : 'Test your understanding of the concepts demonstrated in this tutorial'}
                        </p>
                      </div>

                      {isQuizSubmitted && (
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm font-extrabold px-3 py-1 rounded-full ${
                              quizScore >= Math.ceil(advisorData.quiz.length * 0.6)
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {language === 'ta' ? 'மதிப்பெண்:' : 'Score:'} {quizScore} /{' '}
                            {advisorData.quiz.length}
                          </span>
                          <button
                            onClick={handleRetakeQuiz}
                            className="px-3 py-1 text-xs font-bold text-teal-700 bg-white border border-teal-300 rounded-lg hover:bg-teal-50 flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{language === 'ta' ? 'மீண்டும் செய்' : 'Retake'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Quiz Questions */}
                    <div className="space-y-4">
                      {advisorData.quiz.map((q, qIdx) => {
                        const selectedOpt = quizAnswers[qIdx];
                        const isCorrect = isQuizSubmitted && selectedOpt === q.correctIndex;
                        const isWrong =
                          isQuizSubmitted && selectedOpt !== undefined && selectedOpt !== q.correctIndex;

                        return (
                          <div
                            key={qIdx}
                            className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2">
                                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                  {qIdx + 1}
                                </span>
                                <h5 className="text-sm font-bold text-slate-900 leading-snug">
                                  {q.question}
                                </h5>
                              </div>
                              <SpeakButton
                                textToSpeak={`${q.question}. ${q.options.join(', ')}`}
                                size="sm"
                              />
                            </div>

                            {/* Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {q.options.map((opt, optIdx) => {
                                const isThisSelected = selectedOpt === optIdx;
                                const isThisCorrectOption = isQuizSubmitted && q.correctIndex === optIdx;

                                let optStyle =
                                  'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';
                                if (isQuizSubmitted) {
                                  if (isThisCorrectOption) {
                                    optStyle =
                                      'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold ring-2 ring-emerald-400/30';
                                  } else if (isThisSelected) {
                                    optStyle =
                                      'bg-rose-100 border-rose-500 text-rose-900 font-semibold';
                                  }
                                } else if (isThisSelected) {
                                  optStyle =
                                    'bg-teal-100 border-teal-600 text-teal-950 font-bold ring-2 ring-teal-500/20';
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => handleSelectOption(qIdx, optIdx)}
                                    disabled={isQuizSubmitted}
                                    className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${optStyle}`}
                                  >
                                    <span>{opt}</span>
                                    {isQuizSubmitted && isThisCorrectOption && (
                                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 ml-1" />
                                    )}
                                    {isQuizSubmitted && isThisSelected && !isThisCorrectOption && (
                                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 ml-1" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Explanation if submitted */}
                            {isQuizSubmitted && (
                              <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                                <HelpCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                                <p>{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Submit Quiz Action */}
                    {!isQuizSubmitted && (
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={handleSubmitQuiz}
                          disabled={Object.keys(quizAnswers).length === 0}
                          className="px-6 py-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Award className="w-4 h-4" />
                          <span>{language === 'ta' ? 'வினாடி வினாவை சமர்ப்பி' : 'Submit Quiz'}</span>
                        </button>
                      </div>
                    )}

                    {/* Celebratory Badge on Quiz Passed */}
                    {isQuizSubmitted && quizScore >= Math.ceil(advisorData.quiz.length * 0.6) && (
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-700 text-white p-4 rounded-2xl flex items-center justify-between gap-4 shadow-lg animate-fade-in">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-white text-emerald-700 flex items-center justify-center font-black text-xl shadow-md">
                            🏆
                          </div>
                          <div>
                            <h5 className="font-extrabold text-sm sm:text-base">
                              {language === 'ta' ? 'வாழ்த்துகள்! நீங்கள் தேர்ச்சி பெற்றுள்ளீர்கள்!' : 'Congratulations! Skill Quiz Passed!'}
                            </h5>
                            <p className="text-xs text-emerald-100">
                              {advisorData.recommendedCertification}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            speak(
                              language === 'ta'
                                ? 'உங்கள் திறன் சான்றிதழ் தயாராக உள்ளது!'
                                : 'Your skill badge has been credited to your profile!'
                            );
                          }}
                          className="px-4 py-2 bg-white text-emerald-900 font-bold text-xs rounded-xl shadow hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer"
                        >
                          {language === 'ta' ? 'சான்றிதழ்' : 'Verified Badge'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <Sparkles className="w-6 h-6 text-amber-500 mx-auto animate-pulse" />
                    <h5 className="text-sm font-bold text-slate-800">
                      {language === 'ta'
                        ? 'இந்த வீடியோவிற்கான வினாடி வினாவை உருவாக்கவும்'
                        : 'Ready to take a quiz on this video?'}
                    </h5>
                    <button
                      type="button"
                      onClick={() => handleGenerateQuizFromActiveVideo()}
                      disabled={isGeneratingVideoQuiz}
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {isGeneratingVideoQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <GraduationCap className="w-4 h-4" />}
                      <span>{language === 'ta' ? 'AI வினாடி வினா உருவாக்கு' : 'Generate AI Quiz Now'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeminiSkillHubModal;
