"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
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

            // Ensure profile exists (heal zombie users)
            await fetch('/api/auth/check-profile');

            router.push('/dashboard');
        } catch (error: any) {
            setMsg(error.message);
            setLoading(false);
        }
    };

    return (
        // Menggunakan bg-muted atau warna cerah agar kontras dengan card
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">

            {/* LEFT SIDE: IMAGE & TEXT */}
            {/* p-6 memberikan space di sekeliling area gradient */}
            <div className="hidden lg:block p-6">
                <div className="relative h-full w-full flex flex-col justify-between p-12 overflow-hidden rounded-3xl shadow-md">

                    {/* Background Image / Gradient */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="/gradient4.jpg" // Pastikan file ini ada di folder public
                            alt="Background"
                            fill
                            className="object-cover"
                            priority
                        />
                        {/* Overlay Gradient agar teks terbaca */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-black/40" />
                    </div>

                    {/* Content Overlay */}
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        {/* Logo Asterisk di kiri atas */}
                        <div className="flex items-center">
                            <span className="text-white text-6xl font-light">*</span>
                        </div>

                        <div className="max-w-md space-y-4">
                            <p className="text-lg font-light text-white/90">You can easily</p>
                            <h1 className="text-4xl font-semibold leading-tight text-white">
                                Get access your personal hub for clarity and productivity
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: FORM */}
            <div className="flex flex-col justify-center relative p-6 lg:p-10">

                {/* Top Right Toggle (Asterisk/Toggle) */}
                <div className="absolute top-10  right-5 md:right-10 bg-[#155dfc] rounded-lg">
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-sm mt-10 md:mt-0 mx-auto space-y-8">
                    <div className="space-y-3">
                        <h2 className="text-4xl font-bold tracking-tight">Login</h2>
                        <p className="text-muted-foreground text-sm">
                            Access your tasks, notes, and projects anytime — and keep everything flowing in one place.
                        </p>
                    </div>

                    {msg && (
                        <div className="flex items-center gap-2 bg-destructive/10 text-destructive p-4 rounded-xl text-sm border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle size={16} />
                            {msg}
                        </div>
                    )}

                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold ">Your email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your-email@gmail.com"
                                className="w-full bg-card text-[16px] border border-2 border-input rounded-xl px-4 py-3.5 pr-12 focus:border-2 focus:border-[#6a97f8] focus:outline-none transition"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="******"
                                    className="w-full bg-card text-[16px] border border-2 border-input rounded-xl px-4 py-3.5 pr-12 focus:border-2 focus:border-[#6a97f8] focus:outline-none transition"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                                />
                                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">Remember for 30 days</label>
                            </div>
                            <Link href="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#145cfc] hover:bg-[#3373fd] text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98]  disabled:opacity-50 flex items-center justify-center mt-2 cursor-pointer"
                        >
                            {loading ? "Loading..." : "Login"}
                        </button>
                    </form>

                    <div className="text-center text-sm pt-0">
                        <span className="text-muted-foreground">Don't have an account? </span>
                        <Link href="/auth/signup" className="font-bold text-indigo-600 hover:text-indigo-500 transition-all">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}