"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

interface MobileHeaderProps {
    onMenuClick: () => void;
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
    return (
        <header className="md:hidden flex items-center justify-between p-4  pl-6 border-b border-gray-800 bg-[#101828] sticky top-0 z-30">
            <Link href="/dashboard" className="flex items-center gap-2">
                <span className="font-bold text-lg text-white">YouTube Manager</span>
            </Link>
            <button
                onClick={onMenuClick}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition"
                aria-label="Open menu"
            >
                <Menu size={24} />
            </button>
        </header>
    );
}
