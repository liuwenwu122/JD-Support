import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, User, Mail, Lock, LogOut, ChevronLeft, Save } from 'lucide-react';

const UserProfile: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (user && user.user_metadata && user.user_metadata.full_name) {
            setFullName(user.user_metadata.full_name);
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (!supabase) throw new Error('Supabase not configured');

            const { error } = await supabase.auth.updateUser({
                data: { full_name: fullName }
            });

            if (error) throw error;
            setMessage({ text: '个人信息已更新', type: 'success' });
        } catch (error: any) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="mb-8 flex items-center">
                    <Link to="/" className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 ml-2">个人中心</h1>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6 space-y-6">

                        {/* Avatar Placeholder */}
                        <div className="flex flex-col items-center">
                            <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold mb-4">
                                {fullName ? fullName.charAt(0).toUpperCase() : <User size={40} />}
                            </div>
                            <p className="text-gray-500 text-sm">{user?.email}</p>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">姓名</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User size={16} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="fullName"
                                        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="您的姓名"
                                    />
                                </div>
                            </div>

                            {message && (
                                <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {message.text}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                保存修改
                            </button>
                        </form>

                        <div className="border-t border-gray-100 pt-6 space-y-3">
                            <Link
                                to="/forgot-password"
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <Lock size={16} />
                                修改密码
                            </Link>

                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                            >
                                <LogOut size={16} />
                                退出登录
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
