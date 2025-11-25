
import React, { useRef, useState } from 'react';
import { ResumeProfile, Language, ResumeData } from '../types';
import { Plus, FileText, Trash2, Upload, Calendar, Briefcase, Clock, Loader2, FileUp, Target } from 'lucide-react';
import { parseResumeFile } from '../services/geminiService';
import TargetControlModal from './TargetControlModal';

interface DashboardProps {
  profiles: ResumeProfile[];
  onSelect: (id: string) => void;
  onCreate: (name: string, data: ResumeData, role: string, jd: string) => void;
  onImport: (data: ResumeData, name: string) => void; // Legacy simple import kept for drag/drop
  onDelete: (id: string) => void;
  language: Language;
}

const Dashboard: React.FC<DashboardProps> = ({ profiles, onSelect, onCreate, onImport, onDelete, language }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<{data: ResumeData, name: string} | null>(null);

  // Flow: 
  // 1. User clicks "Create New" -> Show Modal -> On Save -> onCreate(empty resume)
  // 2. User clicks "Import" -> Parse File -> Show Modal (pre-fill info?) -> On Save -> onCreate(parsed resume)

  const handleStartCreate = () => {
     setPendingImportData(null); // Clear any import
     setShowGoalModal(true);
  };

  const handleGoalSave = (role: string, jd: string) => {
      if (pendingImportData) {
          // Finish import flow with goal
          onCreate(pendingImportData.name, pendingImportData.data, role, jd);
      } else {
          // Create blank
          const name = language === 'zh' ? `${role} 简历` : `${role} Resume`;
          onCreate(name, {} as ResumeData, role, jd); // App.tsx handles the default data
      }
      setShowGoalModal(false);
      setPendingImportData(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "application/json") {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                setPendingImportData({ data: json, name: file.name.replace('.json', '') });
                setShowGoalModal(true); // Ask for goal after parse
            } catch (err) {
                alert("Failed to parse JSON.");
            }
        };
        reader.readAsText(file);
        return;
    }

    setIsParsing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
            const parsedData = await parseResumeFile(base64String, file.type);
            setPendingImportData({ data: parsedData, name: file.name.split('.')[0] });
            setShowGoalModal(true); // Ask for goal after parse
        } catch (error) {
            console.error(error);
            alert("Failed to parse document.");
        } finally {
            setIsParsing(false);
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500 relative">
      
      {/* Goal Modal */}
      <TargetControlModal 
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onSave={handleGoalSave}
        language={language}
        mode="create"
        initialTitle={pendingImportData?.data?.personalInfo?.role || ''}
      />

      {/* Loading Overlay */}
      {isParsing && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
             <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center text-center max-w-sm">
                <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">AI is reading your resume...</h3>
                <p className="text-gray-500 text-sm">
                    {language === 'zh' 
                     ? '正在利用 Gemini Vision 提取您的简历内容，请稍候...' 
                     : 'Extracting structure and content using Gemini Vision capabilities. This may take a few seconds.'}
                </p>
             </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-200 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {language === 'zh' ? '我的简历库' : 'My Resume Library'}
          </h1>
          <p className="text-slate-500">
            {language === 'zh' 
             ? '管理、优化并追踪不同版本的简历' 
             : 'Manage, optimize, and track versions of your resumes'}
          </p>
        </div>
        <div className="flex gap-3">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".json, .pdf, image/png, image/jpeg, image/jpg" 
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium"
            disabled={isParsing}
          >
            <FileUp size={18} />
            {language === 'zh' ? '导入 PDF/文档' : 'Import Resume'}
          </button>
          <button 
            onClick={handleStartCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md font-medium"
            disabled={isParsing}
          >
            <Plus size={18} />
            {language === 'zh' ? '新建简历' : 'Create New'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <div 
            key={profile.id} 
            className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 overflow-hidden flex flex-col h-64 relative"
          >
            <div className="p-6 flex-1 cursor-pointer" onClick={() => onSelect(profile.id)}>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText size={24} />
                </div>
                <div className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full font-mono flex items-center gap-1">
                  <Clock size={10} />
                  v{profile.versions.length}.0
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 mb-2 truncate group-hover:text-blue-600 transition-colors">
                {profile.name}
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-slate-700 font-medium mb-1">
                <Target size={16} className="text-blue-500" />
                <span className="truncate max-w-[200px]">{profile.targetRole || 'General'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Calendar size={12} />
                <span>Updated: {new Date(profile.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 px-6 py-3 bg-gray-50 flex justify-between items-center">
              <span className="text-xs text-slate-400">
                {profile.versions.length} {language === 'zh' ? '个历史版本' : 'Versions stored'}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(profile.id); }}
                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {/* Empty State / Add New Placeholder */}
        {profiles.length === 0 && (
           <div 
             onClick={handleStartCreate}
             className="border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/10 cursor-pointer h-64 transition-all"
           >
             <Plus size={48} className="mb-4 opacity-50" />
             <span className="font-medium text-lg">
               {language === 'zh' ? '创建第一份简历' : 'Create your first resume'}
             </span>
           </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
