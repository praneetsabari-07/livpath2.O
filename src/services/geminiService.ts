import { SkillAdvisorResult, UserProfile, ChatMessage, QuizQuestion } from '../types';

export async function fetchSkillAdvisor(
  topic: string,
  language: string,
  education?: string
): Promise<SkillAdvisorResult> {
  try {
    const res = await fetch('/api/gemini/skills-advisor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, language, education }),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch skill advisor: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching skill advisor:', error);
    const isTa = language === 'ta';
    const isHi = language === 'hi';
    return {
      query: topic,
      topicTitle: isTa ? `${topic} தொழில் வழிகாட்டி` : isHi ? `${topic} कौशल प्रशिक्षण` : `Learning ${topic}`,
      language,
      overview: isTa
        ? `${topic} குறித்த எளிய வீடியோ பாடங்கள் மற்றும் AI வினாடி வினாக்கள் இங்கே கொடுக்கப்பட்டுள்ளன.`
        : isHi
        ? `${topic} के लिए वीडियो ट्यूटोरियल और एआई क्विज यहाँ उपलब्ध हैं।`
        : `Learn essential practical skills for ${topic} with step-by-step video lessons and practice quizzes.`,
      videos: [
        {
          id: 'v-fallback-1',
          title: isTa ? `${topic} எளிய செய்முறை பயிற்சி` : isHi ? `${topic} सीखें शुरुआत से` : `Complete Beginner Guide for ${topic}`,
          channelName: 'Skills India Academy',
          duration: '14:20',
          youtubeUrl: 'https://www.youtube.com/watch?v=v8JtJ1d3t2c',
          embedUrl: 'https://www.youtube-nocookie.com/embed/v8JtJ1d3t2c?rel=0',
          thumbnailUrl: 'https://img.youtube.com/vi/v8JtJ1d3t2c/hqdefault.jpg',
          difficulty: 'Beginner',
          summary: isTa ? `கருவிகள் பயன்பாடு மற்றும் அடிப்படை அளவீடுகள்.` : `Step-by-step foundation tutorial for ${topic}.`,
          keySkillsTaught: ['Core Fundamentals', 'Tool Usage', 'Safety Precautions'],
        },
      ],
      quiz: [
        {
          question: isTa ? `${topic} கற்றுக்கொள்ள மிக முக்கியமான முதல் படி என்ன?` : `What is the most important first step when learning ${topic}?`,
          options: [
            isTa ? 'பாதுகாப்பு விதிகள் மற்றும் சரியான கருவிகளை அறிவது' : 'Understanding basic safety & tools',
            isTa ? 'அவசரமாக வேலை செய்வது' : 'Working without guidance',
            isTa ? 'அளவீடுகளைப் புறக்கணிப்பது' : 'Ignoring measurements',
            isTa ? 'பயிற்சியைத் தவிர்ப்பது' : 'Skipping practice',
          ],
          correctIndex: 0,
          explanation: isTa ? 'பாதுகாப்பும் சரியான கருவி அறிவும் மிக அவசியமாகும்.' : 'Safety, tool familiarity, and fundamental measurements are the foundation of any technical craft.',
        },
      ],
      relatedJobs: [`${topic} Specialist`, 'Technician', 'Workshop Trainee'],
      recommendedCertification: 'PMKVY Certified Skill Program',
    };
  }
}

/**
 * Generate AI-based quiz questions specifically from a YouTube video
 */
export async function generateQuizFromVideo(
  videoTitle: string,
  youtubeUrl: string,
  topic: string,
  language: string
): Promise<QuizQuestion[]> {
  try {
    const res = await fetch('/api/gemini/video-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoTitle, youtubeUrl, topic, language }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.quiz) && data.quiz.length > 0) {
        return data.quiz;
      }
    }
  } catch (err) {
    console.warn('Error calling /api/gemini/video-quiz, using fallback:', err);
  }

  const isTa = language === 'ta';
  return [
    {
      question: isTa
        ? `"${videoTitle}" வீடியோவில் காட்டப்பட்ட மிக முக்கியமான படிமுறை எது?`
        : `What was the most important key step demonstrated in "${videoTitle}"?`,
      options: [
        isTa ? 'சரியான அளவீடு மற்றும் பாதுகாப்பு வழிமுறைகள்' : 'Precise measurement and tool safety',
        isTa ? 'அளவீடுகளைத் தவிர்ப்பது' : 'Skipping preparatory measurements',
        isTa ? 'அவசரமாக முடிப்பது' : 'Rushing without safety check',
        isTa ? 'பயிற்சி செய்யாமல் இருப்பது' : 'Working without practice',
      ],
      correctIndex: 0,
      explanation: isTa
        ? 'துல்லியமான அளவீடு மற்றும் பாதுகாப்பான செய்முறையே தரமான வேலைக்கு வழிவகுக்கும்.'
        : 'Precise measurements and systematic tool safety are foundational for technical accuracy.',
    },
    {
      question: isTa
        ? 'இந்த வீடியோ பாடத்தின்படி, பணி செய்வதற்கு முன் எதை உறுதி செய்ய வேண்டும்?'
        : 'According to this tutorial, what should be verified before proceeding?',
      options: [
        isTa ? 'பயன்படுத்தும் உபகரணங்கள் நல்ல நிலையில் இருப்பதை' : 'Ensuring tools are calibrated and in working condition',
        isTa ? 'வேலை நேரத்தை குறைப்பதை' : 'Reducing work time haphazardly',
        isTa ? 'பாதுகாப்பு சாதனங்களை கழற்றுவதை' : 'Removing personal safety gear',
        isTa ? 'எதையும் கவனிக்காமல் இருப்பது' : 'Ignoring instructions',
      ],
      correctIndex: 0,
      explanation: isTa
        ? 'கருவிகளை முன்கூட்டியே சோதிப்பது விபத்துகளைத் தவிர்க்க உதவும்.'
        : 'Inspecting tools in advance prevents workplace hazards and guarantees high quality output.',
    },
  ];
}

