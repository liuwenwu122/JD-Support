
import React, { useState, useEffect } from 'react';
import { ResumeData, WorkExperience, Project, Education } from '../types';
import { MapPin, Phone, Mail, Edit2, Save, X, Download, Plus, Trash2, User, Briefcase, GraduationCap, Award, FileText, Layers, Loader2 } from 'lucide-react';

interface ResumeViewProps {
  data: ResumeData;
  onUpdate: (newData: ResumeData) => void;
}

declare global {
  interface Window {
    html2pdf: any;
  }
}

const ResumeView: React.FC<ResumeViewProps> = ({ data, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ResumeData>(data);
  const [activeTab, setActiveTab] = useState<'basic' | 'summary' | 'experience' | 'projects' | 'skills'>('basic');
  const [isExporting, setIsExporting] = useState(false);

  // Sync props to state when not editing
  useEffect(() => {
    if (!isEditing) {
      setFormData(data);
    }
  }, [data, isEditing]);

  // --- Safe Data Helpers ---
  const safeData = {
    personalInfo: formData.personalInfo || {
      name: "",
      gender: "",
      age: 0,
      phone: "",
      location: "",
      hometown: "",
      height: "",
      weight: "",
      email: "",
      role: ""
    },
    summary: formData.summary || [],
    education: formData.education || {
      school: "",
      degree: "",
      duration: "",
      details: []
    },
    experience: formData.experience || [],
    projects: formData.projects || [],
    certificates: formData.certificates || [],
    tags: formData.tags || []
  };

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleExport = async () => {
    const element = document.getElementById('resume-preview');
    if (!element) return;
    
    setIsExporting(true);

    // Check if script is loaded
    if (typeof window.html2pdf === 'undefined') {
         alert('PDF generation library not loaded. Please refresh the page.');
         setIsExporting(false);
         return;
    }

    const opt = {
      margin: 5,
      filename: `${(safeData.personalInfo.name || 'resume').replace(/\s+/g, '_')}_CareerLift.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
        await window.html2pdf().set(opt).from(element).save();
    } catch (e) {
        console.error("PDF Export failed", e);
        alert("Export failed. Please try again.");
    } finally {
        setIsExporting(false);
    }
  };

  // --- Form Handlers ---

  const updatePersonalInfo = (field: keyof ResumeData['personalInfo'], value: string | number) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const updateEducation = (field: keyof Education, value: any) => {
    setFormData(prev => ({
      ...prev,
      education: { ...prev.education, [field]: value }
    }));
  };

  // Generic List Handlers (Summary, Certs, Tags)
  const updateSimpleList = (field: 'summary' | 'certificates' | 'tags', index: number, value: string) => {
    setFormData(prev => {
      const list = [...(prev[field] || [])];
      list[index] = value;
      return { ...prev, [field]: list };
    });
  };

  const addSimpleListItem = (field: 'summary' | 'certificates' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), ""]
    }));
  };

  const removeSimpleListItem = (field: 'summary' | 'certificates' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }));
  };

  // Complex List Handlers (Experience, Projects)
  const updateExperience = (index: number, field: keyof WorkExperience, value: any) => {
    setFormData(prev => {
      const list = [...prev.experience];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, experience: list };
    });
  };

  const updateExperienceDetail = (expIndex: number, detailIndex: number, value: string) => {
    setFormData(prev => {
      const list = [...prev.experience];
      const details = [...list[expIndex].details];
      details[detailIndex] = value;
      list[expIndex] = { ...list[expIndex], details };
      return { ...prev, experience: list };
    });
  };

  const addExperienceDetail = (expIndex: number) => {
    setFormData(prev => {
      const list = [...prev.experience];
      list[expIndex] = { ...list[expIndex], details: [...list[expIndex].details, ""] };
      return { ...prev, experience: list };
    });
  };

  const removeExperienceDetail = (expIndex: number, detailIndex: number) => {
    setFormData(prev => {
      const list = [...prev.experience];
      list[expIndex] = { ...list[expIndex], details: list[expIndex].details.filter((_, i) => i !== detailIndex) };
      return { ...prev, experience: list };
    });
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: "New Company", role: "Role", duration: "", details: [""] }]
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  // Similar handlers for Projects...
  const updateProject = (index: number, field: keyof Project, value: any) => {
    setFormData(prev => {
      const list = [...prev.projects];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, projects: list };
    });
  };

  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: "New Project", role: "Role", duration: "", description: "" }]
    }));
  };

  const removeProject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  // --- Render Editor ---
  if (isEditing) {
    return (
      <div className="bg-white shadow-xl rounded-lg flex flex-col h-[800px] border border-gray-200 overflow-hidden">
        {/* Editor Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
           <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
             <Edit2 size={18}/> Resume Editor
           </h3>
           <div className="flex gap-2">
             <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"><X size={20}/></button>
             <button onClick={handleSave} className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 shadow-sm font-medium"><Save size={16}/> Save Changes</button>
           </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Editor Sidebar Tabs */}
          <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col p-2 gap-1">
             {[
               { id: 'basic', label: 'Basic Info', icon: <User size={16}/> },
               { id: 'summary', label: 'Summary', icon: <FileText size={16}/> },
               { id: 'experience', label: 'Experience', icon: <Briefcase size={16}/> },
               { id: 'projects', label: 'Projects', icon: <Layers size={16}/> },
               { id: 'skills', label: 'Skills & Certs', icon: <Award size={16}/> },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                   activeTab === tab.id 
                   ? 'bg-blue-100 text-blue-700' 
                   : 'text-gray-600 hover:bg-gray-200'
                 }`}
               >
                 {tab.icon} {tab.label}
               </button>
             ))}
          </div>

          {/* Editor Content Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-white">
            
            {/* 1. Basic Info & Education */}
            {activeTab === 'basic' && (
              <div className="space-y-8 animate-in fade-in">
                <section>
                  <h4 className="text-sm font-bold uppercase text-gray-400 mb-4 tracking-wider">Personal Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Full Name" value={safeData.personalInfo.name} onChange={v => updatePersonalInfo('name', v)} />
                    <Input label="Job Title / Role" value={safeData.personalInfo.role || ''} onChange={v => updatePersonalInfo('role', v)} />
                    <Input label="Email" value={safeData.personalInfo.email || ''} onChange={v => updatePersonalInfo('email', v)} />
                    <Input label="Phone" value={safeData.personalInfo.phone} onChange={v => updatePersonalInfo('phone', v)} />
                    <Input label="Location" value={safeData.personalInfo.location} onChange={v => updatePersonalInfo('location', v)} />
                    <div className="grid grid-cols-2 gap-2">
                       <Input label="Age" value={safeData.personalInfo.age} type="number" onChange={v => updatePersonalInfo('age', parseInt(v))} />
                       <Input label="Gender" value={safeData.personalInfo.gender} onChange={v => updatePersonalInfo('gender', v)} />
                    </div>
                  </div>
                </section>

                <hr className="border-gray-100" />

                <section>
                  <h4 className="text-sm font-bold uppercase text-gray-400 mb-4 tracking-wider flex items-center gap-2"><GraduationCap size={16} /> Education</h4>
                  <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="School / University" value={safeData.education.school} onChange={v => updateEducation('school', v)} />
                      <Input label="Degree & Major" value={safeData.education.degree} onChange={v => updateEducation('degree', v)} />
                    </div>
                    <Input label="Duration (e.g. 2015-2019)" value={safeData.education.duration} onChange={v => updateEducation('duration', v)} />
                  </div>
                </section>
              </div>
            )}

            {/* 2. Summary */}
            {activeTab === 'summary' && (
              <div className="space-y-4 animate-in fade-in">
                 <h4 className="text-sm font-bold uppercase text-gray-400 mb-2 tracking-wider">Professional Summary</h4>
                 <p className="text-xs text-gray-500 mb-4">Add concise bullet points that highlight your best achievements.</p>
                 
                 {safeData.summary.map((line, i) => (
                   <div key={i} className="flex gap-2">
                     <textarea 
                        className="flex-1 p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={2}
                        value={line}
                        onChange={(e) => updateSimpleList('summary', i, e.target.value)}
                     />
                     <button onClick={() => removeSimpleListItem('summary', i)} className="text-gray-400 hover:text-red-500 self-center"><Trash2 size={18}/></button>
                   </div>
                 ))}
                 <button onClick={() => addSimpleListItem('summary')} className="flex items-center gap-2 text-sm text-blue-600 font-medium hover:bg-blue-50 px-3 py-2 rounded transition-colors w-fit">
                   <Plus size={16} /> Add Summary Item
                 </button>
              </div>
            )}

            {/* 3. Experience */}
            {activeTab === 'experience' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center">
                   <h4 className="text-sm font-bold uppercase text-gray-400 tracking-wider">Work Experience</h4>
                   <button onClick={addExperience} className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"><Plus size={14}/> Add Job</button>
                </div>
                
                {safeData.experience.map((exp, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-5 relative bg-gray-50 group">
                    <button onClick={() => removeExperience(i)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <Input label="Company Name" value={exp.company} onChange={v => updateExperience(i, 'company', v)} />
                      <Input label="Duration" value={exp.duration} onChange={v => updateExperience(i, 'duration', v)} />
                      <Input label="Role / Title" value={exp.role} onChange={v => updateExperience(i, 'role', v)} className="col-span-2" />
                    </div>

                    <div className="mt-4">
                      <label className="block text-xs font-medium text-gray-500 mb-2">Key Responsibilities & Achievements</label>
                      <div className="space-y-2 pl-2 border-l-2 border-gray-200">
                         {exp.details?.map((detail, dIndex) => (
                           <div key={dIndex} className="flex gap-2 items-start">
                             <span className="mt-2.5 w-1.5 h-1.5 bg-gray-400 rounded-full shrink-0"></span>
                             <textarea 
                               className="flex-1 bg-white p-2 border border-gray-200 rounded text-sm focus:border-blue-400 outline-none resize-y"
                               rows={1}
                               value={detail}
                               onChange={(e) => updateExperienceDetail(i, dIndex, e.target.value)}
                             />
                             <button onClick={() => removeExperienceDetail(i, dIndex)} className="mt-2 text-gray-300 hover:text-red-500"><X size={14}/></button>
                           </div>
                         ))}
                         <button onClick={() => addExperienceDetail(i)} className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"><Plus size={12}/> Add Bullet Point</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Projects */}
            {activeTab === 'projects' && (
              <div className="space-y-6 animate-in fade-in">
                 <div className="flex justify-between items-center">
                   <h4 className="text-sm font-bold uppercase text-gray-400 tracking-wider">Key Projects</h4>
                   <button onClick={addProject} className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors"><Plus size={14}/> Add Project</button>
                </div>

                {safeData.projects.map((proj, i) => (
                   <div key={i} className="border border-gray-200 rounded-lg p-5 relative bg-white group hover:shadow-sm transition-shadow">
                     <button onClick={() => removeProject(i)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                     
                     <div className="grid grid-cols-2 gap-4 mb-4">
                       <Input label="Project Name" value={proj.name} onChange={v => updateProject(i, 'name', v)} />
                       <Input label="Role" value={proj.role} onChange={v => updateProject(i, 'role', v)} />
                       <Input label="Duration / Date" value={proj.duration} onChange={v => updateProject(i, 'duration', v)} className="col-span-2" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                       <textarea 
                          className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          rows={3}
                          value={proj.description}
                          onChange={(e) => updateProject(i, 'description', e.target.value)}
                       />
                     </div>
                   </div>
                ))}
              </div>
            )}

            {/* 5. Skills */}
            {activeTab === 'skills' && (
               <div className="space-y-8 animate-in fade-in">
                  <section>
                    <h4 className="text-sm font-bold uppercase text-gray-400 mb-4 tracking-wider">Certificates & Awards</h4>
                    <div className="space-y-2">
                      {safeData.certificates.map((cert, i) => (
                        <div key={i} className="flex gap-2">
                          <input 
                            className="flex-1 p-2 border border-gray-300 rounded text-sm focus:border-blue-500 outline-none"
                            value={cert}
                            onChange={(e) => updateSimpleList('certificates', i, e.target.value)}
                          />
                          <button onClick={() => removeSimpleListItem('certificates', i)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                      ))}
                      <button onClick={() => addSimpleListItem('certificates')} className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"><Plus size={12}/> Add Certificate</button>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-sm font-bold uppercase text-gray-400 mb-4 tracking-wider">Skills / Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {safeData.tags.map((tag, i) => (
                        <div key={i} className="flex items-center bg-gray-100 rounded-full pl-3 pr-1 py-1 text-sm border border-gray-200">
                           <input 
                             className="bg-transparent border-none outline-none w-24 text-gray-700"
                             value={tag}
                             onChange={(e) => updateSimpleList('tags', i, e.target.value)}
                           />
                           <button onClick={() => removeSimpleListItem('tags', i)} className="ml-1 text-gray-400 hover:text-red-500 rounded-full p-1"><X size={12}/></button>
                        </div>
                      ))}
                      <button onClick={() => addSimpleListItem('tags')} className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm hover:bg-blue-100 border border-blue-200 border-dashed"><Plus size={14}/> Add Tag</button>
                    </div>
                  </section>
               </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  // --- Preview Render ---

  return (
    <div className="flex flex-col items-center resume-view-container">
      
      {/* Action Toolbar (Visible on Screen, Hidden on Print) */}
      <div className="w-full max-w-[210mm] flex justify-end gap-3 mb-4 no-print">
        <button 
          onClick={() => setIsEditing(true)}
          className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm"
        >
          <Edit2 size={16} /> Edit Content
        </button>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all flex items-center gap-2 shadow-sm min-w-[140px] justify-center"
        >
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {isExporting ? 'Generating...' : 'Export PDF'}
        </button>
      </div>

      {/* 
        A4 Resume Layout
        Outer container for shadow/spacing (removed during export/print via ID targeting) 
      */}
      <div className="shadow-2xl mb-8">
          <div id="resume-preview" className="bg-white min-h-[297mm] w-full max-w-[210mm] p-[15mm] md:p-[20mm] text-slate-900 font-sans">
            
            {/* Header */}
            <header className="border-b-2 border-slate-800 pb-6 mb-8 break-inside-avoid">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4 uppercase">{safeData.personalInfo.name}</h1>
              
              <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Phone size={14} /> {safeData.personalInfo.phone}
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail size={14} /> {safeData.personalInfo.email}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} /> {safeData.personalInfo.location}
                </div>
                {(safeData.personalInfo.age || safeData.personalInfo.gender) && (
                    <div className="flex items-center gap-1.5 px-2 bg-slate-100 rounded text-slate-700">
                      {safeData.personalInfo.age} Y/O {safeData.personalInfo.gender ? `| ${safeData.personalInfo.gender}` : ''}
                    </div>
                )}
              </div>
            </header>

            {/* Summary */}
            {safeData.summary.length > 0 && (
              <section className="mb-8 break-inside-avoid">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">Professional Summary</h2>
                <div className="text-sm leading-relaxed text-slate-800 text-justify space-y-1">
                  {safeData.summary.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Experience */}
            {safeData.experience.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Work Experience</h2>
                <div className="space-y-6">
                  {safeData.experience.map((exp, i) => (
                    <div key={i} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-lg text-slate-900">{exp.company}</h3>
                        <span className="text-sm font-medium text-slate-600 whitespace-nowrap">{exp.duration}</span>
                      </div>
                      <p className="text-slate-700 italic font-medium mb-2">{exp.role}</p>
                      <ul className="list-disc list-outside ml-4 space-y-1.5">
                        {exp.details?.map((d, j) => (
                          <li key={j} className="text-sm text-slate-700 leading-relaxed pl-1 text-justify">
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {safeData.projects.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Key Projects</h2>
                <div className="space-y-4">
                    {safeData.projects.map((proj, i) => (
                      <div key={i} className="bg-slate-50/50 p-3 -mx-3 rounded-md break-inside-avoid">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-slate-900">{proj.name}</h3>
                          <span className="text-xs text-slate-500">{proj.duration}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mb-1.5 uppercase tracking-wide">{proj.role}</p>
                        <p className="text-sm text-slate-700 leading-relaxed text-justify">
                          {proj.description}
                        </p>
                      </div>
                    ))}
                </div>
              </section>
            )}

            {/* Education & Certificates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Education */}
              <section className="break-inside-avoid">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">Education</h2>
                  {safeData.education && safeData.education.school && (
                    <div>
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-bold text-slate-900">{safeData.education.school}</h3>
                        </div>
                        <div className="flex justify-between items-baseline mb-2">
                          <p className="text-sm text-slate-800">{safeData.education.degree}</p>
                          <span className="text-xs text-slate-500">{safeData.education.duration}</span>
                        </div>
                        {safeData.education.details && (
                          <div className="text-xs text-slate-600 space-y-0.5">
                              {safeData.education.details.map((d, k) => <div key={k}>{d}</div>)}
                          </div>
                        )}
                    </div>
                  )}
              </section>

              {/* Skills / Certs */}
              {safeData.certificates.length > 0 && (
                  <section className="break-inside-avoid">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-3">Certificates & Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {safeData.certificates.map((cert, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200">
                          {cert}
                        </span>
                      ))}
                    </div>
                    {safeData.tags && safeData.tags.length > 0 && (
                      <div className="mt-4">
                          <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase">Keywords</h3>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {safeData.tags.join(' • ')}
                          </p>
                      </div>
                    )}
                  </section>
              )}

            </div>

          </div>
      </div>
    </div>
  );
};

// UI Components
const Input = ({ label, value, onChange, type = "text", className = "" }: { label: string, value: string | number | undefined, onChange: (val: string) => void, type?: string, className?: string }) => (
    <div className={className}>
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
        <input 
            type={type}
            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

export default ResumeView;
