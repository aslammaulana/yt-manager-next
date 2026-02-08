
"use client";

import Link from "next/link";
import { LayoutDashboard, Upload, Settings, Shield, LogOut, X } from "lucide-react";

interface SidebarProps {
    role: string;
    googleSignIn: () => void;
    handleSignOut: () => Promise<void>;
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ role, googleSignIn, handleSignOut, isOpen, onClose }: SidebarProps) {
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
                sidebar fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block md:w-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="side-brand flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="logo p-2 bg-cyan-500/10 rounded-lg">
                            <LayoutDashboard size={24} className="text-cyan-400" />
                        </div>
                        <div className="side-title">
                            <div className="name font-bold">YT Manager</div>
                            <div className="sub text-xs text-cyan-400">PRO EDITION</div>
                        </div>
                    </div>
                    {/* Close Button for Mobile */}
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <nav className="side-nav mt-4">
                    <Link href="/dashboard" className="side-link active" onClick={onClose}>
                        <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <div
                        onClick={(e) => { e.preventDefault(); googleSignIn(); onClose(); }}
                        className="side-link cursor-pointer hover:bg-gray-800"
                    >
                        <Upload size={18} /> Tambah Channel
                    </div>
                    <Link href="/settings" className="side-link" onClick={onClose}>
                        <Settings size={18} /> Settings
                    </Link>
                    {role === 'admin' && (
                        <Link href="/admin" className="side-link" onClick={onClose}>
                            <Shield size={18} /> Kelola User
                        </Link>
                    )}
                </nav>

                <div className="side-footer mt-auto p-4 border-t border-gray-800">
                    <div className="hint text-xs bg-cyan-900/20 text-cyan-200 p-3 rounded-lg mb-4 border border-cyan-500/20">
                        💡 Tip: Token akan auto-refresh jika Anda membuka dashboard ini.
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-2.5 rounded-lg transition font-bold"
                    >
                        <LogOut size={16} /> Keluar
                    </button>
                </div>
            </aside>
        </>
    );
}
