import React from 'react';
import RoleBadge from './RoleBadge';
import RoleActions from './RoleActions';

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

interface UserTableProps {
    profiles: Profile[];
    loading: boolean;
    updating: string | null;
    updateRole: (userId: string, newRole: string) => void;
}

const UserTable: React.FC<UserTableProps> = ({ profiles, loading, updating, updateRole }) => {
    return (
        <div className="hidden md:block overflow-x-auto bg-card border border-border rounded-lg shadow-[0_0px_5px_#02020210]">
            <table className="w-full text-left border-collapse ">
                <thead>
                    <tr className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider border-b border-border  ">
                        <th className="p-4 font-semibold">User</th>
                        <th className="p-4 font-semibold">WhatsApp</th>
                        <th className="p-4 font-semibold">Role</th>
                        <th className="p-4 font-semibold text-right">Joined At</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {loading && (
                        <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading users...</td></tr>
                    )}
                    {!loading && profiles.length === 0 && (
                        <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No users found</td></tr>
                    )}
                    {!loading && profiles.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/50 transition duration-150">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-linear-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold shrink-0 text-white">
                                        {(user.full_name || user.email)?.substring(0, 2).toUpperCase() || "??"}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm text-foreground">{user.full_name || user.email || "No name"}</div>
                                        <div className="text-[11px] text-muted-foreground">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <span className="text-sm text-muted-foreground">{user.whatsapp || '-'}</span>
                            </td>
                            <td className="p-4">
                                <RoleActions
                                    userId={user.id}
                                    currentRole={user.role}
                                    updateRole={updateRole}
                                    updating={updating}
                                >
                                    <div className="flex flex-col gap-1 items-start cursor-pointer hover:opacity-80 transition-opacity">
                                        <RoleBadge role={user.role} />
                                        {user.access_expires_at && (user.role === 'member' || user.role === 'trial' || user.role === 'inactive') && (
                                            <span className={`text-[10px] ${user.role === 'inactive' ? 'text-muted-foreground ' : 'text-muted-foreground'}`}>
                                                {user.role === 'inactive' ? 'Last Exp: ' : 'Exp: '}
                                                {new Date(user.access_expires_at).toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </RoleActions>
                            </td>
                            <td className="p-4 text-right text-xs text-muted-foreground">
                                {new Date(user.created_at).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
