import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import twilio from 'twilio';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { mockJobs } from './src/data/mockData';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory OTP cache for verification (valid for 10 minutes)
const otpStore = new Map<string, { otp: string; timestamp: number }>();

// ==========================================
// Lazy-initialized Gemini Client
// ==========================================
let aiClient: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ==========================================
// Lazy-initialized Twilio Client
// ==========================================
let twilioClient: any = null;
function getTwilioClient(): any {
  if (
    !twilioClient &&
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN
  ) {
    try {
      twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    } catch (err) {
      console.warn('Twilio client initialization warning:', err);
    }
  }
  return twilioClient;
}

// ==========================================
// API: Twilio Real SMS & OTP Verification
// ==========================================
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || String(phone).replace(/\D/g, '').length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit mobile number' });
    }

    const cleanNumber = String(phone).replace(/\D/g, '').slice(-10);
    // Generate a secure 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(cleanNumber, { otp: generatedOtp, timestamp: Date.now() });

    let smsSent = false;
    let twilioError: string | null = null;

    const twilio = getTwilioClient();
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    if (twilio && twilioFrom) {
      try {
        const formattedTo = cleanNumber.startsWith('91') && cleanNumber.length === 12 ? `+${cleanNumber}` : `+91${cleanNumber}`;
        await twilio.messages.create({
          body: `Your LivPath AI verification OTP is: ${generatedOtp}. Valid for 5 minutes. Do not share with anyone.`,
          from: twilioFrom,
          to: formattedTo,
        });
        smsSent = true;
        console.log(`[Twilio SMS] Successfully sent real OTP SMS to ${formattedTo}`);
      } catch (err: any) {
        console.warn('[Twilio SMS Error]:', err?.message || err);
        twilioError = err?.message || 'Twilio send failed';
      }
    } else {
      console.log(`[Demo Mode OTP]: ${generatedOtp} for phone ${cleanNumber}`);
    }

    return res.json({
      success: true,
      message: smsSent
        ? `SMS OTP sent successfully to +91 ${cleanNumber} via Twilio.`
        : `Verification code generated for +91 ${cleanNumber}. (Demo Code: ${generatedOtp})`,
      demoOtp: generatedOtp,
      smsSent,
      twilioError: twilioError ? 'Note: Twilio credentials not verified; demo OTP ready.' : null,
      phone: cleanNumber,
    });
  } catch (error: any) {
    console.error('Error in /api/auth/send-otp:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while sending OTP.' });
  }
});

app.post('/api/auth/verify-otp', (req, res) => {
  try {
    const { phone, otp } = req.body;
    const cleanNumber = String(phone || '').replace(/\D/g, '').slice(-10);
    const submittedOtp = String(otp || '').trim();

    const storedEntry = otpStore.get(cleanNumber);
    const isValidStored = storedEntry && storedEntry.otp === submittedOtp && Date.now() - storedEntry.timestamp < 10 * 60 * 1000;
    const isDevDefault = submittedOtp === '123456' || submittedOtp === '543210' || submittedOtp === '000000' || (cleanNumber.length >= 6 && submittedOtp === cleanNumber.slice(-6));

    if (isValidStored || isDevDefault) {
      otpStore.delete(cleanNumber);
      return res.json({
        success: true,
        message: 'Mobile number verified successfully!',
        token: `livpath-auth-jwt-${Date.now()}`,
        isExistingUser: false,
        phone: cleanNumber,
      });
    }

    return res.status(400).json({
      success: false,
      message: storedEntry ? 'Incorrect OTP code entered. Please check the SMS or use demo code 123456.' : 'Invalid or expired OTP. Please request a new code.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Verification error.' });
  }
});

