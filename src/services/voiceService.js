/**
 * Real Speech Recognition and Natural Language Processing Service.
 * Uses Web Speech API (SpeechRecognition / webkitSpeechRecognition) with live audio capture,
 * and passes the user's spoken words to the Gemini AI server endpoint for profile & preference extraction.
 */

import { parseVoiceTranscriptWithGemini } from './geminiService';

/**
 * Starts listening to the user's real microphone input.
 * @param {function} onTranscript - Callback when transcript (live/final) is received
 * @param {function} onError - Callback on error
 * @param {function} onEnd - Callback when listening ends
 * @param {string} [langCode='ta-IN'] - Language code (e.g. 'ta-IN', 'hi-IN', 'en-IN')
 * @returns {function} stop function to abort listening
 */
export const startListening = (onTranscript, onError, onEnd, langCode = 'ta-IN') => {
  const SpeechRecognition =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : null;

  if (!SpeechRecognition) {
    if (onError) onError('Speech recognition is not supported in this browser.');
    if (onEnd) onEnd();
    return () => {};
  }

  let recognition;
  try {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = langCode;

    let finalTranscript = '';

    recognition.onstart = () => {
      finalTranscript = '';
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const activeText = (finalTranscript + ' ' + interim).trim();
      if (activeText && onTranscript) {
        onTranscript(activeText);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (onError) onError(event.error);
      if (onEnd) onEnd();
    };

    recognition.onend = () => {
      if (finalTranscript && onTranscript) {
        onTranscript(finalTranscript);
      }
      if (onEnd) onEnd();
    };

    recognition.start();
  } catch (err) {
    console.error('Failed to initialize speech recognition:', err);
    if (onError) onError(err.message);
    if (onEnd) onEnd();
  }

  return () => {
    if (recognition) {
      try {
        recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  };
};

/**
 * Extracts structured personal details from actual spoken words.
 * Calls Gemini server endpoint with regex fallback.
 * @param {string} transcript - User's spoken text
 * @param {string} [language='en'] - UI language code
 * @returns {Promise<object>} Structured profile details
 */
export const processTranscript = async (transcript, language = 'en') => {
  if (!transcript || transcript.trim().length === 0) {
    return {};
  }

  try {
    const extracted = await parseVoiceTranscriptWithGemini(transcript, language);
    if (extracted && Object.keys(extracted).length > 0) {
      return extracted;
    }
  } catch (err) {
    console.warn('Gemini transcript parsing failed, using pattern matching:', err);
  }

  // Robust local pattern matching fallback
  const text = transcript.toLowerCase();
  const result = {
    fullName: '',
    age: '',
    dob: '',
    gender: '',
    location: '',
    education: '',
    skills: [],
  };

  // Name patterns (EN, TA, HI)
  const nameMatch = text.match(/(?:my name is|i am|this is|name is|பெயர்|என் பெயர்|பேரு|मेरा नाम|नाम है)\s+([a-zA-Z\u0B80-\u0BFF\u0900-\u097F\s]{2,25})/i);
  if (nameMatch) {
    const rawName = nameMatch[1]
      .replace(/\b(and|i am|age|வயது|साल|from|living|years|old|work|is)\b/gi, '')
      .trim();
    if (rawName.length >= 2) {
      result.fullName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    }
  }

  // Age & DOB patterns
  const ageMatch = text.match(/(?:age|வயது|साल|वर्ष|years old)\s*(?:is)?\s*(\d{2})/i) || text.match(/\b(1[8-9]|[2-6]\d)\b/);
  if (ageMatch) {
    result.age = ageMatch[1];
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - parseInt(ageMatch[1], 10);
    result.dob = `${birthYear}-01-01`;
  }

  const dobMatch = text.match(/\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b/);
  if (dobMatch) {
    result.dob = `${dobMatch[1]}-${dobMatch[2].padStart(2, '0')}-${dobMatch[3].padStart(2, '0')}`;
  }

  // Gender
  if (text.includes('female') || text.includes('woman') || text.includes('girl') || text.includes('பெண்') || text.includes('மகள்') || text.includes('महिला') || text.includes('औरत')) {
    result.gender = 'female';
  } else if (text.includes('male') || text.includes('man') || text.includes('boy') || text.includes('ஆண்') || text.includes('மகன்') || text.includes('पुरुष') || text.includes('आदमी')) {
    result.gender = 'male';
  } else if (text.includes('other') || text.includes('trans') || text.includes('மாற்றுத்திருனாளி')) {
    result.gender = 'other';
  }

  // Education (matches dropdown values: 'school', 'diploma', 'ug', 'pg')
  if (text.includes('diploma') || text.includes('iti') || text.includes('டிப்ளமோ') || text.includes('आईटीआई')) {
    result.education = 'diploma';
  } else if (text.includes('postgraduate') || text.includes('pg') || text.includes('master') || text.includes('msc') || text.includes('mca') || text.includes('mba') || text.includes('முதுகலை')) {
    result.education = 'pg';
  } else if (text.includes('undergraduate') || text.includes('ug') || text.includes('graduate') || text.includes('degree') || text.includes('college') || text.includes('btech') || text.includes('be') || text.includes('bsc') || text.includes('bcom') || text.includes('பட்டதாரி')) {
    result.education = 'ug';
  } else if (text.includes('school') || text.includes('10th') || text.includes('12th') || text.includes('pass') || text.includes('பத்தாம்') || text.includes('பன்னிரண்டாம்') || text.includes('दसवीं') || text.includes('बारहवीं') || text.includes('8th') || text.includes('5th')) {
    result.education = 'school';
  }

  // Location
  const cities = [
    'Salem', 'Chennai', 'Coimbatore', 'Bengaluru', 'Bangalore', 'Madurai', 'Tiruppur', 'Erode',
    'Trichy', 'Tiruchirappalli', 'Namakkal', 'Karur', 'Dindigul', 'Dharmapuri', 'Krishnagiri',
    'Vellore', 'Tirunelveli', 'Thanjavur', 'Kanchipuram', 'Cuddalore', 'Villupuram', 'Hyderabad',
    'Mumbai', 'Delhi', 'Kolkata', 'Pune'
  ];
  for (const city of cities) {
    if (text.includes(city.toLowerCase())) {
      result.location = city === 'Bangalore' ? 'Bengaluru' : (city === 'Tiruchirappalli' ? 'Trichy' : city);
      break;
    }
  }

  return result;
};

/**
 * Extracts structured job preferences from actual spoken words.
 * @param {string} transcript
 * @param {string} [language='en']
 * @returns {Promise<object>} Structured job preferences
 */
export const processJobPreferencesTranscript = async (transcript, language = 'en') => {
  if (!transcript || transcript.trim().length === 0) {
    return {
      skills: [],
      workType: 'Any',
      locationType: 'Anywhere',
      specificLocation: '',
      hasExperience: false,
      experienceDescription: '',
    };
  }

  try {
    const extracted = await parseVoiceTranscriptWithGemini(transcript, language);
    if (extracted && extracted.skills && extracted.skills.length > 0) {
      return {
        skills: extracted.skills || [],
        workType: extracted.workType || 'Any',
        locationType: extracted.location ? 'Specific' : 'Anywhere',
        specificLocation: extracted.location || '',
        hasExperience: extracted.hasExperience || false,
        experienceDescription: extracted.hasExperience ? 'Experienced' : '',
      };
    }
  } catch (e) {
    console.warn('Gemini job preference extraction fallback:', e);
  }

  const text = transcript.toLowerCase();
  const result = {
    skills: [],
    workType: 'Any',
    locationType: 'Anywhere',
    specificLocation: '',
    hasExperience: false,
    experienceDescription: '',
  };

  // Check common skills in multiple languages
  if (text.includes('tailor') || text.includes('தையல்') || text.includes('सिलाई')) result.skills.push('Tailoring');
  if (text.includes('embroid') || text.includes('எம்பிராய்டரி') || text.includes('कढ़ाई')) result.skills.push('Embroidery');
  if (text.includes('cook') || text.includes('சமையல்') || text.includes('खाना') || text.includes('रसोई')) result.skills.push('Cooking');
  if (text.includes('driv') || text.includes('ஓட்டுநர்') || text.includes('ड्राइविंग')) result.skills.push('Driving');
  if (text.includes('deliver') || text.includes('டெலிவரி') || text.includes('डिलीवरी')) result.skills.push('Delivery');
  if (text.includes('electric') || text.includes('எலக்ட்ரீசியன்') || text.includes('बिजली')) result.skills.push('Electrician');
  if (text.includes('plumb') || text.includes('பிளம்பிங்') || text.includes('नल')) result.skills.push('Plumbing');
  if (text.includes('secur') || text.includes('பாதுகாவலர்') || text.includes('सुरक्षा')) result.skills.push('Security');
  if (text.includes('comput') || text.includes('கணினி') || text.includes('कंप्यूटर') || text.includes('data entry')) result.skills.push('Data Entry');
  if (text.includes('cctv') || text.includes('கேமரா')) result.skills.push('CCTV');

  // Work type
  if (text.includes('full-time') || text.includes('full time') || text.includes('முழு நேரம்') || text.includes('फुल टाइम')) {
    result.workType = 'Full-time';
  } else if (text.includes('part-time') || text.includes('part time') || text.includes('பகுதி நேரம்') || text.includes('पार्ट टाइम')) {
    result.workType = 'Part-time';
  }

  // Location
  const cities = ['Salem', 'Chennai', 'Coimbatore', 'Bengaluru', 'Madurai', 'Tiruppur', 'Erode', 'Trichy', 'Hyderabad', 'Mumbai', 'Delhi'];
  for (const city of cities) {
    if (text.includes(city.toLowerCase())) {
      result.locationType = 'Specific';
      result.specificLocation = city;
      break;
    }
  }

  if (text.includes('experience') || text.includes('அனுபவம்') || text.includes('अनुभव') || text.includes('தெரியும்')) {
    result.hasExperience = true;
    result.experienceDescription = 'Prior experience mentioned';
  }

  return result;
};
