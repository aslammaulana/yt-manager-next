"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import DesktopHeader from "@/components/DesktopHeader";
import AppSidebar from "@/components/AppSidebar";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import MobileHeader from "@/components/MobileHeader";

export default function NotFound() {
    const pathname = usePathname();
    const showSidebar = pathname?.startsWith("/dashboard") || pathname?.startsWith("/account");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const supabase = createClient();
        const getUser = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
            }
        };
        getUser();
    }, []);

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-blue-500/30">
            <DesktopHeader user={user} />

            {showSidebar && (
                <>
                    <MobileHeader onMenuClick={() => setSidebarOpen(true)} user={user} />
                    <AppSidebar
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        withHeader={true}
                    />
                </>
            )}

            <main
                className={`flex flex-col items-center justify-center min-h-screen relative overflow-hidden pt-[72px]
          ${showSidebar ? "md:ml-[330px]" : ""}
        `}
            >
                {/* Background Text "404" */}
                <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none z-0">
                    <h1 className="text-[25vw] font-bold text-[#ffffff] dark:text-[#ffffff13] leading-none tracking-tighter">
                        404
                    </h1>
                </div>

                {/* Foreground Content */}
                <div className="relative z-10 flex flex-col items-center text-center space-y-3 px-4">
                    <h2 className="text-4xl md:text-[40px]  font-bold text-foreground tracking-tight">
                        Page not found
                    </h2>

                    <p className="text-foreground/70 text-lg max-w-md mx-auto leading-relaxed">
                        Duis dolor sit amet, consectetur adipiscing elit vestibulum in pharetra.
                    </p>

                    <div className="pt-2">
                        <Link
                            href={showSidebar ? "/dashboard" : "/"}
                            className="group inline-flex items-center gap-4 pl-6 pr-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium transition-all shadow-lg active:scale-95"
                        >
                            <span>Back to home</span>
                            {/* Kotak Putih untuk Icon Panah */}
                            <div className="bg-white text-blue-600 p-2 rounded-xl flex items-center justify-center transition-transform group-hover:translate-x-1">
                                <ArrowRight size={20} />
                            </div>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}