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
    User,
    Play,
    Plus,
    CreditCard,
    CircleUser,
    ClockPlus
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

    const isActive = (path: string) => pathname === path;

    const MenuItem = ({ href, icon: Icon, label, onClick }: { href?: string, icon: any, label: string, onClick?: () => void }) => {
        const active = href ? isActive(href) : false;

        const content = (
            <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${active
                ? "bg-blue-600/10 text-[#1e1e2d] dark:text-blue-400"
                : "text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground border border-transparent"
                }`}>
                <Icon size={18} />
                <span className="font-semibold text-[14px]">{label}</span>
            </div>
        );

        if (href) {
            return (
                <Link href={href} onClick={onClose} className="block">
                    {content}
                </Link>
            );
        }

        return (
            <div onClick={onClick} className="cursor-pointer">
                {content}
            </div>
        );
    };

    return (
        <>


            {/* Overlay Mobile */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={onClose} />
            )}

            <div
                ref={sidebarRef}
                className={`fixed left-0 z-50 w-[330px] bg-[#15171c] md:bg-[#f3f6f9] md:dark:bg-[#101116] transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 flex flex-col shadow-2xl md:shadow-none
                /* LOGIC POSISI & TINGGI: */
                ${withHeader ? 'top-0 md:top-[72px]' : 'top-0'} 
                bottom-0 /* Memaksa sidebar memanjang sampai bawah */
                p-0 md:p-10 md:pr-5 md:pt-10 /* Padding desktop tetap sama */
                `}
            >
                {/* Container Inner: 
                   h-full: Mengisi tinggi parent (fixed top-bottom)
                   flex flex-col: Agar bisa menata Header, Menu, Footer secara vertikal
                */}
                <div className="flex flex-col h-full border-none md:border md:border-[#ffffff1a] rounded-none md:rounded-lg shadow-none md:shadow-[0_0px_15px_#02020210]">

                    {/* Header (Mobile Only) */}
                    <div className="p-4 border-b border-border flex items-center justify-between bg-card md:hidden flex-shrink-0">
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

                    {/* MAIN CONTENT AREA
                        flex-1: Mengambil semua sisa ruang yang tersedia, mendorong footer ke bawah
                        overflow-y-auto: Agar bisa discroll jika konten panjang
                        sidebar-scroll-area: Class custom untuk efek scrollbar
                    */}
                    <div className="flex-1 overflow-y-auto sidebar-scroll-area p-4 space-y-6 bg-card rounded-none md:rounded-tl-lg md:rounded-tr-lg">




                        {expiryDate && role !== 'admin' && role !== 'inactive' && (
                            <div className=" ">
                                <MembershipCountdown expiryDate={expiryDate} />
                            </div>
                        )}
                        {/* MAIN MENU */}
                        <div className="space-y-1">
                            <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">Main Menu</h3>

                            <MenuItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                            <MenuItem href="/dashboard/live" icon={Play} label="Live Stream" />
                            <MenuItem
                                icon={Plus}
                                label="Tambah Channel"
                                onClick={() => { googleSignIn(); onClose(); }}
                            />
                        </div>



                        {/* AKUN */}
                        <div className="space-y-1">
                            <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">Akun</h3>

                            <MenuItem href="/account/overview" icon={CircleUser} label="Overview" />
                            <MenuItem href="/account/settings" icon={Settings} label="Pengaturan" />
                            <MenuItem href="/account/transactions" icon={CreditCard} label="Transaksi" />
                            <MenuItem href="/account/activity" icon={ClockPlus} label="Kelola Aktifitas" />
                            <MenuItem href="/pricing" icon={CreditCard} label="Pricing" />
                        </div>

                        {/* ADMIN */}
                        {role === 'admin' && (
                            <div className="space-y-1 ">
                                <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-2">Admin</h3>
                                <MenuItem href="/dashboard/admin" icon={Shield} label="Kelola Users" />
                                <MenuItem href="/dashboard/admin/transactions" icon={CreditCard} label="Kelola Pesanan" />
                            </div>
                        )}

                    </div>

                    {/* Footer Status */}
                    <div className="p-4 border-t border-border bg-card rounded-none md:rounded-bl-lg md:rounded-br-lg flex-shrink-0">
                        <div className="flex items-center gap-3 px-2">
                            <div className="relative">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse relative z-10" />
                                <div className="absolute inset-0 bg-green-500 blur-[2px] animate-pulse" />
                            </div>
                            <span className="text-xs text-muted-foreground font-medium tracking-wide">System Operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}