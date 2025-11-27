import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAI } from '../contexts/AIContext';
import { LogOut, User, Menu, Settings } from 'lucide-react';
import { Language } from '../types';

interface NavbarProps {
    language: Language;
    onMobileMenuOpen: () => void;
    onOpenSettings?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ language, onMobileMenuOpen, onOpenSettings }) => {
    const { user, signOut } = useAuth();
    const { settings } = useAI();

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                C
                            </div>
                            <span className="font-bold text-xl text-slate-900 tracking-tight">CareerLift</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                            >
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    {user?.user_metadata?.full_name ? user.user_metadata.full_name.charAt(0).toUpperCase() : <User size={16} />}
                                </div>
                                <span className="max-w-[150px] truncate">{user?.user_metadata?.full_name || user?.email}</span>
                            </Link>

                            <div className="h-6 w-px bg-gray-200"></div>

                            {onOpenSettings && (
                                <button
                                    onClick={onOpenSettings}
                                    className="text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
                                    title={language === 'zh' ? '设置' : 'Settings'}
                                >
                                    <Settings size={20} />
                                </button>
                            )}

                            <button
                                onClick={() => signOut()}
                                className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                                title={language === 'zh' ? '退出登录' : 'Sign Out'}
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center md:hidden">
                        <button
                            onClick={onMobileMenuOpen}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
