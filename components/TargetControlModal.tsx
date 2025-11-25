
import React, { useState, useEffect } from 'react';
import { X, Target, FileText, ArrowRight } from 'lucide-react';
import { Language } from '../types';

interface TargetControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, jd: string) => void;
  initialTitle?: string;
  initialJd?: string;
  language: Language;
  mode: 'create' | 'edit';
}

const TargetControlModal: React.FC<TargetControlModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialTitle = '', 
  initialJd = '', 
  language,
  mode
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [jd, setJd] = useState(initialJd);

  useEffect(() => {
    if (isOpen) {
        setTitle(initialTitle);
        setJd(initialJd);
    }
  }, [isOpen, initialTitle, initialJd]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-0 overflow-hidden transform transition-all scale-100 m-4 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-start shrink-0">
          <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Target className="text-blue-200" />
                {mode === 'create' 
                  ? (language === 'zh' ? '设置求职目标' : 'Set Your Goal')
                  : (language === 'zh' ? '调整求职目标' : 'Adjust Career Goal')
                }
              </h3>
              <p className="text-blue-100 text-sm mt-1 opacity-90">
                {language === 'zh' 
                 ? 'Gemini AI 将根据您的目标职位和JD为您提供精准的诊断与优化建议。' 
                 : 'Gemini AI uses your target role and Job Description (JD) to provide tailored optimization.'}
              </p>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto">
          {/* Target Role Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
               <div className="w-1 h-4 bg-blue-600 rounded-full"></div>
               {language === 'zh' ? '目标职位名称' : 'Target Job Title'}
            </label>
            <input
              type="text"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg font-medium placeholder-gray-400"
              placeholder={language === 'zh' ? '例如：高级客户经理、Java开发工程师' : 'e.g. Senior Product Manager'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* JD Input */}
          <div className="mb-2">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
               <div className="w-1 h-4 bg-purple-600 rounded-full"></div>
               {language === 'zh' ? '职位描述 (JD)' : 'Job Description (JD)'}
            </label>
            <div className="relative">
                <textarea
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all min-h-[200px] text-sm leading-relaxed placeholder-gray-400 resize-none bg-gray-50 focus:bg-white"
                placeholder={language === 'zh' 
                    ? '粘贴您想申请的职位的具体要求（JD）。AI 将对比您的简历与此JD的匹配度...' 
                    : 'Paste the specific Job Description here. AI will match your resume against these requirements...'}
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                />
                <div className="absolute top-4 right-4 text-gray-400 pointer-events-none">
                    <FileText size={20} />
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-right">
                {language === 'zh' ? '越详细的JD，优化效果越精准' : 'Detailed JD = Better AI Results'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-600 hover:bg-gray-200 rounded-xl font-medium transition-colors"
          >
            {language === 'zh' ? '跳过 / 取消' : 'Skip / Cancel'}
          </button>
          <button
            onClick={() => onSave(title, jd)}
            disabled={!title.trim()}
            className={`px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${!title.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {mode === 'create' 
                ? (language === 'zh' ? '创建并开始' : 'Create & Start')
                : (language === 'zh' ? '保存设置' : 'Update Goal')
            }
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TargetControlModal;
