import { SkillAdvisorResult, UserProfile, ChatMessage } from '../types';

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
    return {
      query: topic,
      topicTitle: `Learning ${topic}`,
      language,
      overview: `Learn essential practical skills for ${topic} with step-by-step video lessons and practice quizzes.`,
      videos: [
        {
          id: 'v-fallback-1',
          title: `Complete Beginner Guide for ${topic}`,
          channelName: 'Skills India Academy',
          duration: '15:30',
          youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
            topic + ' tutorial ' + language
          )}`,
          embedUrl: 'https://www.youtube.com/embed/pQN-pnXPaVg',
          thumbnailUrl:
            'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80',
          difficulty: 'Beginner',
          summary: `Step-by-step foundation tutorial for ${topic}.`,
          keySkillsTaught: ['Core Fundamentals', 'Tool Usage', 'Safety'],
        },
      ],
      quiz: [
        {
          question: `What is the most important first step when learning ${topic}?`,
          options: [
            'Understanding basic safety & tools',
            'Working without guidance',
            'Ignoring measurements',
            'Skipping practice',
          ],
          correctIndex: 0,
          explanation:
            'Safety, tool familiarity, and fundamental measurements are the foundation of any technical craft.',
        },
      ],
      relatedJobs: [`${topic} Specialist`, 'Technician', 'Workshop Trainee'],
      recommendedCertification: 'PMKVY Certified Skill Program',
    };
  }
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
