"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertCircle, User, Mail, Phone } from "lucide-react";
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import Image from 'next/image';

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
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">

            {/* LEFT SIDE: IMAGE & TEXT */}
            <div className="hidden lg:block p-6">
                <div className="relative h-full w-full flex flex-col justify-between p-12 overflow-hidden rounded-3xl shadow-md">

                    {/* Background Image / Gradient */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/gradient5.jpg"
                            alt="Background"
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Overlay Gradient agar teks terbaca */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-black/40" />
                    </div>

                    {/* Content Overlay */}
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        {/* Logo Asterisk di kiri atas */}
                        <div className="flex items-center">
                            <span className="text-white text-6xl font-light">*</span>
                        </div>

                        <div className="max-w-md space-y-4">
                            <p className="text-lg font-light text-white/90">Join our community</p>
                            <h1 className="text-4xl font-semibold leading-tight text-white">
                                Start your journey to better management and growth today.
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: FORM */}
            <div className="flex flex-col justify-center relative p-6 lg:p-10">

                {/* Top Right Toggle */}
                <div className="absolute top-10 right-5 md:right-10 bg-[#155dfc] rounded-lg">
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-sm mt-10 md:mt-0 mx-auto space-y-8">
                    <div className="space-y-3">
                        <h2 className="text-4xl font-bold tracking-tight">Create an account</h2>
                        <p className="text-muted-foreground text-sm">
                            Sign up to manage your YouTube Channel efficiently.
                        </p>
                    </div>

                    {/* Error Message */}
                    {msg && (
                        <div className={`flex items-center gap-2 p-4 rounded-xl text-sm border animate-in fade-in slide-in-from-top-1 ${msg.type === 'success'
                            ? 'bg-green-500/10 text-green-400 border-green-500/30'
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                            }`}>
                            <AlertCircle size={16} />
                            {msg.text}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-3">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full bg-card text-[16px] border border-2 border-input rounded-xl px-4 py-3.5 focus:border-2 focus:border-[#6a97f8] focus:outline-none transition"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-card text-[16px] border border-2 border-input rounded-xl px-4 py-3.5 focus:border-2 focus:border-[#6a97f8] focus:outline-none transition"
                                required
                            />
                        </div>

                        {/* WhatsApp */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">WhatsApp Number</label>
                            <input
                                type="tel"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                placeholder="08123456789"
                                className="w-full bg-card text-[16px] border border-2 border-input rounded-xl px-4 py-3.5 focus:border-2 focus:border-[#6a97f8] focus:outline-none transition"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#145cfc] hover:bg-[#3373fd] text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center mt-6 cursor-pointer"
                        >
                            {loading ? "Creating account..." : "Sign Up"}
                        </button>
                    </form>

                    <div className="text-center text-sm pt-0">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link href="/auth/login" className="font-bold text-indigo-600 hover:text-indigo-500 transition-all">
                            Login
                        </Link>
                    </div>

                    <p className="mt-8 text-xs text-muted-foreground text-center">
                        By signing up, you agree to our Terms of Service & Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
