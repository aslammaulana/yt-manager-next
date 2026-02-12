"use client";

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, User, Mail, Shield, CheckCircle, AlertCircle, Eye, EyeOff, LayoutDashboard } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import DesktopHeader from "@/components/DesktopHeader";
import MobileHeader from "@/components/MobileHeader";
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function SettingsPage() {
    const supabase = createClient();
    const router = useRouter();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingAuth, setSavingAuth] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile Form
    const [fullName, setFullName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [email, setEmail] = useState('');

    // Login Method State
    const [loginMode, setLoginMode] = useState<'default' | 'email' | 'password'>('default');

    // Change Email Form
    const [newEmail, setNewEmail] = useState('');
    const [confirmPasswordEmail, setConfirmPasswordEmail] = useState('');

    // Change Password Form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Get detailed profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setUser({ ...user, profile });
            setEmail(user.email || '');
            setFullName(profile?.full_name || '');
            setWhatsapp(profile?.whatsapp || '');
            setLoading(false);
        };
        fetchUser();
    }, []);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setSavingProfile(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    whatsapp: whatsapp,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Profil berhasil diperbarui.' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangeEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setSavingAuth(true);

        try {
            // Verify current password first
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: email,
                password: confirmPasswordEmail
            });

            if (signInError) throw new Error("Password konfirmasi salah.");

            // Update Email
            const { error: updateError } = await supabase.auth.updateUser({ email: newEmail });
            if (updateError) throw updateError;

            setMessage({ type: 'success', text: 'Email berhasil diperbarui! Silakan cek email baru Anda untuk konfirmasi.' });
            setLoginMode('default');
            setNewEmail('');
            setConfirmPasswordEmail('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSavingAuth(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password baru minimal 8 karakter.' });
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok.' });
            return;
        }

        setSavingAuth(true);

        try {
            // Verify current password first
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: email,
                password: currentPassword
            });

            if (signInError) throw new Error("Password saat ini salah.");

            // Update Password
            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
            if (updateError) throw updateError;

            setMessage({ type: 'success', text: 'Password berhasil diperbarui!' });
            setLoginMode('default');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSavingAuth(false);
        }
    };

    const resetForms = () => {
        setLoginMode('default');
        setMessage(null);
        setNewEmail('');
        setConfirmPasswordEmail('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
    };

    return (
        <div className="relative z-1 min-h-screen bg-background text-foreground">
            <DesktopHeader user={user} />
            <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} withHeader={true} />

            <div className="flex flex-col min-w-0 md:ml-[330px] md:pt-[72px] transition-all duration-300">
                <MobileHeader onMenuClick={() => setSidebarOpen(true)} user={user} />

                <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">Pengaturan Akun</h1>
                            <p className="text-muted-foreground text-sm mt-1">Kelola informasi profil dan keamanan akun Anda.</p>
                        </div>
                        <Link href="/dashboard" className="hidden md:flex items-center gap-2 text-sm font-semibold bg-card hover:bg-[#155dfc] hover:text-white text-muted-foreground px-4 py-2 rounded-lg border border-border transition-colors">
                            <LayoutDashboard size={18} /> Dashboard
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {message && (
                                <div className={`flex items-center gap-2 p-4 rounded-lg border ${message.type === 'success'
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                                    }`}>
                                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                    <span className="text-sm font-medium">{message.text}</span>
                                </div>
                            )}

                            {/* DETAIL PROFIL CARD */}
                            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-border bg-muted/20">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">Detail Profil</h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="grid gap-6 md:grid-cols-1">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Alamat Email <span className="text-red-500">*</span></label>
                                            <input
                                                type="email"
                                                value={email}
                                                disabled
                                                className="w-full bg-muted/40 border border-border rounded-lg px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed opacity-70"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">Nama Lengkap <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-foreground">No WhatsApp <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={whatsapp}
                                                onChange={(e) => setWhatsapp(e.target.value)}
                                                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors"
                                                placeholder="628..."
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-muted/20 border-t border-border flex justify-end">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={savingProfile}
                                        className="bg-[#155dfc] hover:bg-[#155dfc]/90 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                                    >
                                        {savingProfile && <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></div>}
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </div>

                            {/* METODE LOGIN CARD */}
                            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-border bg-muted/20">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">Metode Login</h2>
                                </div>

                                <div className="p-6">
                                    {/* DEFAULT VIEW */}
                                    {loginMode === 'default' && (
                                        <div className="space-y-8">
                                            {/* Email Row */}
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-medium text-muted-foreground">Alamat Email</div>
                                                    <div className="text-base font-semibold text-foreground break-all">{email}</div>
                                                </div>
                                                <button
                                                    onClick={() => { setLoginMode('email'); setMessage(null); }}
                                                    className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors border border-border cursor-pointer self-start md:self-auto shrink-0"
                                                >
                                                    Ganti Email
                                                </button>
                                            </div>

                                            <div className="border-t border-dashed border-border"></div>

                                            {/* Password Row */}
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-medium text-muted-foreground">Kata Sandi</div>
                                                    <div className="text-base font-semibold text-foreground tracking-widest">************</div>
                                                </div>
                                                <button
                                                    onClick={() => { setLoginMode('password'); setMessage(null); }}
                                                    className="px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors border border-border cursor-pointer self-start md:self-auto shrink-0"
                                                >
                                                    Ganti Kata Sandi
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* CHANGE EMAIL FORM */}
                                    {loginMode === 'email' && (
                                        <form onSubmit={handleChangeEmail} className="space-y-6">
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-foreground">Alamat Email Baru <span className="text-red-500">*</span></label>
                                                    <input
                                                        type="email"
                                                        required
                                                        value={newEmail}
                                                        onChange={(e) => setNewEmail(e.target.value)}
                                                        className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-foreground">Konfirmasi Kata Sandi <span className="text-red-500">*</span></label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            required
                                                            value={confirmPasswordEmail}
                                                            onChange={(e) => setConfirmPasswordEmail(e.target.value)}
                                                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors"
                                                            placeholder="Masukkan kata sandi saat ini"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                                        >
                                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 pt-2">
                                                <button
                                                    type="submit"
                                                    disabled={savingAuth}
                                                    className="bg-[#155dfc] hover:bg-[#155dfc]/90 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                                                >
                                                    {savingAuth && <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></div>}
                                                    Perbarui Email
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={resetForms}
                                                    className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                                                >
                                                    Batal
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {/* CHANGE PASSWORD FORM */}
                                    {loginMode === 'password' && (
                                        <form onSubmit={handleChangePassword} className="space-y-6">
                                            <div className="border-b border-dashed border-border/50 pb-6 mb-6">
                                                <div className="space-y-2 max-w-md">
                                                    <label className="text-sm font-medium text-foreground">Kata Sandi Saat Ini <span className="text-red-500">*</span></label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            required
                                                            value={currentPassword}
                                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                                                        >
                                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-foreground">Kata Sandi Baru <span className="text-red-500">*</span></label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            required
                                                            minLength={8}
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-foreground">Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span></label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            required
                                                            minLength={8}
                                                            value={confirmNewPassword}
                                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                                            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-xs text-muted-foreground italic flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 p-2 rounded border border-yellow-500/20 w-fit">
                                                <AlertCircle size={14} />
                                                Kata sandi harus minimal 8 karakter dan mengandung simbol.
                                            </div>

                                            <div className="flex items-center gap-3 pt-2">
                                                <button
                                                    type="submit"
                                                    disabled={savingAuth}
                                                    className="bg-[#155dfc] hover:bg-[#155dfc]/90 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                                                >
                                                    {savingAuth && <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></div>}
                                                    Perbarui Kata Sandi
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={resetForms}
                                                    className="text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                                                >
                                                    Batal
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
