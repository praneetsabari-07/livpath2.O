export type SupportedLanguage = 
  | 'en' // English
  | 'ta' // Tamil (தமிழ்)
  | 'hi' // Hindi (हिन्दी)
  | 'te' // Telugu (తెలుగు)
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'ml' // Malayalam (മലയാളം)
  | 'mr' // Marathi (मराठी)
  | 'bn' // Bengali (বাংলা)
  | 'gu' // Gujarati (ગુજરાતી)
  | 'pa'; // Punjabi (ਪੰਜਾਬੀ)

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  speechCode: string;
  regionName: string;
  flag: string;
}

export type EducationLevel = 
  | 'below_10th' // Below 10th Standard / No formal schooling
  | '10th_pass'  // 10th Standard (SSLC)
  | '12th_pass'  // 12th Standard (HSC)
  | 'iti_vocational' // ITI / Vocational Training
  | 'diploma'    // Polytechnic / Diploma
  | 'graduate';  // Graduate / Degree (BA, B.Com, B.Sc, BE)

export type WorkType = 
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Daily Wage'
  | 'Apprenticeship';

export interface UserProfile {
  fullName: string;
  phone: string;
  age: string;
  dob?: string;
  gender: 'female' | 'male' | 'other' | '';
  location: string;
  district?: string;
  state?: string;
  education: EducationLevel;
  skills: string[];
  workType: WorkType | 'Any';
  locationType?: 'Near me' | 'Within district' | 'Anywhere';
  preferredSalary?: string;
  hasExperience: boolean;
  experienceDescription?: string;
  certificateVerified: boolean;
  certificateType?: string;
  verifiedAt?: string;
  lang?: string;
  language?: string;
}

export interface JobBadge {
  text: string;
  icon?: string;
  color?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  district: string;
  workType: WorkType;
  salary: string;
  salaryNumeric: number;
  minEducation: EducationLevel;
  educationLabel: string;
  skillsRequired: string[];
  demandLevel: 'high' | 'medium' | 'critical';
  trainingAvailable: boolean;
  trainingNote?: string;
  description: string;
  requirements: string[];
  contactPhone: string;
  distanceKm: number;
  category: 'textile' | 'technical' | 'delivery' | 'construction' | 'hospitality' | 'services' | 'retail' | 'tech';
  icon: string;
  badges: JobBadge[];
  matchScore?: number;
  matchingSkills?: string[];
  missingSkills?: string[];
}

export type ApplicationStatusType = 
  | 'submitted'
  | 'under_review'
  | 'interview_scheduled'
  | 'selected'
  | 'shortlisted';

export interface TimelineStep {
  stage: string;
  label: string;
  desc: string;
  icon: string;
  done: boolean;
  current: boolean;
  tone: 'neutral' | 'positive' | 'warning';
  date?: string;
}

export interface Application {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  workType: WorkType;
  salary: string;
  appliedAt: string;
  status: ApplicationStatusType;
  statusLabel: string;
  interviewDate?: string;
  timeline: TimelineStep[];
  nextStep: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SkillVideo {
  id: string;
  title: string;
  channelName: string;
  duration: string;
  youtubeUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  keySkillsTaught: string[];
}

export interface SkillAdvisorResult {
  query: string;
  topicTitle: string;
  language: string;
  overview: string;
  videos: SkillVideo[];
  quiz: QuizQuestion[];
  relatedJobs: string[];
  recommendedCertification: string;
}

export type AssistantMode = 
  | 'idle' 
  | 'listening' 
  | 'processing' 
  | 'speaking' 
  | 'conversational_interview';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  audioSpoken?: boolean;
  action?: {
    type: 'profile_updated' | 'jobs_found' | 'navigate' | 'info';
    data?: any;
  };
}

