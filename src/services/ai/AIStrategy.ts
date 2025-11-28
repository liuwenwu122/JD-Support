import { AnalysisResult, ResumeData, Language, InterviewFeedback, ChatMessage } from "../../types";
import { AISettings, AIChatSession } from "../../types/ai";

export interface AIStrategy {
    /**
     * Parse the resume based on the target role and job description.
     * @param base64Data The base64 encoded resume data.
     * @param mimeType The mime type of the resume data.
     * @param settings The settings for the parsing.
     */
    parseResume(base64Data: string, mimeType: string, settings?: AISettings): Promise<ResumeData>;
    
    /**
     * Generate tags for the resume based on the target role and job description.
     * @param resume The resume data to generate tags for.
     * @param lang The language of the resume.
     * @param settings The settings for the tag generation.
     */
    generateTags(resume: ResumeData, lang: Language, settings?: AISettings): Promise<string[]>;
    
    /**
     * Analyze the resume based on the target role and job description.
     * @param resume The resume data to analyze.
     * @param targetRole The target role for the resume.
     * @param lang The language of the resume.
     * @param jobDescription The job description for the resume.
     * @param settings The settings for the analysis.
     */
    analyzeResume(
        resume: ResumeData,
        targetRole: string,
        lang: Language,
        jobDescription?: string,
        settings?: AISettings
    ): Promise<AnalysisResult>;
    
    /**
     * Create an interview session based on the target role and job description.
     * @param targetRole The target role for the interview session.
     * @param lang The language of the interview session.
     * @param jobDescription The job description for the interview session.
     * @param settings The settings for the interview session.
     */
    createInterviewSession(
        targetRole: string,
        lang: Language,
        jobDescription?: string,
        settings?: AISettings
    ): Promise<AIChatSession>;
   
    /**
     * Generate interview feedback based on the chat history.
     * @param history The chat history for the interview session.
     * @param lang The language of the interview session.
     * @param settings The settings for the interview session.
     */
    generateInterviewFeedback(
        history: ChatMessage[],
        lang: Language,
        settings?: AISettings
    ): Promise<InterviewFeedback>;
}
