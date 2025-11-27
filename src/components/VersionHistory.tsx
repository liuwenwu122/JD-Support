import React from 'react';
import { ResumeVersion, Language } from '../types';
import { History, Check, Clock } from 'lucide-react';

interface VersionHistoryProps {
  versions: ResumeVersion[];
  activeVersionId: string;
  onSelectVersion: (versionId: string) => void;
  language: Language;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({ versions, activeVersionId, onSelectVersion, language }) => {
  // Sort versions new to old
  const sortedVersions = [...versions].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="w-full bg-white border-l border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-700 flex items-center gap-2">
          <History size={18} />
          {language === 'zh' ? '版本历史' : 'Version History'}
        </h3>
      </div>
      <div className="divide-y divide-gray-100">
        {sortedVersions.map((ver) => (
          <button
            key={ver.id}
            onClick={() => onSelectVersion(ver.id)}
            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors relative group ${
              ver.id === activeVersionId ? 'bg-blue-50/50' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`font-medium text-sm ${ver.id === activeVersionId ? 'text-blue-600' : 'text-gray-700'}`}>
                {ver.label}
              </span>
              {ver.id === activeVersionId && <Check size={14} className="text-blue-500" />}
            </div>
            
            <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
               <Clock size={10} />
               {new Date(ver.timestamp).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')}
            </div>
            
            {ver.note && (
              <p className="text-xs text-gray-500 italic truncate line-clamp-2">
                "{ver.note}"
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VersionHistory;
