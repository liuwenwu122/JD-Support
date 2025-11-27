
export type Language = 'zh' | 'en';

export interface WorkExperience {
  company: string;
  role: string;
  duration: string;
  details: string[];
}

export interface Project {
  name: string;
  role: string;
  duration: string;
  description: string;
}

export interface Education {
  school: string;
  degree: string;
  duration: string;
  details: string[];
}

export interface ResumeData {
  personalInfo: {
    name: string;
    gender: string;
    age: number;
    phone: string;
    location: string;
    hometown?: string;
    height?: string;
    weight?: string;
    email?: string;
    role?: string;
  };
  summary: string[];
  education: Education;
  experience: WorkExperience[];
  projects: Project[];
  certificates: string[];
  tags?: string[];
}

export interface ResumeVersion {
  id: string;
  label: string;
  timestamp: number;
  data: ResumeData;
  note?: string;
}

export interface ResumeProfile {
  id: string;
  name: string;
  targetRole: string;
  targetJobDescription?: string; // New: Full JD text
  updatedAt: number;
  versions: ResumeVersion[];
}

export interface AnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  jdMatchAnalysis?: string; // New: Specific analysis against JD
  suggestions: {
    section: 'summary' | 'experience' | 'projects';
    index: number;
    subIndex?: number;
    advice: string;
    currentContent: string;
    rewrittenContent: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface InterviewFeedback {
  score: number;
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
}
