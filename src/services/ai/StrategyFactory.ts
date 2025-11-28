import { AISettings } from "../../types/ai";
import { AIStrategy } from "./AIStrategy";
import { GeminiStrategy } from "./GeminiStrategy";
import { OpenAIStrategy } from "./OpenAIStrategy";

export class StrategyFactory {
    static getStrategy(settings?: AISettings): AIStrategy {
        const provider = settings?.provider || 'gemini';

        if (provider === 'openai') {
            return new OpenAIStrategy();
        }

        // Default to Gemini
        return new GeminiStrategy();
    }
}
