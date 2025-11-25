
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ResumeData, Language, InterviewFeedback, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

// --- File Parsing ---

export const parseResumeFile = async (base64Data: string, mimeType: string): Promise<ResumeData> => {
    const prompt = `
      Extract the resume information from this document into a structured JSON format.
      Map the content to the following structure strictly.
      
      Rules:
      1. Extract personal info (name, email, phone, location, etc.).
      2. Summarize the professional summary into bullet points.
      3. Extract education, experience, and projects.
      4. Auto-generate a list of 'tags' based on skills found.
      5. If dates are missing, estimate or leave blank.
      
      Return ONLY the JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: base64Data } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        personalInfo: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                email: { type: Type.STRING },
                                phone: { type: Type.STRING },
                                location: { type: Type.STRING },
                                role: { type: Type.STRING },
                                age: { type: Type.NUMBER, nullable: true },
                                gender: { type: Type.STRING, nullable: true }
                            }
                        },
                        summary: { type: Type.ARRAY, items: { type: Type.STRING } },
                        education: {
                            type: Type.OBJECT,
                            properties: {
                                school: { type: Type.STRING },
                                degree: { type: Type.STRING },
                                duration: { type: Type.STRING },
                                details: { type: Type.ARRAY, items: { type: Type.STRING } }
                            }
                        },
                        experience: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    company: { type: Type.STRING },
                                    role: { type: Type.STRING },
                                    duration: { type: Type.STRING },
                                    details: { type: Type.ARRAY, items: { type: Type.STRING } }
                                }
                            }
                        },
                        projects: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    role: { type: Type.STRING },
                                    duration: { type: Type.STRING },
                                    description: { type: Type.STRING }
                                }
                            }
                        },
                        certificates: { type: Type.ARRAY, items: { type: Type.STRING } },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                    }
                }
            }
        });
        
        const text = response.text;
        if (!text) throw new Error("Empty response");
        return JSON.parse(text) as ResumeData;
    } catch (e) {
        console.error("Parse failed", e);
        throw new Error("Failed to parse document. Please ensure it is a clear PDF or Image.");
    }
};

// --- Existing Functions ---

export const generateTags = async (resume: ResumeData, lang: Language): Promise<string[]> => {
  const prompt = `
    Generate 5 professional skill tags/keywords for this resume.
    Language: ${lang === 'zh' ? 'Chinese' : 'English'}.
    Output format: JSON array of strings.
    Resume: ${JSON.stringify(resume.experience || [])}
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
      }
    });
    const res = JSON.parse(response.text || "[]");
    return Array.isArray(res) ? res : [];
  } catch (e) {
    return ["Banking", "Finance", "Sales"];
  }
};

export const analyzeResumeWithGemini = async (
  resume: ResumeData, 
  targetRole: string, 
  lang: Language,
  jobDescription?: string
): Promise<AnalysisResult> => {
  
  const jdContext = jobDescription 
    ? `SPECIFIC JOB DESCRIPTION:\n"${jobDescription}"\n\nAnalyze the resume STRICTLY against the requirements in the Job Description above.` 
    : `Target Role Title: ${targetRole}. (No specific JD provided, use general industry standards for this role).`;

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
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            jdMatchAnalysis: { type: Type.STRING, description: "A brief paragraph explaining the fit between resume and JD" },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  section: { type: Type.STRING, enum: ['summary', 'experience', 'projects'] },
                  index: { type: Type.INTEGER, description: "Index of the item in the array to replace" },
                  subIndex: { type: Type.INTEGER, description: "Index of the detail bullet point (only for experience)" },
                  advice: { type: Type.STRING },
                  currentContent: { type: Type.STRING },
                  rewrittenContent: { type: Type.STRING, description: "The optimized version of the text" }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    const parsed = JSON.parse(text) as Partial<AnalysisResult>;
    
    return {
        score: parsed.score || 0,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
        jdMatchAnalysis: parsed.jdMatchAnalysis || "Analysis complete.",
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : []
    };

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const createInterviewSession = (targetRole: string, lang: Language, jobDescription?: string) => {
  const jdContext = jobDescription 
    ? `The candidate is applying for the following specific job:\n"${jobDescription}"\nAsk questions specifically related to these requirements.` 
    : `The candidate is applying for the role: ${targetRole}.`;

  const sysInstruction = `
    You are a strict technical and behavioral interviewer.
    ${jdContext}
    Language: ${lang === 'zh' ? 'Chinese' : 'English'}.
    
    Goal: Assess if the candidate is a good fit for THIS specific job.
    1. Start by introducing yourself as the Hiring Manager for the position.
    2. Ask one question at a time.
    3. Dig deep into their experience mentioned in the resume if it relates to the JD.
    4. Be professional but challenging.
  `;

  return ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: sysInstruction,
    }
  });
};

export const generateInterviewFeedback = async (history: ChatMessage[], lang: Language): Promise<InterviewFeedback> => {
  const conversation = history.map(m => `${m.role}: ${m.text}`).join('\n');
  
  const prompt = `
    Analyze this interview transcript.
    Language: ${lang === 'zh' ? 'Chinese' : 'English'}.
    Provide a final score and feedback regarding the candidate's suitability for the role.

    Transcript:
    ${conversation}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
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
};
