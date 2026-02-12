"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { IoMdMoon, IoMdSunny } from "react-icons/io";
import { ThemeToggle } from "./ThemeToggle";
import ProfileDropdown from "./ProfileDropdown";

interface MobileHeaderProps {
    onMenuClick: () => void;
    user?: any;
}

export default function MobileHeader({ onMenuClick, user }: MobileHeaderProps) {
    return (
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-[#101828] sticky top-0 z-30">
            {/* Bagian Kiri: Menu & Logo */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="p-2 text-[#ffffffd3] hover:text-[#fffffff6] hover:bg-[#ffffff1a] rounded-lg transition"
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>
                <Link href="/dashboard" className="flex items-center">
                    <span className="font-bold text-lg text-white tracking-tight">
                        YouTube Manager
                    </span>
                </Link>
            </div>

            {/* Bagian Kanan: Mode Toggle & User Profile */}
            <div className="flex items-center gap-3">
                <ThemeToggle />
                <ProfileDropdown
                    user={user}
                    trigger={
                        <img
                            src="/user.svg"
                            alt="User profile"
                            className="h-9 w-9 rounded-md object-cover cursor-pointer hover:opacity-80 transition"
                        />
                    }
                />
            </div>
        </header>
    );
}