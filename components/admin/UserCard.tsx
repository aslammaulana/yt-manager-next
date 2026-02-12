import React from 'react';
import RoleBadge from './RoleBadge';
import RoleActions from './RoleActions';

import { Settings } from "lucide-react";

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

interface UserCardProps {
    profiles: Profile[];
    loading: boolean;
    updating: string | null;
    updateRole: (userId: string, newRole: string) => void;
}

const UserCard: React.FC<UserCardProps> = ({ profiles, loading, updating, updateRole }) => {
    return (
        <div className="md:hidden flex flex-col gap-3 rounded-lg">
            {loading && <div className="p-8 text-center text-muted-foreground">Loading users...</div>}
            {!loading && profiles.length === 0 && <div className="p-8 text-center text-muted-foreground">No users found</div>}
            {!loading && profiles.map((user) => (
                <div key={user.id} className="flex flex-col gap-3 bg-card border border-border rounded-lg relative">
                    {/* User Info */}
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold shrink-0 text-white">
                            {(user.full_name || user.email)?.substring(0, 2).toUpperCase() || "??"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm break-all text-foreground">{user.full_name || user.email || "No name"}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{user.email}</div>
                            {user.whatsapp && (
                                <div className="text-[10px] text-muted-foreground mt-0.5">WA: {user.whatsapp}</div>
                            )}
                        </div>
                        {/* Action Button Absolute Top Right */}
                        <div className="absolute top-2 right-2">
                            <RoleActions
                                userId={user.id}
                                currentRole={user.role}
                                updateRole={updateRole}
                                updating={updating}
                            >
                                <button className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                    <Settings size={16} />
                                </button>
                            </RoleActions>
                        </div>
                    </div>

                    {/* Role Badge */}
                    <div className="flex items-center gap-2 px-4 justify-between">
                        <RoleBadge role={user.role} />
                        {user.access_expires_at && (user.role === 'member' || user.role === 'trial') && (
                            <span className="text-[10px] text-muted-foreground text-right">
                                Exp: {new Date(user.access_expires_at).toLocaleDateString()}
                            </span>
                        )}
                    </div>

                    <div className="p-4 flex items-center justify-between pt-2 border-t border-border mt-1 bg-muted/40 rounded-lg">
                        <div className="text-xs text-muted-foreground">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UserCard;
