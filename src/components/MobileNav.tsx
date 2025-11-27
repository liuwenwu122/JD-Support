import React from 'react';
import { FileText, Activity, Briefcase } from 'lucide-react';
import { Language } from '../types';

interface MobileNavProps {
    activeTab: 'resume' | 'analysis' | 'interview';
    setActiveTab: (tab: 'resume' | 'analysis' | 'interview') => void;
    language: Language;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, setActiveTab, language }) => {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                <button
                    onClick={() => setActiveTab('resume')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'resume' ? 'text-blue-600' : 'text-gray-500'
                        }`}
                >
                    <FileText size={20} />
                    <span className="text-xs font-medium">{language === 'zh' ? '简历' : 'Resume'}</span>
                </button>

                <button
                    onClick={() => setActiveTab('analysis')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'analysis' ? 'text-purple-600' : 'text-gray-500'
                        }`}
                >
                    <Activity size={20} />
                    <span className="text-xs font-medium">{language === 'zh' ? '诊断' : 'Analysis'}</span>
                </button>

                <button
                    onClick={() => setActiveTab('interview')}
                    className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${activeTab === 'interview' ? 'text-indigo-600' : 'text-gray-500'
                        }`}
                >
                    <Briefcase size={20} />
                    <span className="text-xs font-medium">{language === 'zh' ? '面试' : 'Interview'}</span>
                </button>
            </div>
        </div>
    );
};

export default MobileNav;
