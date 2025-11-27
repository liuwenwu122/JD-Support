
import React from 'react';
import { AnalysisResult, Language } from '../types';
import { AlertCircle, CheckCircle, TrendingUp, Lightbulb, Wand2, Target } from 'lucide-react';

interface AnalysisPanelProps {
  analysis: AnalysisResult | null;
  isLoading: boolean;
  onAnalyze: () => void;
  onApplySuggestion: (section: string, index: number, subIndex: number | undefined, newContent: string) => void;
  language: Language;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ 
  analysis, 
  isLoading, 
  onAnalyze, 
  onApplySuggestion,
  language 
}) => {
  const labels = {
    start: language === 'zh' ? "开始 JD 匹配诊断" : "Start JD Analysis",
    analyzing: language === 'zh' ? "正在对比目标职位..." : "Matching against JD...",
    score: language === 'zh' ? "人岗匹配度" : "JD Match Score",
    strengths: language === 'zh' ? "匹配优势" : "Matched Strengths",
    weaknesses: language === 'zh' ? "JD 缺口 / 劣势" : "Gaps / Missing Keywords",
    suggestions: language === 'zh' ? "JD 定向优化建议" : "Tailored Suggestions",
    apply: language === 'zh' ? "应用修改" : "Apply Change",
    applied: language === 'zh' ? "已应用" : "Applied",
    original: language === 'zh' ? "优化前" : "Original",
    optimized: language === 'zh' ? "优化后" : "Optimized",
    intro: language === 'zh' 
        ? "Gemini 将深度对比您的简历与【目标职位 JD】，找出技能缺口并提供定向优化方案。" 
        : "Gemini will deeply analyze your resume against the specific 【Target Job Description】 to find gaps."
  };

  if (!analysis && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="bg-blue-50 p-6 rounded-full mb-6 relative">
          <Lightbulb size={64} className="text-blue-600" />
          <Target size={32} className="text-red-500 absolute -bottom-2 -right-2 bg-white rounded-full p-1" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Goal-Driven AI Diagnosis</h2>
        <p className="text-gray-500 mb-8 max-w-md text-lg leading-relaxed">
          {labels.intro}
        </p>
        <button
          onClick={onAnalyze}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-10 rounded-full transition-all transform hover:scale-105 shadow-xl flex items-center gap-3 text-lg"
        >
          <TrendingUp size={24} />
          {labels.start}
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-12 bg-white rounded-xl shadow-sm">
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mb-6"></div>
        <h3 className="text-2xl font-medium text-gray-700 animate-pulse">{labels.analyzing}</h3>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-8 pb-12">
      {/* Score Card */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-xl flex items-center justify-between relative overflow-hidden">
        <div className="relative z-10 max-w-[60%]">
          <h2 className="text-2xl font-semibold opacity-90 mb-1 flex items-center gap-2">
            <Target size={24} className="text-blue-300"/> {labels.score}
          </h2>
          <p className="text-blue-200 text-sm mt-2 opacity-80 leading-relaxed">
             {analysis.jdMatchAnalysis || "Based on the provided Job Description."}
          </p>
        </div>
        <div className="flex items-baseline gap-2 relative z-10">
            <span className={`text-7xl font-bold tracking-tighter ${analysis.score > 80 ? 'text-green-300' : analysis.score > 60 ? 'text-yellow-300' : 'text-red-300'}`}>
                {analysis.score}
            </span>
            <span className="text-2xl opacity-60 font-light">/ 100</span>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-green-50 border border-green-100 rounded-xl p-6">
          <h3 className="text-green-800 font-bold mb-4 flex items-center gap-2 text-lg">
            <CheckCircle size={20} /> {labels.strengths}
          </h3>
          <ul className="space-y-3">
            {analysis.strengths?.map((s, i) => (
              <li key={i} className="text-green-800 text-sm flex items-start gap-3 bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                <span className="mt-1.5 block min-w-[6px] h-[6px] rounded-full bg-green-500 shrink-0"></span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-red-50 border border-red-100 rounded-xl p-6">
          <h3 className="text-red-800 font-bold mb-4 flex items-center gap-2 text-lg">
            <AlertCircle size={20} /> {labels.weaknesses}
          </h3>
          <ul className="space-y-3">
            {analysis.weaknesses?.map((w, i) => (
              <li key={i} className="text-red-800 text-sm flex items-start gap-3 bg-white p-3 rounded-lg border border-red-100 shadow-sm">
                <span className="mt-1.5 block min-w-[6px] h-[6px] rounded-full bg-red-500 shrink-0"></span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed Suggestions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-8 py-5 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Wand2 className="text-purple-600" size={24} /> {labels.suggestions}
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {analysis.suggestions?.map((item, index) => (
            <div key={index} className="p-8 hover:bg-gray-50 transition-colors">
              
              {/* Header: Section Tag + Advice */}
              <div className="mb-4">
                  <span className="text-xs font-bold uppercase tracking-wide text-blue-700 bg-blue-100 px-2.5 py-1 rounded border border-blue-200 mr-2">
                    {item.section}
                  </span>
                  <span className="text-gray-800 font-medium text-lg">{item.advice}</span>
              </div>

              {/* Comparison View */}
              {item.rewrittenContent && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                    {/* Before */}
                    <div className="border border-red-100 bg-red-50/30 rounded-lg p-4">
                        <div className="text-red-500 text-xs font-bold uppercase mb-2 flex items-center gap-1">
                            {labels.original}
                        </div>
                        <p className="text-sm text-gray-600 line-through decoration-red-300 decoration-2 font-mono leading-relaxed">
                            {item.currentContent || "(Original content not found)"}
                        </p>
                    </div>

                    {/* After */}
                    <div className="border border-green-100 bg-green-50/50 rounded-lg p-4 relative">
                         <div className="text-green-600 text-xs font-bold uppercase mb-2 flex items-center gap-1">
                            {labels.optimized}
                        </div>
                        <p className="text-sm text-gray-800 font-medium leading-relaxed font-mono">
                            {item.rewrittenContent}
                        </p>

                        <button
                            onClick={(e) => {
                                const btn = e.currentTarget;
                                btn.innerText = labels.applied;
                                btn.classList.add('bg-gray-400', 'cursor-not-allowed');
                                btn.classList.remove('bg-purple-600', 'hover:bg-purple-700');
                                btn.disabled = true;
                                onApplySuggestion(item.section, item.index, item.subIndex, item.rewrittenContent);
                            }}
                            className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md transition-all shadow-md hover:shadow-lg"
                        >
                            <Wand2 size={14} /> {labels.apply}
                        </button>
                    </div>
                </div>
              )}
            </div>
          ))}
          {(!analysis.suggestions || analysis.suggestions.length === 0) && (
              <div className="p-8 text-center text-gray-400">
                  No specific suggestions found. Matches JD well!
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
