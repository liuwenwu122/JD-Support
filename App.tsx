
import React, { useState, useEffect } from 'react';
import { createNewProfile } from './constants';
import { AnalysisResult, Language, ResumeData, ResumeProfile, ResumeVersion } from './types';
import { analyzeResumeWithGemini, generateTags } from './services/geminiService';
import { db } from './services/dbService';
import ResumeView from './components/ResumeView';
import AnalysisPanel from './components/AnalysisPanel';
import InterviewBot from './components/InterviewBot';
import Dashboard from './components/Dashboard';
import VersionHistory from './components/VersionHistory';
import SaveVersionModal from './components/SaveVersionModal';
import TargetControlModal from './components/TargetControlModal';
import { FileText, Activity, Globe, Briefcase, Tag, ChevronLeft, Save, History, Loader2, CheckCircle2, Target, PenLine } from 'lucide-react';

const App: React.FC = () => {
  // Global State
  const [profiles, setProfiles] = useState<ResumeProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resume' | 'analysis' | 'interview'>('resume');
  const [showHistory, setShowHistory] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showTargetModal, setShowTargetModal] = useState(false);
  
  // App Config State
  const [language, setLanguage] = useState<Language>('zh');
  const [isTagging, setIsTagging] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Derived State
  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const activeVersion = activeProfile?.versions.find(v => v.id === activeVersionId);
  const resumeData = activeVersion?.data;

  // --- Initial Load ---
  useEffect(() => {
      const load = async () => {
          setIsLoadingProfiles(true);
          try {
              const data = await db.getAllProfiles();
              setProfiles(data);
          } catch (e) {
              console.error(e);
          } finally {
              setIsLoadingProfiles(false);
          }
      };
      load();
  }, []);

  // Initialize selected version if profile changes
  useEffect(() => {
    if (activeProfile && !activeVersionId) {
       // Default to latest version
       const sorted = [...activeProfile.versions].sort((a, b) => b.timestamp - a.timestamp);
       setActiveVersionId(sorted[0].id);
    }
  }, [activeProfile, activeVersionId]);

  // Reset analysis when data changes (version switch)
  useEffect(() => {
    setAnalysisResult(null);
  }, [activeVersionId]);

  // Auto-hide notification
  useEffect(() => {
      if(notification) {
          const timer = setTimeout(() => setNotification(null), 3000);
          return () => clearTimeout(timer);
      }
  }, [notification]);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
      setNotification({ message: msg, type });
  };

  // --- Profile Management ---
  
  // Updated: Accepts JD and Role
  const handleCreateProfile = async (name: string, data: ResumeData, role: string, jd: string) => {
    // If data is empty (created from scratch), user enters details in editor.
    // If data is parsed, it's passed here.
    const newProfile = createNewProfile(name, Object.keys(data).length ? data : undefined, role, jd);
    await db.createProfile(newProfile);
    setProfiles(prev => [newProfile, ...prev]);
    setActiveProfileId(newProfile.id);
    setActiveVersionId(newProfile.versions[0].id);
    setActiveTab('resume');
    showNotification(language === 'zh' ? '简历创建成功' : 'Resume Created');
  };

  // Legacy wrapper for simple imports not used by new dashboard flow but kept for safety
  const handleImportProfile = async (data: ResumeData, name: string) => {
    handleCreateProfile(name, data, 'General', '');
  };

  const handleDeleteProfile = async (id: string) => {
    if (confirm(language === 'zh' ? "确定要删除这个简历吗？" : "Are you sure you want to delete this resume?")) {
      await db.deleteProfile(id);
      setProfiles(prev => prev.filter(p => p.id !== id));
      if (activeProfileId === id) setActiveProfileId(null);
    }
  };

  // --- Target/Goal Updates ---
  const handleUpdateTarget = async (title: string, jd: string) => {
      if (!activeProfile) return;
      
      const updatedProfile = { 
          ...activeProfile, 
          targetRole: title, 
          targetJobDescription: jd,
          updatedAt: Date.now() 
      };
      
      await db.updateProfile(updatedProfile);
      setProfiles(prev => prev.map(p => p.id === activeProfile.id ? updatedProfile : p));
      setShowTargetModal(false);
      
      // Clear analysis as context changed
      setAnalysisResult(null);
      showNotification(language === 'zh' ? '求职目标已更新' : 'Target Goal Updated');
  };

  // --- Version Control ---
  const saveNewVersion = async (newData: ResumeData, label?: string, note?: string) => {
    if (!activeProfile) return;

    const verLabel = label || `v${activeProfile.versions.length + 1}.0`;
    const newVersion: ResumeVersion = {
      id: `v-${Date.now()}`,
      label: verLabel,
      timestamp: Date.now(),
      data: newData,
      note: note || (language === 'zh' ? '手动保存' : 'Manual Save')
    };

    // Update Profile State
    const updatedProfile = {
      ...activeProfile,
      updatedAt: Date.now(),
      versions: [...activeProfile.versions, newVersion]
    };

    // Update Local State
    setProfiles(prev => prev.map(p => p.id === activeProfile.id ? updatedProfile : p));
    
    // Switch to new version
    setActiveVersionId(newVersion.id);

    // Save to DB
    await db.updateProfile(updatedProfile);
    
    showNotification(language === 'zh' ? "新版本已保存" : "New Version Saved");
  };

  const updateCurrentVersion = async (newData: ResumeData) => {
    if (!activeProfile || !activeVersionId) return;

    const updatedVersions = activeProfile.versions.map(v => 
      v.id === activeVersionId ? { ...v, data: newData } : v
    );
    
    const updatedProfile = {
      ...activeProfile,
      updatedAt: Date.now(),
      versions: updatedVersions
    };

    // Optimistic update
    setProfiles(prev => prev.map(p => p.id === activeProfile.id ? updatedProfile : p));
    
    // Persist to DB
    await db.updateProfile(updatedProfile);
  };

  const handleManualSave = () => {
     if(!resumeData) return;
     setShowSaveModal(true);
  };

  const handleConfirmSave = (note: string) => {
      if (resumeData) {
          saveNewVersion(resumeData, undefined, note);
          setShowSaveModal(false);
      }
  };

  // --- Features ---
  const handleAutoTag = async () => {
      if (!resumeData) return;
      setIsTagging(true);
      try {
        const tags = await generateTags(resumeData, language);
        const newData = { ...resumeData, tags };
        await updateCurrentVersion(newData);
        showNotification(language === 'zh' ? "标签已生成" : "Tags Generated");
      } catch (e) {
        console.error("Tagging failed");
      } finally {
        setIsTagging(false);
      }
  };

  const handleAnalyze = async () => {
    if (!resumeData || !activeProfile) return;
    setIsAnalyzing(true);
    setActiveTab('analysis');
    try {
      const result = await analyzeResumeWithGemini(
          resumeData, 
          activeProfile.targetRole, 
          language,
          activeProfile.targetJobDescription // Pass JD to Gemini
      );
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
      showNotification("Analysis failed", 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplySuggestion = async (section: string, index: number, subIndex: number | undefined, newContent: string) => {
    if (!resumeData) return;
    
    const newData = JSON.parse(JSON.stringify(resumeData)) as ResumeData;

    try {
      if (section === 'summary') {
        if (Array.isArray(newData.summary) && newData.summary[index] !== undefined) {
          newData.summary[index] = newContent;
        }
      } else if (section === 'experience') {
        if (subIndex !== undefined && newData.experience[index]?.details[subIndex] !== undefined) {
            newData.experience[index].details[subIndex] = newContent;
        }
      } else if (section === 'projects') {
         if (newData.projects[index]) {
             newData.projects[index].description = newContent;
         }
      }
      
      await updateCurrentVersion(newData);
      
      // Update local analysis state to disable button
      if (analysisResult) {
          const newSuggestions = analysisResult.suggestions.filter(s => 
              !(s.section === section && s.index === index && s.subIndex === subIndex)
          );
          setAnalysisResult({...analysisResult, suggestions: newSuggestions});
      }

      showNotification(language === 'zh' ? "优化建议已应用" : "Applied Suggestion");
    } catch (e) {
      console.error(e);
    }
  };

  // --- Render ---

  if (isLoadingProfiles) {
      return (
          <div className="flex h-screen items-center justify-center bg-gray-50">
              <div className="flex flex-col items-center">
                  <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-500">Loading CareerLift...</p>
              </div>
          </div>
      );
  }

  if (!activeProfileId || !resumeData) {
    return (
      <Dashboard 
        profiles={profiles}
        onSelect={(id) => setActiveProfileId(id)}
        onCreate={handleCreateProfile}
        onImport={handleImportProfile}
        onDelete={handleDeleteProfile}
        language={language}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden font-sans text-slate-800 app-container">
      
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 h-16 shrink-0 flex items-center justify-between px-6 shadow-sm z-30 relative no-print">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveProfileId(null)} 
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex flex-col">
             <h1 className="font-bold text-sm text-slate-800 truncate max-w-[200px]">{activeProfile?.name}</h1>
             <div 
                className="flex items-center gap-1 text-xs text-blue-600 cursor-pointer hover:underline"
                onClick={() => setShowTargetModal(true)}
             >
                 <Target size={12} />
                 <span className="truncate max-w-[150px]">{activeProfile?.targetRole}</span>
                 <PenLine size={10} />
             </div>
          </div>

          <div className="h-6 w-px bg-gray-200 mx-2"></div>

          <div className="flex bg-gray-100 rounded-lg p-1">
             <button
               onClick={() => setActiveTab('resume')}
               className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'resume' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               <FileText size={16} /> {language === 'zh' ? '简历编辑' : 'Editor'}
             </button>
             <button
               onClick={() => setActiveTab('analysis')}
               className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'analysis' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               <Activity size={16} /> {language === 'zh' ? 'AI 诊断' : 'Analysis'}
             </button>
             <button
               onClick={() => setActiveTab('interview')}
               className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'interview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               <Briefcase size={16} /> {language === 'zh' ? '模拟面试' : 'Interview'}
             </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
             onClick={handleManualSave}
             className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
          >
              <Save size={18} />
              {language === 'zh' ? '保存版本' : 'Save Ver'}
          </button>

          <button 
             onClick={() => setShowHistory(!showHistory)}
             className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${showHistory ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
              <History size={18} />
              {language === 'zh' ? '历史' : 'History'}
          </button>

          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          <button 
            onClick={handleAutoTag}
            disabled={isTagging}
            className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
          >
             {isTagging ? <Loader2 size={16} className="animate-spin"/> : <Tag size={16} />}
             {language === 'zh' ? 'AI 生成标签' : 'Auto Tag'}
          </button>

          <button 
            onClick={() => setLanguage(l => l === 'zh' ? 'en' : 'zh')}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            title="Switch Language"
          >
             <Globe size={20} />
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-8 transition-all duration-300 ${showHistory ? 'mr-80' : ''} main-content`}>
           <div className="max-w-5xl mx-auto h-full">
              {activeTab === 'resume' && (
                  <ResumeView 
                     data={resumeData} 
                     onUpdate={updateCurrentVersion}
                  />
              )}
              {activeTab === 'analysis' && (
                  <AnalysisPanel 
                    analysis={analysisResult} 
                    isLoading={isAnalyzing} 
                    onAnalyze={handleAnalyze} 
                    onApplySuggestion={handleApplySuggestion}
                    language={language}
                  />
              )}
              {activeTab === 'interview' && (
                  <InterviewBot 
                     targetRole={activeProfile.targetRole}
                     language={language}
                     jobDescription={activeProfile.targetJobDescription}
                  />
              )}
           </div>
        </main>

        {/* Right Sidebar: Version History */}
        <div className={`absolute top-0 right-0 bottom-0 w-80 bg-white shadow-xl transform transition-transform duration-300 z-40 border-l border-gray-200 ${showHistory ? 'translate-x-0' : 'translate-x-full'} no-print`}>
           {activeProfile && activeVersionId && (
               <VersionHistory 
                  versions={activeProfile.versions} 
                  activeVersionId={activeVersionId}
                  onSelectVersion={(id) => {
                      setActiveVersionId(id);
                      setAnalysisResult(null); // Clear analysis on switch
                  }}
                  language={language}
               />
           )}
        </div>
      </div>

      {/* Global Notification Toast */}
      {notification && (
          <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-top-4 fade-in duration-300 ${notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-slate-800 text-white'} no-print`}>
             {notification.type === 'success' ? <CheckCircle2 size={18} /> : <Activity size={18} />}
             <span className="font-medium text-sm">{notification.message}</span>
          </div>
      )}

      {/* Modals */}
      <SaveVersionModal 
         isOpen={showSaveModal}
         onClose={() => setShowSaveModal(false)}
         onSave={handleConfirmSave}
         language={language}
      />

      {/* Target Control Modal (Edit Mode) */}
      <TargetControlModal 
         isOpen={showTargetModal}
         onClose={() => setShowTargetModal(false)}
         onSave={handleUpdateTarget}
         initialTitle={activeProfile?.targetRole}
         initialJd={activeProfile?.targetJobDescription}
         language={language}
         mode="edit"
      />

    </div>
  );
};

export default App;