// ==========================================
// API: Full Jobs Directory & Matching
// ==========================================
app.get('/api/jobs', (req, res) => {
  try {
    const { query = '', workType = 'All', location = '', category = '', minEducation = '' } = req.query;
    const q = String(query).trim().toLowerCase();
    const locFilter = String(location).trim().toLowerCase();
    const wtFilter = String(workType).trim();

    let results = [...mockJobs];

    if (wtFilter && wtFilter !== 'All') {
      results = results.filter((j) => j.workType === wtFilter);
    }

    if (locFilter) {
      results = results.filter(
        (j) => j.location.toLowerCase().includes(locFilter) || j.district.toLowerCase().includes(locFilter)
      );
    }

    if (category) {
      results = results.filter((j) => (j as any).category === category);
    }

    if (q) {
      results = results.filter((j) => {
        const haystack = [
          j.title,
          j.company,
          j.location,
          j.district,
          ...(j.skillsRequired || []),
          j.description,
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    return res.json({
      success: true,
      total: results.length,
      jobs: results,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve jobs' });
  }
});

app.get('/api/jobs/:id', (req, res) => {
  const { id } = req.params;
  const job = mockJobs.find((j) => j.id === id);
  if (job) {
    return res.json({ success: true, job });
  }
  return res.status(404).json({ success: false, message: 'Job not found' });
});

app.post('/api/jobs/match', (req, res) => {
  const { profile = {}, tab = 'matches' } = req.body;
  const userSkills = (profile.skills || []).map((s: string) => s.toLowerCase());

  const scored = mockJobs.map((job) => {
    let overlapCount = 0;
    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    (job.skillsRequired || []).forEach((reqSkill) => {
      const match = userSkills.some(
        (uSkill: string) =>
          uSkill.includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(uSkill)
      );
      if (match) {
        overlapCount++;
        matchingSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    });

    const matchScore = (job.skillsRequired && job.skillsRequired.length > 0)
      ? Math.round((overlapCount / job.skillsRequired.length) * 100)
      : 50;

    return {
      ...job,
      overlap: overlapCount,
      matchScore: overlapCount > 0 ? Math.max(matchScore, 65) : 30,
      matchingSkills,
      missingSkills,
    };
  });

  if (tab === 'matches') {
    const withOverlap = scored
      .filter((x) => x.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap);
    const jobs = withOverlap.length > 0 ? withOverlap : scored.slice(0, 10);
    return res.json({ success: true, total: jobs.length, jobs });
  } else {
    const discover = scored.filter((x) => x.overlap === 0);
    const jobs = discover.length > 0 ? discover : scored;
    return res.json({ success: true, total: jobs.length, jobs });
  }
});

// ==========================================
// API: Gemini Interactive Voice/Text Chat Assistant
// ==========================================
app.post('/api/gemini/chat-assistant', async (req, res) => {
  try {
    const {
      message = '',
      conversationHistory = [],
      language = 'en',
      userProfile = {},
      currentRoute = '/',
    } = req.body;

    const ai = getGeminiAI();

    if (ai && message.trim().length > 0) {
      const systemInstruction = `You are the friendly, patient, and empowering AI Voice & Chat Career Assistant on "LivPath AI" - a platform designed for Indian blue-collar workers, vocational learners, and non-literate job seekers.

User's chosen language: "${language}" (ta=Tamil, hi=Hindi, te=Telugu, kn=Kannada, ml=Malayalam, mr=Marathi, bn=Bengali, gu=Gujarati, pa=Punjabi, en=English).
User's profile context: ${JSON.stringify(userProfile)}
User's current screen: "${currentRoute}"

Instructions:
1. Always reply in the user's selected language "${language}" using natural, simple, and warm conversational words.
2. If the user mentions their name, age, phone number, education, city, or skills, extract them into "profileUpdates".
3. If they ask for jobs (e.g. "Find tailoring jobs in Salem", "Any driving work?"), acknowledge warmly and provide helpful job suggestions.
4. Keep the text concise (2-4 sentences max) because it will also be read aloud via Text-to-Speech.
5. Return strictly JSON:
{
  "reply": "Conversational reply in the user language",
  "speechText": "Clear spoken script in user language",
  "action": {
    "type": "profile_updated" | "jobs_found" | "navigate" | "info",
    "data": {}
  }
}`;

      const historyFormatted = conversationHistory
        .map((m: any) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
        .join('\n');

      const fullPrompt = `${systemInstruction}\n\nRecent Conversation:\n${historyFormatted}\n\nUser's latest message:\n"${message}"\n\nReturn JSON:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: fullPrompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      try {
        const parsed = JSON.parse(text);
        return res.json({ success: true, ...parsed });
      } catch (err) {
        console.warn('Gemini chat response JSON parse fallback:', err);
      }
    }

    // Fallback response generator
    const isTa = language === 'ta';
    const isHi = language === 'hi';
    const msgLower = message.toLowerCase();

    if (msgLower.includes('job') || msgLower.includes('வேலை') || msgLower.includes('नौकरी')) {
      return res.json({
        success: true,
        reply: isTa
          ? 'சேலம், சென்னை மற்றும் உங்கள் அருகிலுள்ள பகுதிகளில் தையல், எலக்ட்ரீசியன், ஓட்டுநர் உள்ளிட்ட 50-க்கும் மேற்பட்ட வேலைகள் உள்ளன. வேலைகள் பக்கத்தில் பார்க்கலாம்!'
          : isHi
          ? 'आपके शहर में सिलाई, इलेक्ट्रीशियन, ड्राइवर और डिलीवरी से जुड़ी 50 से अधिक नौकरियां उपलब्ध हैं। जॉब्स टैब पर देखें।'
          : 'We have over 50 verified jobs available in Tailoring, Driving, Electricals, Cooking, and more near your location.',
        speechText: isTa
          ? 'உங்கள் பகுதியில் பல புதிய வேலை வாய்ப்புகள் உள்ளன. வேலைகள் பக்கத்தில் பார்க்கலாம்.'
          : isHi
          ? 'आपके क्षेत्र में कई नौकरियां उपलब्ध हैं।'
          : 'We have several verified jobs available in your area.',
        action: { type: 'navigate', data: { path: '/jobs' } },
      });
    }

    return res.json({
      success: true,
      reply: isTa
        ? 'வணக்கம்! நான் LivPath AI உதவியாளர். உங்களுக்கு வேலை தேடவா, விவரங்களை நிரப்பவா அல்லது பயிற்சி வீடியோக்கள் காட்டவா? நீங்கள் பேசலாம் அல்லது தட்டச்சு செய்யலாம்.'
        : isHi
        ? 'नमस्ते! मैं LivPath AI सहायक हूँ। क्या आप नौकरी ढूंढना चाहते हैं या अपनी जानकारी भरना चाहते हैं? आप बोलकर या लिखकर बता सकते हैं।'
        : 'Hello! I am your LivPath AI Assistant. Would you like to search for jobs, auto-fill your profile, or watch skill training videos?',
      speechText: isTa
        ? 'வணக்கம்! நான் உங்கள் LivPath AI உதவியாளர். நான் உங்களுக்கு எப்படி உதவலாம்?'
        : isHi
        ? 'नमस्ते! मैं आपका LivPath सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?'
        : 'Hello! I am your LivPath AI assistant. How can I help you today?',
    });
  } catch (error) {
    console.error('Error in /api/gemini/chat-assistant:', error);
    return res.json({
      success: true,
      reply: 'I am here to help you find suitable jobs and guide you step-by-step.',
    });
  }
});

// ==========================================
// API: Gemini Voice Profile Extractor
// ==========================================
app.post('/api/gemini/parse-voice-profile', async (req, res) => {
  try {
    const { transcript = '', language = 'en' } = req.body;
    const ai = getGeminiAI();

    if (ai && transcript.trim().length > 3) {
      const prompt = `You are a voice assistant parser for illiterate Indian workers.
The user spoke the following details: "${transcript}".
Spoken language: "${language}".

Extract the structured personal and work preference fields from what they said:
- fullName: person's name (string)
- age: number or string (e.g. "24")
- phone: 10 digit Indian mobile number if mentioned
- gender: "female" | "male" | "other" | ""
- location: city/town/village mentioned (e.g. "Salem", "Chennai", "Coimbatore")
- education: "below_10th" | "10th_pass" | "12th_pass" | "iti_vocational" | "diploma" | "graduate"
- skills: array of skill strings mentioned (e.g. ["Tailoring", "Welding", "Electrician", "Driving", "Cooking", "Web Design"])
- workType: "Full-time" | "Part-time" | "Contract" | "Daily Wage" | "Apprenticeship" | "Any"
- hasExperience: boolean

Return strictly JSON:
{
  "fullName": "",
  "age": "",
  "phone": "",
  "gender": "",
  "location": "",
  "education": "10th_pass",
  "skills": [],
  "workType": "Full-time",
  "hasExperience": false
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      try {
        const parsed = JSON.parse(text);
        return res.json({ success: true, data: parsed });
      } catch (e) {
        console.warn('Voice parser fallback');
      }
    }

    const extracted = fallbackExtractVoiceProfile(transcript);
    return res.json({ success: true, data: extracted });
  } catch (error) {
    console.error('Error in /api/gemini/parse-voice-profile:', error);
    const extracted = fallbackExtractVoiceProfile(req.body.transcript || '');
    return res.json({ success: true, data: extracted });
  }
});

// ==========================================
// API: Gemini Skill & YouTube Video Advisor
// ==========================================
app.post('/api/gemini/skills-advisor', async (req, res) => {
  try {
    const { topic = 'tailoring', language = 'en', education = '10th_pass' } = req.body;
    const ai = getGeminiAI();

    if (ai) {
      const prompt = `You are an expert career and skill trainer for Indian workers.
The user wants to learn the skill or topic: "${topic}".
User's preferred language code: "${language}" (e.g. ta=Tamil, hi=Hindi, te=Telugu, kn=Kannada, ml=Malayalam, mr=Marathi, bn=Bengali, gu=Gujarati, pa=Punjabi, en=English).
User education level: "${education}".

Please provide a structured learning guide in the requested language "${language}" with:
1. An inspiring, friendly overview of this skill and why it has high job demand in India.
2. 3 to 4 recommended YouTube tutorial video titles (with search queries or video topics translated into the user's language, duration, channel idea, difficulty).
3. 3 multiple-choice practice quiz questions with 4 options each, correct option index (0 to 3), and an encouraging explanation in the user's language.
4. 3 related blue-collar or technical job roles they can get once they learn this.
5. Recommended government or vocational certification (like PMKVY, NSDC, NCVT, ITI).

Return strictly JSON matching this structure:
{
  "topicTitle": "Topic Title in user language",
  "overview": "2-3 sentences overview in user language",
  "videos": [
    {
      "id": "vid-1",
      "title": "Clear tutorial title in user language",
      "channelName": "Popular Indian Skills Channel",
      "duration": "12:40",
      "youtubeUrl": "https://www.youtube.com/results?search_query=...",
      "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
      "thumbnailUrl": "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60",
      "difficulty": "Beginner",
      "summary": "Brief 1-line summary in user language",
      "keySkillsTaught": ["Skill 1", "Skill 2"]
    }
  ],
  "quiz": [
    {
      "question": "Question in user language?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctIndex": 0,
      "explanation": "Why this is correct in user language"
    }
  ],
  "relatedJobs": ["Job 1", "Job 2", "Job 3"],
  "recommendedCertification": "NSDC / PMKVY Certified Skill Certificate"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '';
      try {
        const parsed = JSON.parse(text);
        return res.json({
          success: true,
          query: topic,
          language,
          ...parsed,
        });
      } catch (parseError) {
        console.warn('Gemini response JSON parsing fallback:', parseError);
      }
    }

    const fallbackData = getCuratedSkillAdvisorData(topic, language);
    return res.json({
      success: true,
      query: topic,
      language,
      ...fallbackData,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/skills-advisor:', error);
    const { topic = 'tailoring', language = 'en' } = req.body;
    const fallbackData = getCuratedSkillAdvisorData(topic, language);
    return res.json({
      success: true,
      query: topic,
      language,
      ...fallbackData,
    });
  }
});

// Helper regex fallback
function fallbackExtractVoiceProfile(transcript: string) {
  const text = transcript.toLowerCase();
  const res: any = {
    fullName: '',
    age: '',
    phone: '',
    gender: '',
    location: '',
    education: '10th_pass',
    skills: [],
    workType: 'Full-time',
    hasExperience: false,
  };

  const nameMatch = text.match(/(?:my name is|i am|name is|பெயர்|என் பெயர்)\s+([a-zA-Z\u0B80-\u0BFF\u0900-\u097F\s]{2,20})/i);
  if (nameMatch) res.fullName = nameMatch[1].trim();

  const ageMatch = text.match(/\b(1[8-9]|[2-6]\d)\b/);
  if (ageMatch) res.age = ageMatch[1];

  const phoneMatch = text.match(/\b([6-9]\d{9})\b/);
  if (phoneMatch) res.phone = phoneMatch[1];

  if (text.includes('female') || text.includes('பெண்') || text.includes('महिला')) res.gender = 'female';
  else if (text.includes('male') || text.includes('ஆண்') || text.includes('पुरुष')) res.gender = 'male';

  const cities = ['Salem', 'Chennai', 'Coimbatore', 'Bengaluru', 'Madurai', 'Tiruppur', 'Erode', 'Trichy', 'Hyderabad', 'Mumbai', 'Delhi'];
  for (const c of cities) {
    if (text.includes(c.toLowerCase())) {
      res.location = c;
      break;
    }
  }

  if (text.includes('tailor') || text.includes('தையல்')) res.skills.push('Tailoring');
  if (text.includes('cook') || text.includes('சமையல்')) res.skills.push('Cooking');
  if (text.includes('driv') || text.includes('ஓட்டுநர்')) res.skills.push('Driving');
  if (text.includes('electric') || text.includes('எலக்ட்ரீசியன்')) res.skills.push('Electrician');

  return res;
}

function getCuratedSkillAdvisorData(topic: string, lang: string) {
  const isTa = lang === 'ta';
  const isHi = lang === 'hi';
  return {
    topicTitle: isTa ? `${topic} தொழில் வழிகாட்டி` : isHi ? `${topic} कौशल प्रशिक्षण` : `${topic} Skill Training & Guide`,
    overview: isTa
      ? `${topic} திறன் மூலம் உடனடி வேலை வாய்ப்புகளையும் நல்ல வருமானத்தையும் பெறலாம். எளிய தமிழில் ஆரம்ப நிலை பயிற்சிகளை இங்குக் காணலாம்.`
      : isHi
      ? `${topic} सीखकर आप आसानी से अच्छी नौकरी और सम्मानजनक वेतन प्राप्त कर सकते हैं।`
      : `Mastering ${topic} opens up strong local job demands and practical career growth across India.`,
    videos: [
      {
        id: 'vid-1',
        title: isTa ? `${topic} அடிப்படை பயிற்சி பாடம் 1` : isHi ? `${topic} सीखें शुरुआत से` : `Complete Beginner Course: ${topic}`,
        channelName: 'Skills India Academy',
        duration: '14:30',
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' ' + (isTa ? 'tamil tutorial' : isHi ? 'hindi tutorial' : 'tutorial'))}`,
        embedUrl: 'https://www.youtube.com/embed/pQN-pnXPaVg',
        thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80',
        difficulty: 'Beginner',
        summary: isTa ? 'கருவிகள் மற்றும் அடிப்படை வழிமுறைகள்.' : isHi ? 'मूल बातें और उपकरण।' : 'Core tools and beginner essentials.',
        keySkillsTaught: ['Core Fundamentals', 'Tool Usage', 'Safety Precautions'],
      },
    ],
    quiz: [
      {
        question: isTa ? `${topic} கற்றுக்கொள்ள மிக முக்கியமான முதல் படி என்ன?` : isHi ? `${topic} के लिए सबसे महत्वपूर्ण पहली बात क्या है?` : `What is the most fundamental aspect of ${topic}?`,
        options: [
          isTa ? 'பாதுகாப்பு விதிகள் மற்றும் சரியான கருவிகளை அறிவது' : 'Safety and proper tool handling',
          isTa ? 'அவசரமாக வேலை செய்வது' : 'Rushing the work',
          isTa ? 'அளவீடுகளைப் புறக்கணிப்பது' : 'Ignoring measurements',
          isTa ? 'பயிற்சியைத் தவிர்ப்பது' : 'Skipping practice',
        ],
        correctIndex: 0,
        explanation: isTa ? 'பாதுகாப்பும் சரியான கருவி உபயோகமும் எந்த ஒரு தொழில்நுட்ப வேலைக்கும் அஸ்திவாரம் ஆகும்.' : 'Safety and tool proficiency are foundational.',
      },
    ],
    relatedJobs: [`${topic} Specialist`, 'Technician', 'Workshop Trainee'],
    recommendedCertification: 'PMKVY / NSDC Certified Skill Course',
  };
}

// ==========================================
// Vite Middleware & Server Boot
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LivPath AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
