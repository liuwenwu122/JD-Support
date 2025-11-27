import React, { useState, useEffect } from 'react';
import { X, Save, Settings, AlertCircle } from 'lucide-react';
import { useAI } from '../contexts/AIContext';
import { Language } from '../types';
import { AISettings } from '../types/ai';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, language }) => {
    const { settings, updateSettings } = useAI();
    const [formData, setFormData] = useState<AISettings>(settings);

    useEffect(() => {
        if (isOpen) {
            setFormData(settings);
        }
    }, [isOpen, settings]);

    if (!isOpen) return null;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        updateSettings(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings className="text-blue-600" size={24} />
                        {language === 'zh' ? 'AI 模型设置' : 'AI Model Settings'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-6">
                    {/* Provider Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === 'zh' ? 'AI 提供商' : 'AI Provider'}
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, provider: 'gemini' })}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.provider === 'gemini'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Google Gemini
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, provider: 'openai' })}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.provider === 'openai'
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                OpenAI Compatible
                            </button>
                        </div>
                    </div>

                    {/* API Key */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            API Key
                        </label>
                        <input
                            type="password"
                            value={formData.apiKey}
                            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                            placeholder={formData.provider === 'gemini' ? "Leave empty to use default env key" : "sk-..."}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {language === 'zh'
                                ? '您的 Key 仅存储在本地浏览器中，不会上传到服务器。'
                                : 'Your key is stored locally in your browser and never sent to our servers.'}
                        </p>
                    </div>

                    {/* Model Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {language === 'zh' ? '模型名称' : 'Model Name'}
                        </label>
                        <input
                            type="text"
                            value={formData.modelName}
                            onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                            placeholder={formData.provider === 'gemini' ? "gemini-2.5-flash" : "gpt-3.5-turbo"}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* Base URL (OpenAI Only) */}
                    {formData.provider === 'openai' && (
                        <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Base URL
                            </label>
                            <input
                                type="text"
                                value={formData.baseUrl}
                                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                                placeholder="https://api.openai.com/v1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                            <div className="mt-2 p-3 bg-yellow-50 rounded-lg flex gap-2 text-xs text-yellow-700 border border-yellow-100">
                                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                <p>
                                    {language === 'zh'
                                        ? '支持 DeepSeek, Ollama, LocalAI 等兼容 OpenAI 协议的服务。'
                                        : 'Supports DeepSeek, Ollama, LocalAI and other OpenAI compatible services.'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            {language === 'zh' ? '取消' : 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Save size={18} />
                            {language === 'zh' ? '保存设置' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsModal;
