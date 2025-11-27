import React from 'react';
import { Save, History, Tag, Globe, LogOut, Loader2, X, User } from 'lucide-react';
import { Language } from '../types';
import { Link } from 'react-router-dom';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    onHistory: () => void;
    onAutoTag: () => void;
    onLanguage: () => void;
    onSignOut: () => void;
    language: Language;
    isTagging: boolean;
    userEmail?: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
    isOpen,
    onClose,
    onSave,
    onHistory,
    onAutoTag,
    onLanguage,
    onSignOut,
    language,
    isTagging,
    userEmail
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Menu Content */}
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col animate-in slide-in-from-right duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-900">
                        {language === 'zh' ? '菜单' : 'Menu'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-2">
                    {userEmail && (
                        <Link
                            to="/profile"
                            onClick={onClose}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 bg-gray-50 rounded-lg mb-4 hover:bg-gray-100 transition-colors"
                        >
                            <User size={20} className="text-gray-500" />
                            <span className="truncate">{userEmail}</span>
                        </Link>
                    )}

                    <button
                        onClick={() => { onSave(); onClose(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <Save size={20} />
                        <span>{language === 'zh' ? '保存版本' : 'Save Version'}</span>
                    </button>

                    <button
                        onClick={() => { onHistory(); onClose(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <History size={20} />
                        <span>{language === 'zh' ? '历史版本' : 'Version History'}</span>
                    </button>

                    <button
                        onClick={() => { onAutoTag(); onClose(); }}
                        disabled={isTagging}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isTagging ? <Loader2 size={20} className="animate-spin" /> : <Tag size={20} />}
                        <span>{language === 'zh' ? 'AI 生成标签' : 'Auto Tag'}</span>
                    </button>

                    <div className="h-px bg-gray-100 my-2" />

                    <button
                        onClick={() => { onLanguage(); onClose(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <Globe size={20} />
                        <span>{language === 'zh' ? 'Switch to English' : '切换中文'}</span>
                    </button>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={() => { onSignOut(); onClose(); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span>{language === 'zh' ? '退出登录' : 'Sign Out'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileMenu;
