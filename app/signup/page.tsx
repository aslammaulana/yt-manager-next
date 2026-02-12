"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, Mail, AlertCircle, User, Phone, CheckCircle } from "lucide-react";
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function SignupPage() {
    const router = useRouter();
    const supabase = createClient();

    // UI State
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form State
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [whatsapp, setWhatsapp] = useState("");

    // Default password for all new users
    const DEFAULT_PASSWORD = "1234567890";

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);

        // Validation
        if (!fullName.trim()) {
            setMsg({ type: 'error', text: 'Nama lengkap wajib diisi' });
            setLoading(false);
            return;
        }

        if (!whatsapp.trim()) {
            setMsg({ type: 'error', text: 'No. WhatsApp wajib diisi' });
            setLoading(false);
            return;
        }

        try {
            // 1. Create user via server API (auto-confirms email)
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password: DEFAULT_PASSWORD,
                    full_name: fullName,
                    whatsapp,
                }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            // 2. Auto-login langsung setelah signup berhasil
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password: DEFAULT_PASSWORD,
            });

            if (loginError) throw loginError;

            // 3. Redirect ke dashboard
            router.push('/dashboard');

        } catch (error: any) {
            setMsg({ type: 'error', text: error.message });
        } finally {
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

                <h1 className="text-3xl font-bold text-center mb-2">Buat Akun</h1>
                <p className="text-gray-400 text-center mb-6">Daftar untuk mengelola YouTube Channel Anda</p>

                {/* Message */}
                {msg && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm border ${msg.type === 'success'
                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                        {msg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        {msg.text}
                    </div>
                )}

                {/* Signup Form */}
                <form onSubmit={handleSignup} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Nama Lengkap <span className="text-red-400">*</span></label>
                        <div className="relative">
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-3 pl-10 focus:border-cyan-500 focus:outline-none transition"
                                required
                            />
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Alamat Email <span className="text-red-400">*</span></label>
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

                    {/* WhatsApp */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">No. WhatsApp <span className="text-red-400">*</span></label>
                        <div className="relative">
                            <input
                                type="tel"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                placeholder="08123456789"
                                className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-3 pl-10 focus:border-cyan-500 focus:outline-none transition"
                                required
                            />
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>


                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#155dfc] hover:bg-[#407bfa] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                                Mendaftar...
                            </>
                        ) : (
                            "Daftar"
                        )}
                    </button>

                    <p className="text-center text-sm text-gray-500">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="text-cyan-400 hover:underline">
                            Login
                        </Link>
                    </p>
                </form>

                <p className="mt-8 text-xs text-gray-500 text-center">
                    By signing up, you agree to our Terms of Service & Privacy Policy.
                </p>
            </div>
        </div>
    );
}
