"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

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

    const [rememberMe, setRememberMe] = useState(false);

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
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

            {/* LEFT SIDE: BRANDING */}
            <div className="relative hidden md:flex flex-col justify-between  p-12 overflow-hidden  text-[#101929] dark:text-[#f3f6f9]">
                {/* Background decorative elements could go here */}
                <div className="absolute inset-0 bg-background pointer-events-none" />

                <div className="relative z-10 mt-20 ">
                    <h1 className="text-5xl font-bold mb-4">Bang Memed YT Manage</h1>
                    <p className="text-xl ">All in one YouTube Management</p>
                </div>

                <div className="relative z-10">
                    <p className="text-sm">Copyright © 2024 - Bang Memed</p>
                </div>
            </div>

            {/* RIGHT SIDE: FORM */}
            <div className="flex flex-col relative bg-background text-foreground p-6 sm:p-12 lg:p-10 justify-center">

                <div className=" bg-card px-6 py-10 rounded-xl shadow-[0_0px_5px_#02020210]">
                    {/* Theme Toggle - Top Right */}
                <div className="">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border">
                        <span>Mode:</span>
                        <ThemeToggle />
                    </div>
                </div>

                <div className="w-full max-w-md mx-auto ">
                    <h2 className="text-3xl font-bold mb-8">Masuk ke akun Anda!</h2>

                    {/* Error Message */}
                    {msg && (
                        <div className="flex items-center gap-2 bg-destructive/10 text-destructive p-3 rounded-lg mb-6 text-sm border border-destructive/30">
                            <AlertCircle size={16} />
                            {msg}
                        </div>
                    )}

                    <form onSubmit={handleEmailLogin} className="space-y-6">

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Alamat Email</label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@email.com"
                                    className="w-full bg-background border border-input rounded-lg px-4 py-3 pl-10 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                                    required
                                />
                                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Kata Sandi</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-background border border-input rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group select-none">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-border bg-background checked:border-primary checked:bg-primary transition-all"
                                    />
                                    <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Ingat saya</span>
                            </label>

                            <Link href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                                Lupa Kata Sandi?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Memproses...</span>
                                </div>
                            ) : (
                                "MASUK"
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-muted-foreground">
                            Belum punya akun?{' '}
                            <Link href="/signup" className="text-primary font-semibold hover:underline">
                                Daftar Sekarang
                            </Link>
                        </p>
                    </div>
                </div>
                </div>
            </div>
        </div>
    );
}
