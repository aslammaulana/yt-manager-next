"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    // UI State
    const [loginMethod, setLoginMethod] = useState<'google' | 'email'>('google');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    // Email form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        setMsg("Redirecting to Google...");
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            setMsg("Login Error: " + error.message);
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.push('/dashboard');
        } catch (error: any) {
            setMsg(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#1e1e1e] border border-gray-800 rounded-2xl p-8 shadow-2xl">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-[#155dfc]/10 rounded-full text-[#5b9aff]">
                        <LayoutDashboard size={48} />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
                <p className="text-gray-400 text-center mb-6">Sign in to manage your YouTube Channels</p>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-6 bg-[#0f0f0f] p-1 rounded-lg">
                    <button
                        onClick={() => setLoginMethod('google')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${loginMethod === 'google'
                            ? 'bg-[#1e1e1e] text-white shadow'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Google
                    </button>
                    <button
                        onClick={() => setLoginMethod('email')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${loginMethod === 'email'
                            ? 'bg-[#1e1e1e] text-white shadow'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Email
                    </button>
                </div>

                {/* Error Message */}
                {msg && (
                    <div className="flex items-center gap-2 bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-500/30">
                        <AlertCircle size={16} />
                        {msg}
                    </div>
                )}

                {/* Google Login */}
                {loginMethod === 'google' && (
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="animate-spin h-5 w-5 border-2 border-gray-600 border-t-transparent rounded-full"></span>
                        ) : (
                            <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
                        )}
                        {loading ? "Processing..." : "Sign in with Google"}
                    </button>
                )}

                {/* Email Login */}
                {loginMethod === 'email' && (
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-3 pl-10 focus:border-cyan-500 focus:outline-none transition"
                                    required
                                />
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-3 pr-10 focus:border-cyan-500 focus:outline-none transition"
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#155dfc] hover:bg-[#407bfa] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            Don't have a password?{' '}
                            <button
                                type="button"
                                onClick={() => setLoginMethod('google')}
                                className="text-cyan-400 hover:underline"
                            >
                                Sign in with Google first
                            </button>
                            , then set password in Settings.
                        </p>
                    </form>
                )}

                <p className="mt-8 text-xs text-gray-500 text-center">
                    By signing in, you agree to our Terms of Service & Privacy Policy.
                </p>
            </div>
        </div>
    );
}
