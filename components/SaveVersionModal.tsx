import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Language } from '../types';

interface SaveVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  language: Language;
}

const SaveVersionModal: React.FC<SaveVersionModalProps> = ({ isOpen, onClose, onSave, language }) => {
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4 transform transition-all scale-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            {language === 'zh' ? '保存新版本' : 'Save Version'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {language === 'zh' ? '版本备注 (可选)' : 'Version Note (Optional)'}
          </label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder={language === 'zh' ? '例如：针对银行岗位的修改...' : 'e.g. Updated summary for Banking role'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave(note);
              if (e.key === 'Escape') onClose();
            }}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            {language === 'zh' ? '取消' : 'Cancel'}
          </button>
          <button
            onClick={() => onSave(note)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Save size={16} />
            {language === 'zh' ? '保存' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveVersionModal;