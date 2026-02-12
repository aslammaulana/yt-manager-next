"use client";

import { useEffect, useState } from "react";
import { createClient } from '@/utils/supabase/client';
import DesktopHeader from "@/components/DesktopHeader";
import AppSidebar from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";
import StatsGrid from "@/components/overview/StatsGrid";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function AccountOverview() {
    const supabase = createClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // State Data
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // State Stats (dikelompokkan jadi satu object agar rapi)
    const [stats, setStats] = useState({
        totalChannel: 0,
        totalSubs: 0,
        totalViews: 0
    });

    const fetchProfileAndStats = async () => {
        setLoading(true);
        try {
            // 1. Fetch Session & Profile
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                setProfile(profileData);
            }

            // 2. Fetch Channel Stats
            const response = await fetch('/api/get-stats');
            if (response.ok) {
                const accounts = await response.json();
                if (Array.isArray(accounts)) {
                    let tSubs = 0;
                    let tViews = 0;
                    accounts.forEach((acc: any) => {
                        tSubs += Number(acc.subs || 0);
                        tViews += Number(acc.views || 0);
                    });
                    
                    // Update state sekaligus
                    setStats({
                        totalChannel: accounts.length,
                        totalSubs: tSubs,
                        totalViews: tViews
                    });
                }
            }
        } catch (error) {
            console.error("Error loading account data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileAndStats();
    }, []);

    return (
        <div className="relative z-1 min-h-screen bg-background">
            <DesktopHeader user={user} />
            <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} withHeader={true} />

            <div className="flex flex-col min-w-0 md:ml-[330px] md:pt-[72px] transition-all duration-300">
                <MobileHeader onMenuClick={() => setSidebarOpen(true)} user={user} />

                <main className="p-6 md:p-10 w-full overflow-x-hidden">
                    {/* TOPBAR */}
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Status Akun</h1>
                        <p className="mt-1 text-muted-foreground text-sm">
                            Ringkasan status membership dan performa channel Anda
                        </p>
                    </div>

                    {/* STATS GRID (Komponen yang sudah dipisah) */}
                    <StatsGrid 
                        loading={loading} 
                        profile={profile} 
                        stats={stats} 
                    />

                    {/* FOOTER */}
                    <div className="mt-10 pt-5 border-t border-border text-slate-500 text-center text-sm">
                        &copy; {new Date().getFullYear()} Bang Memed Project. All rights reserved.
                    </div>
                </main>
            </div>
        </div>
    );
}