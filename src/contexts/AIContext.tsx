import React, { createContext, useContext, useState, useEffect } from 'react';
import { AISettings, DEFAULT_AI_SETTINGS } from '../types/ai';

interface AIContextType {
    settings: AISettings;
    updateSettings: (newSettings: AISettings) => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<AISettings>(() => {
        const stored = localStorage.getItem('careerlift_ai_settings');
        return stored ? JSON.parse(stored) : DEFAULT_AI_SETTINGS;
    });

    useEffect(() => {
        localStorage.setItem('careerlift_ai_settings', JSON.stringify(settings));
    }, [settings]);

    const updateSettings = (newSettings: AISettings) => {
        setSettings(newSettings);
    };

    return (
        <AIContext.Provider value={{ settings, updateSettings }}>
            {children}
        </AIContext.Provider>
    );
};

export const useAI = () => {
    const context = useContext(AIContext);
    if (context === undefined) {
        throw new Error('useAI must be used within an AIProvider');
    }
    return context;
};
