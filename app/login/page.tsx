"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    // UI State
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    // Email form state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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

                {/* Error Message */}
                {msg && (
                    <div className="flex items-center gap-2 bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm border border-red-500/30">
                        <AlertCircle size={16} />
                        {msg}
                    </div>
                )}

                {/* Email Login Form */}
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
                        Belum punya akun?{' '}
                        <Link href="/signup" className="text-cyan-400 hover:underline">
                            Daftar
                        </Link>
                    </p>
                </form>

                <p className="mt-8 text-xs text-gray-500 text-center">
                    By signing in, you agree to our Terms of Service & Privacy Policy.
                </p>
            </div>
        </div>
    );
}