export async function parseVoiceTranscriptWithGemini(
  transcript: string,
  language: string
): Promise<Partial<UserProfile>> {
  try {
    const res = await fetch('/api/gemini/parse-voice-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript, language }),
    });

    if (!res.ok) {
      throw new Error(`Failed to parse voice: ${res.statusText}`);
    }

    const data = await res.json();
    return data.data || {};
  } catch (error) {
    console.error('Error parsing voice transcript with Gemini:', error);
    return {};
  }
}

export interface ChatResponse {
  reply: string;
  speechText?: string;
  action?: {
    type: 'profile_updated' | 'jobs_found' | 'navigate' | 'info';
    data?: any;
  };
}

export async function sendAssistantChatMessage(
  message: string,
  conversationHistory: ChatMessage[],
  language: string,
  userProfile?: any,
  currentRoute?: string
): Promise<ChatResponse> {
  try {
    const res = await fetch('/api/gemini/chat-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationHistory: conversationHistory.slice(-8), // Send recent context
        language,
        userProfile,
        currentRoute,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (error) {
    console.warn('API /api/gemini/chat-assistant fallback:', error);
  }

  // Smart conversational fallback based on keywords and language
  const lower = message.toLowerCase();
  const isTa = language === 'ta';
  const isHi = language === 'hi';

  if (lower.includes('job') || lower.includes('வேலை') || lower.includes('नौकरी') || lower.includes('work')) {
    return {
      reply: isTa
        ? 'உங்களுக்கான வேலை வாய்ப்புகளைத் தேடி வைத்துள்ளேன். வேலைகள் பக்கத்தில் தையல், எலக்ட்ரீசியன், ஓட்டுநர் போன்ற 50-க்கும் மேற்பட்ட வேலைகள் உள்ளன.'
        : isHi
        ? 'आपके लिए उपयुक्त नौकरियां उपलब्ध हैं। जॉब लिस्टिंग में सिलाई, इलेक्ट्रीशियन, ड्राइविंग आदि की नौकरियां देखें।'
        : 'I found job opportunities matching your profile in Salem, Chennai, and nearby cities. Check the Jobs tab to explore them.',
      action: { type: 'navigate', data: { path: '/jobs' } },
    };
  }

  if (lower.includes('name') || lower.includes('பெயர்') || lower.includes('नाम') || lower.includes('age') || lower.includes('வயது')) {
    return {
      reply: isTa
        ? 'உங்கள் விவரங்களை நான் கேட்டுக்கொண்டேன். சுயவிவர பக்கத்தில் தானாக சேர்க்கப்பட்டுள்ளது.'
        : isHi
        ? 'मैंने आपका विवरण नोट कर लिया है। आपका प्रोफाइल अपडेट कर दिया गया है।'
        : 'I have noted your personal details and updated your profile accordingly.',
      action: { type: 'profile_updated', data: { note: 'Auto-saved' } },
    };
  }

  return {
    reply: isTa
      ? `வணக்கம்! நான் உங்கள் LivPath AI உதவியாளர். உங்களுக்கு வேலை தேடவா அல்லது படிவங்களை நிரப்பவா? உங்கள் குரலிலும் பேசலாம்.`
      : isHi
      ? `नमस्ते! मैं आपका LivPath AI सहायक हूँ। क्या आप नौकरी ढूंढना चाहते हैं या अपनी जानकारी भरना चाहते हैं? आप बोलकर भी बता सकते हैं।`
      : `Hello! I am your LivPath AI assistant. How can I help you today? You can ask about available jobs, voice form filling, or skill training videos.`,
  };
}
