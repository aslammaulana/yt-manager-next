"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User, Mail, Phone, LogOut, Check, Hash, AlertCircle, CheckCircle } from "lucide-react";
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function CheckoutTrialPage() {
    const router = useRouter();
    const supabase = createClient();

    // UI State
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form State
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [agreed, setAgreed] = useState(false);

    // Default password for all new users
    const DEFAULT_PASSWORD = "1234567890";

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setEmail(user.email || "");
                setFullName(user.user_metadata?.full_name || "");
                setWhatsapp(user.user_metadata?.whatsapp || "");
            }
        };
        getUser();
    }, [supabase]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setFullName("");
        setEmail("");
        setWhatsapp("");
        router.refresh();
    };

    const handleTrial = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(null);

        if (!agreed) {
            setMsg({ type: 'error', text: "Anda harus menyetujui Syarat & Ketentuan" });
            return;
        }

        setLoading(true);

        // Validation
        if (!fullName.trim() || !email.trim() || !whatsapp.trim()) {
            setMsg({ type: 'error', text: "Semua data wajib diisi" });
            setLoading(false);
            return;
        }

        try {
            // If user is already logged in, we might just update or proceed
            // reusing the logic from the original file which assumes signup:

            if (!user) {
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
            } else {
                // User already logged in - maybe update metadata or just redirect?
                // For now, let's assume we just redirect as they already have an account.
                // Or we could update their phone number if changed.
            }

            // 3. Redirect ke dashboard
            setMsg({ type: 'success', text: "Checkout berhasil! Mengalihkan..." });
            setTimeout(() => router.push('/dashboard'), 1000);

        } catch (error: any) {
            setMsg({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center py-10 px-4 relative">

            {/* Theme Toggle */}
            <div className="absolute top-5 right-5 z-50">
                <ThemeToggle />
            </div>

            {/* Header Brand */}
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Bang Memed YT Manager</h1>
            </div>

            <div className="w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden">

                {/* Check Out Header */}
                <div className="bg-muted/30 border-b border-border p-6 flex justify-between items-center">
                    <h2 className="text-xl font-bold tracking-widest">CHECKOUT</h2>
                    <div className="bg-primary/10 text-primary p-2 rounded-md">
                        <Hash size={20} />
                    </div>
                </div>

                <div className="p-6 sm:p-8 space-y-8">

                    {/* 1. DETAIL PESANAN */}
                    <section>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase mb-4 tracking-wider">[1. DETAIL PESANAN]</h3>
                        <div className="space-y-3 bg-muted/20 p-5 rounded-lg border border-border/50">
                            <div className="flex justify-between items-center border-b border-dashed border-border/50 pb-2">
                                <span className="text-muted-foreground">Produk</span>
                                <span className="font-semibold">Trial Membership</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-dashed border-border/50 pb-2">
                                <span className="text-muted-foreground">Harga</span>
                                <span className="font-semibold text-green-500">Gratis</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-dashed border-border/50 pb-2">
                                <span className="text-muted-foreground">Tipe Membership</span>
                                <span className="font-medium bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">Trial</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Masa Aktif Akun</span>
                                <span className="font-semibold">2 Hari</span>
                            </div>
                        </div>
                    </section>

                    <form onSubmit={handleTrial}>

                        {/* Error/Success Message */}
                        {msg && (
                            <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 text-sm border ${msg.type === 'success'
                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                : 'bg-destructive/10 text-destructive border-destructive/20'
                                }`}>
                                {msg.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                {msg.text}
                            </div>
                        )}

                        {/* 2. DETAIL AKUN */}
                        <section className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">[2. DETAIL AKUN]</h3>
                                {user ? (
                                    <button type="button" onClick={handleSignOut} className="text-xs flex items-center gap-1 text-destructive hover:underline">
                                        <LogOut size={12} /> Keluar
                                    </button>
                                ) : (
                                    <Link href="/login" className="text-xs flex items-center gap-1 text-primary hover:underline">
                                        Sudah punya akun? Masuk
                                    </Link>
                                )}
                            </div>

                            <div className="space-y-4">
                                {/* Name */}
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 border-r border-border h-full flex items-center justify-start text-muted-foreground">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Nama Lengkap"
                                        className="w-full bg-background border border-input rounded-lg py-3 pl-14 pr-4 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                        required
                                        readOnly={!!user}
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-1">
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 border-r border-border h-full flex items-center justify-start text-muted-foreground">
                                            <Mail size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Alamat Email"
                                            className="w-full bg-background border border-input rounded-lg py-3 pl-14 pr-4 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all disabled:opacity-70"
                                            required
                                            readOnly={!!user}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground ml-1">* Email harus aktif (disarankan menggunakan gmail)</p>
                                </div>

                                {/* Phone */}
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 border-r border-border h-full flex items-center justify-start text-muted-foreground">
                                        <Phone size={16} />
                                    </div>
                                    <input
                                        type="tel"
                                        value={whatsapp}
                                        onChange={(e) => setWhatsapp(e.target.value)}
                                        placeholder="Nomor WhatsApp (Contoh: 628...)"
                                        className="w-full bg-background border border-input rounded-lg py-3 pl-14 pr-4 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                                        required
                                        readOnly={!!user && !!user.user_metadata?.whatsapp}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* 3. SYARAT DAN KETENTUAN */}
                        <section className="mb-8">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase mb-4 tracking-wider">[3. SYARAT DAN KETENTUAN]</h3>

                            <div className="bg-muted/30 border border-border rounded-lg p-4 h-32 overflow-y-auto text-sm text-muted-foreground mb-4 custom-scrollbar">
                                <p className="font-semibold mb-2">1. Jenis Lisensi Penggunaan</p>
                                <p className="mb-2">1.1 Lisensi Trial: Bersifat gratis dan terbatas untuk penggunaan fitur dasar selama masa percobaan.</p>
                                <ul className="list-disc pl-5 space-y-1 mb-2">
                                    <li>Durasi penggunaan versi trial adalah 2 hari kalender.</li>
                                    <li>Pengguna dilarang menyalahgunakan layanan untuk tindakan ilegal.</li>
                                    <li>Kami berhak menghentikan akses jika ditemukan pelanggaran.</li>
                                </ul>
                                <p className="mb-2">2. Data & Privasi</p>
                                <p>Kami menjaga kerahasiaan data Anda sesuai dengan Kebijakan Privasi yang berlaku.</p>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${agreed ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground bg-background'}`}>
                                    {agreed && <Check size={14} />}
                                    <input
                                        type="checkbox"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="hidden"
                                    />
                                </div>
                                <span className="text-sm font-medium group-hover:text-foreground transition-colors">YA, Saya telah membaca dan menyetujui syarat & ketentuan</span>
                            </label>
                        </section>

                        {/* 4. RINGKASAN */}
                        <section className="mb-8">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase mb-4 tracking-wider">[4. RINGKASAN]</h3>
                            <div className="border-t-2 border-dashed border-border py-4 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>Gratis</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>TOTAL</span>
                                    <span className="text-primary">GRATIS</span>
                                </div>
                            </div>
                            <div className="border-b-2 border-dashed border-border w-full mb-2" />
                        </section>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !agreed}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl text-lg uppercase tracking-widest shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1 group"
                        >
                            {loading ? (
                                <span className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full" />
                            ) : (
                                <>
                                    <span>ORDER SEKARANG</span>
                                    <span className="text-[10px] font-normal normal-case opacity-80 group-hover:opacity-100">Proses aktivasi otomatis instan</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <p className="mt-8 text-sm text-muted-foreground">
                Copyright © 2024 - Bang Memed YT Manager
            </p>
        </div>
    );
}
