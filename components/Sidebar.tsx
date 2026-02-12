"use client";

import React, { useRef, useEffect } from 'react';
import {
    LayoutDashboard,
    Database,
    Shield,
    Upload,
    X,
    Settings,
    LogOut,
    MessageSquare,
    FileText,
    User
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MembershipCountdown from './MembershipCountdown';

interface SidebarProps {
    role: string;
    googleSignIn: () => void;
    handleSignOut: () => Promise<void>;
    isOpen: boolean;
    onClose: () => void;
    withHeader?: boolean;
    expiryDate?: string;
}

export default function Sidebar({
    role,
    googleSignIn,
    handleSignOut,
    isOpen,
    onClose,
    withHeader = false,
    expiryDate
}: SidebarProps) {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Close on click outside (Mobile)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                if (window.innerWidth < 768) onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    return (
        <>
            {/* Overlay Mobile */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={onClose} />
            )}

            <div
                ref={sidebarRef}
                className={`fixed top-0 bottom-0 left-0 z-50 w-[330px] bg-[#15171c] md:bg-[#f3f6f9] md:dark:bg-[#101116] transform transition-transform duration-300 ease-in-out p-0 md:p-10 md:pr-5 md:pt-10 h-screen md:h-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 flex flex-col ${withHeader ? 'md:top-[72px]' : ''} shadow-2xl md:shadow-none  `}
            >
                <div className="flex flex-col h-full md:h-auto border-none md:border md:border-[#ffffff1a] rounded-none md:rounded-lg shadow-none md:shadow-[0_0px_15px_#02020210]">
                    {/* Header */}
                    <div className="p-4 border-b border-border flex items-center justify-between bg-card md:hidden ">
                        <Link href="/" className="group cursor-pointer">
                            <h2 className="font-bold text-lg flex items-center gap-2 text-foreground">
                                <div className="bg-blue-600/20 p-1.5 rounded-lg group-hover:bg-[#0095e8] transition-colors">
                                    <Database className="text-blue-500" size={20} />
                                </div>
                                YT Manager
                            </h2>
                        </Link>
                        <button onClick={onClose} className="md:hidden text-muted-foreground hover:text-foreground">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8 bg-card rounded-none md:rounded-tl-lg md:rounded-tr-lg">
                        {/* 1. Navigation Menu */}
                        <nav className="space-y-1.5 ">
                            <h3 className="text-[12px] font-bold text-gray-500 uppercase  tracking-widest px-2 mb-2">Main Menu</h3>

                            <Link
                                href="/dashboard"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${pathname === "/dashboard"
                                    ? "bg-blue-600/10   text-[#1e1e2d] dark:text-blue-400"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                                    }`}
                                onClick={onClose}
                            >
                                <LayoutDashboard size={18} />
                                <span className="font-semibold text-sm">Dashboard</span>
                            </Link>

                            <Link
                                href="/account/overview"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${pathname === "/account/overview"
                                    ? "bg-blue-600/10   text-[#1e1e2d] dark:text-blue-400"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                                    }`}
                                onClick={onClose}
                            >
                                <User size={18} />
                                <span className="font-semibold text-sm">Overview</span>
                            </Link>

                            <div
                                onClick={(e) => { e.preventDefault(); googleSignIn(); onClose(); }}
                                className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                            >
                                <Upload size={18} />
                                <span className="font-semibold text-sm">Tambah Channel</span>
                            </div>

                            <Link
                                href="/settings"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${pathname === "/settings"
                                    ? "bg-blue-600/10   text-[#1e1e2d] dark:text-blue-400"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent"
                                    }`}
                                onClick={onClose}
                            >
                                <Settings size={18} />
                                <span className="font-semibold text-sm">Settings</span>
                            </Link>

                            {role === 'admin' && (
                                <Link
                                    href="/admin"
                                    className={`flex mb-10 items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200   ${pathname === "/admin"
                                        ? "bg-blue-600/10   text-[#1e1e2d] dark:text-blue-400"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent "
                                        }`}
                                    onClick={onClose}
                                >
                                    <Shield size={18} />
                                    <span className="font-semibold text-sm">Kelola User</span>
                                </Link>
                            )}
                             {expiryDate && role !== 'admin' && role !== 'inactive' && (
                                <div className="-mx-4 -mb-3 mt-20">
                                    <MembershipCountdown expiryDate={expiryDate} />
                                </div>
                            )}
                        </nav>
                    </div>

                    {/* Footer Status */}
                    <div className=" p-4 border-t border-border bg-card rounded-none md:rounded-bl-lg md:rounded-br-lg">
                        <div className="flex flex-col gap-3">
                           

                            <div className="flex items-center gap-3 px-2 ">
                                <div className="relative">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse relative z-10" />
                                    <div className="absolute inset-0 bg-green-500 blur-[2px] animate-pulse" />
                                </div>
                                <span className="text-xs text-muted-foreground font-medium tracking-wide">System Operational</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>
    );
}
