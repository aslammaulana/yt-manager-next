"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface ProfileDropdownProps {
    user: any;
    trigger: React.ReactNode;
}

export default function ProfileDropdown({ user, trigger }: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || "User";
    const email = user?.email || "No Email";

    return (
        <div className="relative" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-border flex items-center gap-3 bg-muted/30">
                        <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                            <img
                                src="/user.svg"
                                alt="User"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm truncate text-foreground">{displayName}</span>
                                <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded border border-blue-500/20 font-medium">(Trial)</span>
                            </div>
                            <span className="text-xs text-muted-foreground truncate">{email}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-1 flex flex-col gap-1">
                        <Link
                            href="/settings"
                            className="flex items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Pengaturan Akun
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-muted rounded-md transition-colors text-left"
                        >
                            Keluar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
