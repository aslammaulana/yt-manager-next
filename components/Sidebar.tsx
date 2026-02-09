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
    FileText
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
    role: string;
    googleSignIn: () => void;
    handleSignOut: () => Promise<void>;
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({
    role,
    googleSignIn,
    handleSignOut,
    isOpen,
    onClose
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
                className={`fixed inset-y-0 left-0 z-50 w-80 bg-[#101828] border-r border-gray-800 transform transition-transform duration-300 ease-in-out 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:sticky md:top-0 md:translate-x-0 flex flex-col h-screen shadow-2xl md:shadow-none`}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#101828]">
                    <Link href="/" className="group cursor-pointer">
                        <h2 className="font-bold text-lg flex items-center gap-2 text-white">
                            <div className="bg-blue-600/20 p-1.5 rounded-lg group-hover:bg-blue-600/30 transition-colors">
                                <Database className="text-blue-500" size={20} />
                            </div>
                            YT Manager
                        </h2>
                    </Link>
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8">
                    {/* 1. Navigation Menu */}
                    <nav className="space-y-1.5">
                        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">Main Menu</h3>

                        <Link
                            href="/dashboard"
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${pathname === "/dashboard"
                                ? "bg-blue-600/10 border border-blue-600/30 text-blue-400"
                                : "text-gray-400 hover:bg-[#a5a5a518] hover:text-gray-200 border border-transparent"
                                }`}
                            onClick={onClose}
                        >
                            <LayoutDashboard size={18} />
                            <span className="font-semibold text-sm">Dashboard</span>
                        </Link>

                        <div
                            onClick={(e) => { e.preventDefault(); googleSignIn(); onClose(); }}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer text-gray-400 hover:bg-[#a5a5a518] hover:text-gray-200 border border-transparent"
                        >
                            <Upload size={18} />
                            <span className="font-semibold text-sm">Tambah Channel</span>
                        </div>

                        <Link
                            href="/settings"
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${pathname === "/settings"
                                ? "bg-blue-600/10 border border-blue-600/30 text-blue-400"
                                : "text-gray-400 hover:bg-[#a5a5a518] hover:text-gray-200 border border-transparent"
                                }`}
                            onClick={onClose}
                        >
                            <Settings size={18} />
                            <span className="font-semibold text-sm">Settings</span>
                        </Link>

                        {role === 'admin' && (
                            <Link
                                href="/admin"
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${pathname === "/admin"
                                    ? "bg-blue-600/10 border border-blue-600/30 text-blue-400"
                                    : "text-gray-400 hover:bg-[#a5a5a518] hover:text-gray-200 border border-transparent"
                                    }`}
                                onClick={onClose}
                            >
                                <Shield size={18} />
                                <span className="font-semibold text-sm">Kelola User</span>
                            </Link>
                        )}
                    </nav>

                    {/* Example of new nav items structure from request, disabled/hidden for now unless needed */}
                    {/* <nav className="space-y-1.5">
                        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">Workspace</h3>
                        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-400 hover:bg-[#a5a5a518] hover:text-gray-200 border border-transparent cursor-not-allowed opacity-50">
                             <MessageSquare size={18} />
                             <span className="font-semibold text-sm">Chat (Coming Soon)</span>
                        </div>
                    </nav> */}
                </div>

                {/* Footer Status */}
                <div className="p-4 border-t border-gray-800 bg-[#0d131f]">
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm font-semibold border border-transparent hover:border-red-500/20"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>

                        <div className="flex items-center gap-3 px-2 pt-2 border-t border-gray-800/50">
                            <div className="relative">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse relative z-10" />
                                <div className="absolute inset-0 bg-green-500 blur-[2px] animate-pulse" />
                            </div>
                            <span className="text-xs text-gray-400 font-medium tracking-wide">System Operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
