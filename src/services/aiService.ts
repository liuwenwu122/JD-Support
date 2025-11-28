import { AnalysisResult, ResumeData, Language, InterviewFeedback, ChatMessage } from "../types";
import { AISettings, AIChatSession } from "../types/ai";
import { StrategyFactory } from "./ai/StrategyFactory";

export type { AIChatSession };

export const parseResumeFile = async (base64Data: string, mimeType: string, settings?: AISettings): Promise<ResumeData> => {
  const strategy = StrategyFactory.getStrategy(settings);
  return strategy.parseResume(base64Data, mimeType, settings);
};

export const generateTags = async (resume: ResumeData, lang: Language, settings?: AISettings): Promise<string[]> => {
  const strategy = StrategyFactory.getStrategy(settings);
  return strategy.generateTags(resume, lang, settings);
};

export const analyzeResume = async (
  resume: ResumeData,
  targetRole: string,
  lang: Language,
  jobDescription?: string,
  settings?: AISettings
): Promise<AnalysisResult> => {
  const strategy = StrategyFactory.getStrategy(settings);
  return strategy.analyzeResume(resume, targetRole, lang, jobDescription, settings);
};

export const createInterviewSession = (targetRole: string, lang: Language, jobDescription?: string, settings?: AISettings): Promise<AIChatSession> => {
  const strategy = StrategyFactory.getStrategy(settings);
  return strategy.createInterviewSession(targetRole, lang, jobDescription, settings);
};

export const generateInterviewFeedback = async (history: ChatMessage[], lang: Language, settings?: AISettings): Promise<InterviewFeedback> => {
  const strategy = StrategyFactory.getStrategy(settings);
  return strategy.generateInterviewFeedback(history, lang, settings);
};
