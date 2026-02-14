"use client";

import { useEffect, useState } from "react";
import { createClient } from '@/utils/supabase/client';
import DesktopHeader from "@/components/DesktopHeader";
import AppSidebar from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";
import { Check, Shield, Zap, Star } from "lucide-react";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function PricingPage() {
    const supabase = createClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                // Fetch profile logic similar to dashboard to ensure we have role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                setUser({ ...session.user, profile });
            }
            setLoading(false);
        };
        getUser();
    }, []);

    const plans = [
        {
            name: "Member 1 Bulan",
            price: "15.000",
            duration: "/bulan",
            features: [
                "Akses Full Fitur",
                "Unlimited Channel",
                "Priority Support",
                "Update Gratis"
            ],
            recommended: false,
            color: "blue",
            link: "/checkout/1-bulan"
        },
        {
            name: "Member 2 Bulan",
            price: "25.000",
            duration: "/2 bulan",
            features: [
                "Hemat Rp 5.000",
                "Akses Full Fitur",
                "Unlimited Channel",
                "Priority Support"
            ],
            recommended: true,
            color: "indigo", // Premium look
            link: "/checkout/2-bulan"
        },
        {
            name: "Member 3 Bulan",
            price: "35.000",
            duration: "/3 bulan",
            features: [
                "Hemat Rp 10.000",
                "Akses Full Fitur",
                "Unlimited Channel",
                "Priority Support"
            ],
            recommended: false,
            color: "purple",
            link: "/checkout/3-bulan"
        }
    ];

    return (
        <div className="relative z-1 min-h-screen bg-background text-foreground">
            {/* --- LAYOUT HEADER & SIDEBAR --- */}
            <DesktopHeader user={user} />
            <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} withHeader={true} />

            <div className="flex flex-col min-w-0 md:ml-[330px] md:pt-[72px] transition-all duration-300">
                <MobileHeader onMenuClick={() => setSidebarOpen(true)} user={user} />

                <main className="p-6 md:p-10 w-full overflow-x-hidden flex flex-col items-center">

                    <div className="max-w-4xl w-full space-y-8">
                        <div className="text-center space-y-4 mb-12">
                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                                Simple Pricing, <span className="text-primary">Powerful Results</span>
                            </h1>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                Pilih paket yang sesuai dengan kebutuhan Anda. Upgrade kapan saja untuk mendapatkan akses lebih lama dan hemat biaya.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {plans.map((plan, index) => (
                                <div
                                    key={index}
                                    className={`relative flex flex-col p-6 rounded-2xl border ${plan.recommended ? 'border-primary/50 shadow-xl scale-105 z-10 bg-card' : 'border-border bg-card shadow-sm'} transition-all hover:shadow-md`}
                                >
                                    {plan.recommended && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="mb-5">
                                        <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                                        <div className="mt-4 flex items-baseline">
                                            <span className="text-3xl font-bold tracking-tight">Rp {plan.price}</span>
                                            {/* <span className="ml-1 text-sm font-medium text-muted-foreground">{plan.duration}</span> */}
                                        </div>
                                    </div>

                                    <ul className="space-y-4 mb-8 flex-1">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                                <Check className={`h-5 w-5 shrink-0 ${plan.recommended ? 'text-primary' : 'text-blue-500'}`} />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href={plan.link}
                                        className={`w-full py-3 px-4 rounded-xl text-center text-sm font-semibold transition-all active:scale-[0.98] ${plan.recommended
                                                ? 'bg-[#0ea5e9] hover:bg-[#0284c7] text-white shadow-md hover:shadow-lg'
                                                : 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                                            }`}
                                    >
                                        Pilih Paket
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {/* Money Back / Secure Badge */}
                        <div className="mt-16 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border text-xs text-muted-foreground">
                                <Shield size={14} />
                                <span>Secure Payment & Instant Activation</span>
                            </div>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}
