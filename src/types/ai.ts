export type AIProvider = 'gemini' | 'openai';

export interface AISettings {
    provider: AIProvider;
    apiKey: string;
    modelName: string;
    baseUrl?: string; // For OpenAI compatible (e.g., DeepSeek, Ollama)
}

export const DEFAULT_AI_SETTINGS: AISettings = {
    provider: (import.meta as any).env.VITE_AI_PROVIDER as AIProvider || 'gemini',
    apiKey: (import.meta as any).env.VITE_AI_API_KEY || '',
    modelName: (import.meta as any).env.VITE_AI_MODEL_NAME || 'gemini-2.5-flash',
    baseUrl: (import.meta as any).env.VITE_AI_BASE_URL || 'https://api.openai.com/v1'
};

export type AIChatSession = any;
