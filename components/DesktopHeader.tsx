"use client";

import { Database } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface DesktopHeaderProps {
    user?: {
        email?: string;
        user_metadata?: {
            full_name?: string;
            name?: string;
        };
    } | null;
}

export default function DesktopHeader({ user }: DesktopHeaderProps) {
    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || "User";
    const email = user?.email || "No Email";

    return (
        <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 w-full items-center justify-between h-[72px] px-10 border-b border-border bg-[#101828] dark:bg-[#101828]">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <div className="bg-blue-600/20 p-2 rounded-lg">
                    <Database className="text-blue-500" size={22} />
                </div>
                <span className="font-bold text-white dark:text-white text-xl tracking-tight">YT Manager</span>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Info */}
                <div className="flex items-center gap-3 px-3 py-1.5 hover:bg-[#ffffff18] rounded-md ">
                    <div className="flex flex-col items-end ">
                        <span className="text-[11px] text-white dark:text-white font-semibold">{displayName}</span>
                        <span className="text-[11px] text-white/40 dark:text-white/40">{email}</span>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden ">
                        <img
                            src="/user.svg"
                            alt="User"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
