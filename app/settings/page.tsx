"use client";

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, Key, Mail, Shield, LayoutDashboard, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function SettingsPage() {
    const supabase = createClient();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Password form
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Check if user has password set
    const [hasPassword, setHasPassword] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            // Check if user has password identity
            const identities = user.identities || [];
            const hasEmailIdentity = identities.some((id: any) => id.provider === 'email');
            setHasPassword(hasEmailIdentity);

            setLoading(false);
        };
        fetchUser();
    }, []);

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'Password minimal 6 karakter' });
            return;
        }

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Password tidak cocok' });
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Password berhasil diset! Sekarang Anda bisa login dengan Email + Password.' });
            setPassword('');
            setConfirmPassword('');
            setHasPassword(true);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] relative z-1 min-h-screen bg-[#101828]">
            <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Mobile Header */}
            <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

            <main className="p-6 md:p-10 w-full overflow-x-hidden font-sans text-white">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3"> Account Settings
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">Kelola akun dan keamanan Anda</p>
                        </div>
                        <Link href="/dashboard" className="flex items-center gap-2 bg-[#1a2234] hover:bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-700 transition">
                            <LayoutDashboard size={18} /> Back to Dashboard
                        </Link>
                    </div>

                    {/* User Info Card */}
                    <div className="bg-[#1a2234] border border-white/30 rounded-lg p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Mail size={20} className="text-gray-400" /> Account Info
                        </h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Email</span>
                                <span className="font-medium">{user?.email}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Login Methods</span>
                                <div className="flex gap-2">
                                    {user?.app_metadata?.providers?.includes('google') && (
                                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs border border-blue-500/50">
                                            Google
                                        </span>
                                    )}
                                    {hasPassword && (
                                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs border border-green-500/50">
                                            Email + Password
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Set Password Card */}
                    <div className="bg-[#1a2234] border border-white/30 rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Key size={20} className="text-gray-400" />
                            {hasPassword ? 'Update Password' : 'Set Password'}
                        </h2>

                        {!hasPassword && (
                            <p className="text-gray-400 text-sm mb-4">
                                Anda login via Google. Set password agar bisa login dengan Email + Password juga.
                            </p>
                        )}

                        {message && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${message.type === 'success'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                                }`}>
                                {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleSetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    {hasPassword ? 'New Password' : 'Password'}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Minimal 6 karakter"
                                        className="w-full bg-[#101828] border border-gray-700 rounded-lg px-4 py-3 pr-12 focus:border-cyan-500 focus:outline-none transition"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Ulangi password"
                                    className="w-full bg-[#101828] border border-gray-700 rounded-lg px-4 py-3 focus:border-cyan-500 focus:outline-none transition"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Shield size={18} />
                                        {hasPassword ? 'Update Password' : 'Set Password'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
