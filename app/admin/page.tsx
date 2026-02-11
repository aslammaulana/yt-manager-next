"use client";

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Users, Shield, ShieldAlert, CheckCircle, XCircle, RefreshCw, LayoutDashboard, Search } from "lucide-react";
import Link from 'next/link';
import AppSidebar from "@/components/AppSidebar";
import DesktopHeader from "@/components/DesktopHeader";
import MobileHeader from "@/components/MobileHeader";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface Profile {
    id: string;
    email: string;
    role: 'admin' | 'editor' | 'no_access';
    created_at: string;
    access_expires_at?: string | null;
}

export default function AdminPage() {
    const supabase = createClient();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [search, setSearch] = useState('');

    // User for Header
    const [user, setUser] = useState<any>(null);

    // Duration Modal State
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [showDurationModal, setShowDurationModal] = useState(false);

    const fetchProfiles = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/profiles');
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch profiles');
            }
            const data = await response.json();
            setProfiles(data as Profile[]);
        } catch (err: any) {
            alert("Error fetching profiles: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Fetch current user for header
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                setUser({ ...user, profile });
            }
        };
        fetchUser();
        fetchProfiles();
    }, []);

    const updateRole = async (userId: string, newRole: string, duration?: number) => {
        // If role is editor and no duration selected yet, open modal
        if (newRole === 'editor' && duration === undefined) {
            const user = profiles.find(p => p.id === userId);
            if (user) {
                setSelectedUser(user);
                setShowDurationModal(true);
            }
            return;
        }

        if (!confirm(`Are you sure you want to change role to ${newRole}?`)) return;
        setUpdating(userId);

        let access_expires_at = null;
        if (newRole === 'editor' && duration) {
            const now = new Date();
            // duration in minutes
            access_expires_at = new Date(now.getTime() + duration * 60000).toISOString();
        }

        try {
            const response = await fetch('/api/admin/profiles', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, newRole, access_expires_at }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update role');
            }

            // Optimistic update
            setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole as any, access_expires_at } : p));
        } catch (e: any) {
            alert("Update failed: " + e.message);
            fetchProfiles(); // Refresh to get correct state
        } finally {
            setUpdating(null);
            setShowDurationModal(false);
            setSelectedUser(null);
        }
    };

    // Duration Options
    const durations = [
        { label: '2 Menit (Test)', value: 2 },
        { label: '2 Hari', value: 2 * 24 * 60 },
        { label: '1 Bulan', value: 30 * 24 * 60 },
        { label: '2 Bulan', value: 60 * 24 * 60 },
        { label: '3 Bulan', value: 90 * 24 * 60 },
    ];

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return <span className="bg-purple-500/20 text-[#101828] dark:text-[#ffffffe0] px-2 py-1 rounded text-xs font-bold border border-purple-500/50">Admin</span>;
            case 'editor': return <span className="bg-green-500/20 text-[#101828] dark:text-[#ffffffe0] px-2 py-1 rounded text-xs font-bold border border-green-500/50">Editor (Pro)</span>;
            default: return <span className="bg-red-500/20 text-[#101828] dark:text-[#ffffffe0] px-2 py-1 rounded text-xs font-bold border border-red-500/50">No Access</span>;
        }
    };

    const filteredProfiles = profiles.filter(p =>
        p.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative z-1 min-h-screen bg-background">
            {/* DESKTOP HEADER - FIXED TOP */}
            <DesktopHeader user={user} />

            <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} withHeader={true} />

            <div className="flex flex-col min-w-0 md:ml-[330px] md:pt-[72px] transition-all duration-300">
                {/* Mobile Header */}
                <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

                <main className="w-full overflow-x-hidden font-sans ">

                    <div className="p-6 md:p-10">
                        <div className="max-w-6xl mx-auto">
                            {/* Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3"> Kelola Users
                                    </h1>
                                    <p className="text-muted-foreground text-sm mt-1">Manage user roles and permissions</p>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border w-full md:w-auto transition-colors focus-within:border-primary/50">
                                        <Search size={16} className="text-muted-foreground" />
                                        <input
                                            type="text"
                                            className="bg-transparent border-none outline-none text-foreground w-full md:w-[250px] text-sm placeholder:text-muted-foreground"
                                            placeholder="Cari Email..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                    <button onClick={fetchProfiles} className="px-5 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all bg-card text-foreground border border-border hover:bg-accent" title="Refresh Data">
                                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                                    </button>
                                </div>
                            </div>

                            {/* Table (Desktop) & Cards (Mobile) */}
                            <div className="">
                                {/* Desktop Table View */}
                                <div className="hidden md:block overflow-x-auto bg-card border border-border rounded-lg shadow-2xl">
                                    <table className="w-full text-left border-collapse ">
                                        <thead>
                                            <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider border-b border-border  ">
                                                <th className="p-4 font-semibold">User / Email</th>
                                                <th className="p-4 font-semibold">Current Role</th>
                                                <th className="p-4 font-semibold">Actions</th>
                                                <th className="p-4 font-semibold text-right">Joined At</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {loading && (
                                                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading users...</td></tr>
                                            )}
                                            {!loading && filteredProfiles.length === 0 && (
                                                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No users found</td></tr>
                                            )}
                                            {!loading && filteredProfiles.map((user) => (
                                                <tr key={user.id} className="hover:bg-muted/50 transition duration-150">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold shrink-0 text-white">
                                                                {user.email?.substring(0, 2).toUpperCase() || "??"}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-sm text-foreground">{user.email || "No email"}</div>
                                                                <div className="text-[10px] text-muted-foreground font-mono">{user.id}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col gap-1">
                                                            {getRoleBadge(user.role)}
                                                            {user.access_expires_at && user.role === 'editor' && (
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    Exp: {new Date(user.access_expires_at).toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-2">
                                                            {updating === user.id ? (
                                                                <span className="text-xs text-blue-400 animate-pulse">Updating...</span>
                                                            ) : (
                                                                <>
                                                                    {user.role !== 'admin' && (
                                                                        <button
                                                                            onClick={() => updateRole(user.id, 'admin')}
                                                                            className="p-1.5 hover:bg-purple-500/20 text-muted-foreground hover:text-purple-400 rounded transition"
                                                                            title="Promote to Admin"
                                                                        >
                                                                            <ShieldAlert size={16} />
                                                                        </button>
                                                                    )}
                                                                    {user.role !== 'editor' && (
                                                                        <button
                                                                            onClick={() => updateRole(user.id, 'editor')}
                                                                            className="p-1.5 hover:bg-green-500/20 text-muted-foreground hover:text-green-400 rounded transition"
                                                                            title="Set as Editor"
                                                                        >
                                                                            <CheckCircle size={16} />
                                                                        </button>
                                                                    )}
                                                                    {user.role !== 'no_access' && (
                                                                        <button
                                                                            onClick={() => updateRole(user.id, 'no_access')}
                                                                            className="p-1.5 hover:bg-red-500/20 text-muted-foreground hover:text-red-400 rounded transition"
                                                                            title="Revoke Access"
                                                                        >
                                                                            <XCircle size={16} />
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right text-xs text-muted-foreground">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Box View */}
                                <div className="md:hidden flex flex-col gap-5  rounded-lg">
                                    {loading && <div className="p-8 text-center text-muted-foreground">Loading users...</div>}
                                    {!loading && filteredProfiles.length === 0 && <div className="p-8 text-center text-muted-foreground">No users found</div>}
                                    {!loading && filteredProfiles.map((user) => (
                                        <div key={user.id} className=" flex flex-col gap-3 bg-card border border-border rounded-lg">
                                            {/* User Info */}
                                            <div className="p-4 flex items-center gap-3 ">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold shrink-0 text-white">
                                                    {user.email?.substring(0, 2).toUpperCase() || "??"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-sm break-all text-foreground">{user.email || "No email"}</div>
                                                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">{user.id}</div>
                                                </div>
                                            </div>

                                            {/* Role Badge */}
                                            <div className="flex items-center gap-2 px-4 justify-between">
                                                {getRoleBadge(user.role)}
                                                {user.access_expires_at && user.role === 'editor' && (
                                                    <span className="text-[10px] text-muted-foreground text-right">
                                                        Exp: {new Date(user.access_expires_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="p-4 flex items-center justify-between pt-2 border-t border-border mt-1 bg-muted/40 rounded-lg">
                                                <div className="text-xs text-muted-foreground">
                                                    Joined: {new Date(user.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {updating === user.id ? (
                                                        <span className="text-xs text-blue-400 animate-pulse">Updating...</span>
                                                    ) : (
                                                        <>
                                                            {user.role !== 'admin' && (
                                                                <button
                                                                    onClick={() => updateRole(user.id, 'admin')}
                                                                    className="p-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded transition"
                                                                    title="Promote to Admin"
                                                                >
                                                                    <ShieldAlert size={16} />
                                                                </button>
                                                            )}
                                                            {user.role !== 'editor' && (
                                                                <button
                                                                    onClick={() => updateRole(user.id, 'editor')}
                                                                    className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded transition"
                                                                    title="Set as Editor"
                                                                >
                                                                    <CheckCircle size={16} />
                                                                </button>
                                                            )}
                                                            {user.role !== 'no_access' && (
                                                                <button
                                                                    onClick={() => updateRole(user.id, 'no_access')}
                                                                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition"
                                                                    title="Revoke Access"
                                                                >
                                                                    <XCircle size={16} />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Duration Modal */}
                    {showDurationModal && selectedUser && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                            <div className="bg-popover border border-border rounded-lg p-6 w-full max-w-sm shadow-2xl">
                                <h3 className="text-lg font-bold mb-4 text-foreground">Set Editor Duration</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Select how long <b>{selectedUser.email}</b> should have editor access.
                                </p>
                                <div className="grid gap-2">
                                    {durations.map((d) => (
                                        <button
                                            key={d.value}
                                            onClick={() => updateRole(selectedUser.id, 'editor', d.value)}
                                            className="text-left px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition flex justify-between items-center group"
                                        >
                                            {d.label}
                                            <span className="opacity-0 group-hover:opacity-100 text-blue-400">Select</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <button
                                        onClick={() => { setShowDurationModal(false); setSelectedUser(null); }}
                                        className="text-muted-foreground hover:text-foreground text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
