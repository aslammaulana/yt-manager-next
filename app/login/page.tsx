"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

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

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#1e1e1e] border border-gray-800 rounded-2xl p-8 shadow-2xl text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-cyan-500/10 rounded-full text-cyan-400">
                        <LayoutDashboard size={48} />
                    </div>
                </div>

                <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                <p className="text-gray-400 mb-8">Sign in to manage your YouTube Channels</p>

                {msg && (
                    <div className="bg-red-500/10 text-red-400 p-3 rounded-lg mb-4 text-sm">
                        {msg}
                    </div>
                )}

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

                <p className="mt-8 text-xs text-gray-500">
                    By signing in, you agree to our Terms of Service & Privacy Policy.
                </p>
            </div>
        </div>
    );
}
