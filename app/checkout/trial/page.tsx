"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Zap, Mail, AlertCircle, User, Phone, CheckCircle, Clock, Shield } from "lucide-react";
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function CheckoutTrialPage() {
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

    const handleTrial = async (e: React.FormEvent) => {
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
            <div className="w-full max-w-md">
                {/* Trial Badge */}
                <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-full border border-yellow-500/30 text-sm font-semibold">
                        <Zap size={16} />
                        Free Trial — 2 Hari Akses Penuh
                    </div>
                </div>

                <div className="bg-[#1e1e1e] border border-gray-800 rounded-2xl p-8 shadow-2xl">
                    {/* Header */}
                    <h1 className="text-3xl font-bold text-center mb-2">Mulai Trial Gratis</h1>
                    <p className="text-gray-400 text-center mb-6">Coba semua fitur selama 2 hari tanpa biaya</p>

                    {/* Benefits */}
                    <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4 mb-6 space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <CheckCircle size={16} className="text-green-400 shrink-0" />
                            <span className="text-gray-300">Akses penuh ke semua fitur dashboard</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <CheckCircle size={16} className="text-green-400 shrink-0" />
                            <span className="text-gray-300">Kelola channel YouTube tanpa batas</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Clock size={16} className="text-yellow-400 shrink-0" />
                            <span className="text-gray-300">Masa trial 2 hari dari pendaftaran</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Shield size={16} className="text-blue-400 shrink-0" />
                            <span className="text-gray-300">Tidak perlu kartu kredit</span>
                        </div>
                    </div>

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

                    {/* Form */}
                    <form onSubmit={handleTrial} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Nama Lengkap <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-3 pl-10 focus:border-yellow-500 focus:outline-none transition"
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
                                    className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-3 pl-10 focus:border-yellow-500 focus:outline-none transition"
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
                                    className="w-full bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-3 pl-10 focus:border-yellow-500 focus:outline-none transition"
                                    required
                                />
                                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-lg transition flex items-center justify-center gap-2 text-base shadow-lg shadow-yellow-500/20"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <Zap size={18} />
                                    Mulai Trial Gratis
                                </>
                            )}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            Sudah punya akun?{' '}
                            <Link href="/login" className="text-cyan-400 hover:underline">
                                Login
                            </Link>
                        </p>
                    </form>
                </div>

                <p className="mt-6 text-xs text-gray-600 text-center">
                    Dengan mendaftar, Anda menyetujui Syarat & Ketentuan serta Kebijakan Privasi kami.
                </p>
            </div>
        </div>
    );
}
