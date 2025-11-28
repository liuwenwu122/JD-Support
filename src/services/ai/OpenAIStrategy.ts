import OpenAI from "openai";
import { AnalysisResult, ResumeData, Language, InterviewFeedback, ChatMessage } from "../../types";
import { AISettings, AIChatSession } from "../../types/ai";
import { AIStrategy } from "./AIStrategy";

export class OpenAIStrategy implements AIStrategy {
    private getClient(settings: AISettings): OpenAI {
        if (!settings.apiKey) throw new Error("API Key is required for OpenAI compatible providers");

        let baseURL = settings.baseUrl || "https://api.openai.com/v1";
        // Sanitize URL: remove trailing slash
        if (baseURL.endsWith('/')) {
            baseURL = baseURL.slice(0, -1);
        }

        return new OpenAI({
            apiKey: settings.apiKey,
            baseURL: baseURL,
            dangerouslyAllowBrowser: true // Required for client-side usage
        });
    }

    private parseJSON(text: string): any {
        try {
            // First try direct parse
            return JSON.parse(text);
        } catch (e) {
            // Try to extract JSON from code blocks or text
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                try {
                    return JSON.parse(jsonMatch[0]);
                } catch (e2) {
                    // Continue to next attempt
                }
            }

            // Try cleaning markdown code blocks
            const cleanText = text.replace(/```json\s*|\s*```/g, '').trim();
            try {
                return JSON.parse(cleanText);
            } catch (e3) {
                console.error("Failed to parse JSON:", text);
                throw new Error("Failed to parse AI response as JSON");
            }
        }
    }

    /**
     * Parse resume from base64 data
     * @param base64Data
     * @param mimeType
     * @param settings 
     * @returns 
     */
    async parseResume(base64Data: string, mimeType: string, settings?: AISettings): Promise<ResumeData> {
        const client = this.getClient(settings!);
        const promptText = `
            Extract the resume information from this document into a structured JSON format.
            Map the content to the following structure strictly.
            
            Rules:
            1. Extract personal info (name, email, phone, location, etc.).
            2. Summarize the professional summary into bullet points.
            3. Extract education, experience, and projects.
            4. Auto-generate a list of 'tags' based on skills found.
            5. If dates are missing, estimate or leave blank.
            
            Return ONLY the raw JSON string, no markdown formatting.
        `;

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: "user",
                content: [
                    { type: "text", text: promptText },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${mimeType};base64,${base64Data}`
                        }
                    }
                ]
            }
        ];

        const completion = await client.chat.completions.create({
            model: settings?.modelName || "gpt-4o",
            messages: messages,
            max_tokens: 4096,
            temperature: 0.7,
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content || "";
        return this.parseJSON(content);
    }

    /**
     * Generate tags for resume
     * @param resume
     * @param lang
     * @param settings
     * @returns
     */
    async generateTags(resume: ResumeData, lang: Language, settings?: AISettings): Promise<string[]> {
        const client = this.getClient(settings!);
        const prompt = `
            Generate 5 professional skill tags/keywords for this resume.
            Language: ${lang === 'zh' ? 'Chinese' : 'English'}.
            Output format: JSON array of strings (e.g. ["Java", "Spring Boot"]).
            Resume: ${JSON.stringify(resume.experience || [])}
            RETURN ONLY JSON.
        `;

        try {
            const completion = await client.chat.completions.create({
                model: settings?.modelName || "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                response_format: { type: "json_object" },
            });

            const content = completion.choices[0]?.message?.content || "";

            // For arrays, we need a slightly different extraction if the generic one fails, 
            // but parseJSON looking for { ... } might miss [ ... ]. 
            // Let's handle array parsing specifically here or update parseJSON.
            // Updating parseJSON to handle arrays would be better, but for now let's handle it here safely.
            const cleanRes = content.replace(/```json\s*|\s*```/g, '').trim();
            const start = cleanRes.indexOf('[');
            const end = cleanRes.lastIndexOf(']');
            if (start !== -1 && end !== -1) {
                const json = JSON.parse(cleanRes.substring(start, end + 1));
                return Array.isArray(json) ? json : [];
            }
            return [];
        } catch (e) {
            console.error(e);
            return ["Banking", "Finance", "Sales"];
        }
    }

    /**
     * Analyze resume
     * @param resume
     * @param targetRole
     * @param lang
     * @param jobDescription
     * @param settings
     * @returns
     */
    async analyzeResume(resume: ResumeData, targetRole: string, lang: Language, jobDescription?: string, settings?: AISettings): Promise<AnalysisResult> {
        const client = this.getClient(settings!);
        const jdContext = jobDescription
            ? `SPECIFIC JOB DESCRIPTION:\n"${jobDescription}"\n\nAnalyze the resume STRICTLY against the requirements in the Job Description above.`
            : `Target Role Title: ${targetRole}. (No specific JD provided, use general industry standards for this role).`;

        // const response_format = {
        //     "score": { type: "number", description: "Job Match Score (0-100)" },
        //     "strengths": { type: "array", items: { type: "string" }, description: "Key strengths regarding the JD" },
        //     "weaknesses": { type: "array", items: { type: "string" }, description: "Missing keywords or weaknesses regarding the JD" },
        //     "jdMatchAnalysis": { type: "string", description: "Analysis of how well the resume fits the target role" },
        //     "suggestions": { type: "array", items: { type: "object", properties: { section: { type: "string" }, index: { type: "number" }, subIndex: { type: "number" }, advice: { type: "string" }, currentContent: { type: "string" }, rewrittenContent: { type: "string" } } }, description: "Specific suggestions to make the resume tailored to this job" }
        // }
        const prompt = `
            You are a professional career coach and recruiter.
            Language of output: ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
            
            ${jdContext}
            
            Task:
            1. Calculate a "Job Match Score" (0-100) based on how well the resume fits the target.
            2. Identify key strengths regarding the JD.
            3. Identify missing keywords or weaknesses regarding the JD.
            4. Provide specific "rewrittenContent" to make the resume tailored to this job. 
               - Use keywords from the JD.
               - Quantify achievements.
            
            IMPORTANT:
            - If you suggest changing a bullet point in Experience, provide 'section': 'experience', 'index': (index of job), 'subIndex': (index of bullet).
            - If you suggest changing Summary, provide 'section': 'summary', 'index': (index of line).
            - If you suggest changing Project description, provide 'section': 'projects', 'index': (index of project).
        
            Resume Data:
            ${JSON.stringify(resume)}
        
            RETURN JSON ONLY. Structure:
            {
                "score": number,
                "strengths": string[],
                "weaknesses": string[],
                "jdMatchAnalysis": string,
                "suggestions": [
                    { "section": "experience", "index": 0, "subIndex": 0, "advice": "...", "currentContent": "...", "rewrittenContent": "..." }
                ]
            }
        `;

        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            { role: "system", content: "You are a helpful career assistant. Always return valid JSON." },
            { role: "user", content: prompt }
        ];

        const completion = await client.chat.completions.create({
            model: settings?.modelName || "gpt-4o",
            messages: messages,
            temperature: 0.7,
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content || "";
        const parsed = this.parseJSON(content);
        return {
            score: parsed.score || 0,
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
            weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
            jdMatchAnalysis: parsed.jdMatchAnalysis || "Analysis complete.",
            suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
        };
    }

    /**
     * Create interview session
     * @param targetRole 
     * @param lang 
     * @param jobDescription 
     * @param settings 
     */
    async createInterviewSession(targetRole: string, lang: Language, jobDescription?: string, settings?: AISettings): Promise<AIChatSession> {
        throw new Error("Interview mode currently supports Gemini only. Please switch provider in settings.");
    }

    /**
     * Generate interview feedback
     * @param history 
     * @param lang 
     * @param settings 
     * @returns 
     */
    async generateInterviewFeedback(history: ChatMessage[], lang: Language, settings?: AISettings): Promise<InterviewFeedback> {
        const client = this.getClient(settings!);
        const conversation = history.map(m => `${m.role}: ${m.text}`).join('\n');

        const prompt = `
            Analyze this interview transcript.
            Language: ${lang === 'zh' ? 'Chinese' : 'English'}.
            Provide a final score and feedback regarding the candidate's suitability for the role.
        
            Transcript:
            ${conversation}
            
            RETURN JSON ONLY.
        `;

        try {
            const completion = await client.chat.completions.create({
                model: settings?.modelName || "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                response_format: { type: "json_object" },
            });

            const content = completion.choices[0]?.message?.content || "";
            const parsed = this.parseJSON(content);
            return {
                score: parsed.score || 0,
                summary: parsed.summary || "",
                strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
                areasForImprovement: Array.isArray(parsed.areasForImprovement) ? parsed.areasForImprovement : []
            };
        } catch (e) {
            return {
                score: 0,
                summary: "Failed to generate feedback.",
                strengths: [],
                areasForImprovement: []
            };
        }
    }
}
