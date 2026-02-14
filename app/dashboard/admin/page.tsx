"use client";

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppSidebar from "@/components/AppSidebar";
import DesktopHeader from "@/components/DesktopHeader";
import MobileHeader from "@/components/MobileHeader";
import AdminHeader from "@/components/admin/AdminHeader";
import UserTable from "@/components/admin/UserTable";
import UserCard from "@/components/admin/UserCard";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface Profile {
    id: string;
    email: string;
    full_name?: string;
    username?: string;
    whatsapp?: string;
    role: 'admin' | 'member' | 'trial' | 'inactive';
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
    const [durationRole, setDurationRole] = useState<'member' | 'trial'>('member');

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
        // If role is member or trial and no duration selected yet, open modal
        if ((newRole === 'member' || newRole === 'trial') && duration === undefined) {
            const user = profiles.find(p => p.id === userId);
            if (user) {
                setSelectedUser(user);
                setDurationRole(newRole as 'member' | 'trial');
                setShowDurationModal(true);
            }
            return;
        }

        if (!confirm(`Yakin ingin mengubah role menjadi ${newRole}?`)) return;
        setUpdating(userId);

        let access_expires_at = null;
        if ((newRole === 'member' || newRole === 'trial') && duration) {
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

    // Auto-Expire Logic
    useEffect(() => {
        if (profiles.length === 0) return;

        const checkAndExpireUsers = async () => {
            const now = new Date();
            const expiredUsers = profiles.filter(p =>
                (p.role === 'member' || p.role === 'trial') &&
                p.access_expires_at &&
                new Date(p.access_expires_at) < now
            );

            if (expiredUsers.length > 0) {
                console.log(`Found ${expiredUsers.length} expired users. Auto-expiring...`);

                // Process singly or bulk? For now singly to reuse API, or I can create a bulk endpoint.
                // Given the API structure, likely single calls.
                // But better to just call the API for each.

                for (const user of expiredUsers) {
                    try {
                        await fetch('/api/admin/profiles', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: user.id,
                                newRole: 'inactive',
                                access_expires_at: user.access_expires_at // Keep the expiry date as "last seen"
                            }),
                        });
                    } catch (err) {
                        console.error("Failed to auto-expire user", user.id, err);
                    }
                }
                // Refresh profiles after expiring
                fetchProfiles();
            }
        };

        checkAndExpireUsers();
    }, [profiles.length]); // Check when profiles changes (loaded)

    // Duration Options
    const durations = [
        { label: '2 Menit (Test)', value: 2 },
        { label: '2 Hari', value: 2 * 24 * 60 },
        { label: '1 Bulan', value: 30 * 24 * 60 },
        { label: '2 Bulan', value: 60 * 24 * 60 },
        { label: '3 Bulan', value: 90 * 24 * 60 },
    ];


    const filteredProfiles = profiles.filter(p =>
        p.email?.toLowerCase().includes(search.toLowerCase()) ||
        p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.whatsapp?.includes(search)
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
                            <AdminHeader
                                search={search}
                                setSearch={setSearch}
                                fetchProfiles={fetchProfiles}
                                loading={loading}
                            />

                            {/* Table (Desktop) & Cards (Mobile) */}
                            <div className="">
                                {/* Desktop Table View */}
                                <UserTable
                                    profiles={filteredProfiles}
                                    loading={loading}
                                    updating={updating}
                                    updateRole={updateRole}
                                />

                                {/* Mobile Box View */}
                                <UserCard
                                    profiles={filteredProfiles}
                                    loading={loading}
                                    updating={updating}
                                    updateRole={updateRole}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Duration Modal */}
                    {showDurationModal && selectedUser && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                            <div className="bg-popover border border-border rounded-lg p-6 w-full max-w-sm shadow-2xl">
                                <h3 className="text-lg font-bold mb-4 text-foreground">Set {durationRole === 'member' ? 'Member' : 'Trial'} Duration</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Select how long <b>{selectedUser.full_name || selectedUser.email}</b> should have {durationRole} access.
                                </p>
                                <div className="grid gap-2">
                                    {durations.map((d) => (
                                        <button
                                            key={d.value}
                                            onClick={() => updateRole(selectedUser.id, durationRole, d.value)}
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
