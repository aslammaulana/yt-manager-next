"use client";

import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Users, Shield, ShieldAlert, CheckCircle, XCircle, RefreshCw, LayoutDashboard } from "lucide-react";
import Link from 'next/link';

interface Profile {
    id: string;
    email: string;
    role: 'admin' | 'editor' | 'no_access';
    created_at: string;
}

export default function AdminPage() {
    const supabase = createClient();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

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

    const updateRole = async (userId: string, newRole: string) => {
        if (!confirm(`Are you sure you want to change role to ${newRole}?`)) return;
        setUpdating(userId);

        try {
            const response = await fetch('/api/admin/profiles', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, newRole }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update role');
            }

            // Optimistic update
            setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole as any } : p));
        } catch (e: any) {
            alert("Update failed: " + e.message);
            fetchProfiles(); // Refresh to get correct state
        } finally {
            setUpdating(null);
        }
    };

    useEffect(() => {
        fetchProfiles();
    }, []);

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs font-bold border border-purple-500/50">Admin</span>;
            case 'editor': return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/50">Editor (Pro)</span>;
            default: return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-500/50">No Access</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white p-6 md:p-10 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <ShieldAlert size={32} className="text-purple-500" /> Admin Access Control
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">Manage user roles and permissions</p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/dashboard" className="flex items-center gap-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white px-4 py-2 rounded-lg border border-gray-700 transition">
                            <LayoutDashboard size={18} /> Back to Dashboard
                        </Link>
                        <button onClick={fetchProfiles} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition">
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#252525] text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="p-4 border-b border-gray-700 font-semibold">User / Email</th>
                                    <th className="p-4 border-b border-gray-700 font-semibold">Current Role</th>
                                    <th className="p-4 border-b border-gray-700 font-semibold">Actions</th>
                                    <th className="p-4 border-b border-gray-700 font-semibold text-right">Joined At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {loading && (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading users...</td></tr>
                                )}
                                {!loading && profiles.length === 0 && (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">No users found</td></tr>
                                )}
                                {!loading && profiles.map((user) => (
                                    <tr key={user.id} className="hover:bg-[#252525]/50 transition duration-150">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold">
                                                    {user.email?.substring(0, 2).toUpperCase() || "??"}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm">{user.email || "No email"}</div>
                                                    <div className="text-[10px] text-gray-500 font-mono">{user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {getRoleBadge(user.role)}
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
                                                                className="p-1.5 hover:bg-purple-500/20 text-gray-400 hover:text-purple-400 rounded transition"
                                                                title="Promote to Admin"
                                                            >
                                                                <ShieldAlert size={16} />
                                                            </button>
                                                        )}
                                                        {user.role !== 'editor' && (
                                                            <button
                                                                onClick={() => updateRole(user.id, 'editor')}
                                                                className="p-1.5 hover:bg-green-500/20 text-gray-400 hover:text-green-400 rounded transition"
                                                                title="Set as Editor"
                                                            >
                                                                <CheckCircle size={16} />
                                                            </button>
                                                        )}
                                                        {user.role !== 'no_access' && (
                                                            <button
                                                                onClick={() => updateRole(user.id, 'no_access')}
                                                                className="p-1.5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded transition"
                                                                title="Revoke Access"
                                                            >
                                                                <XCircle size={16} />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right text-xs text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
