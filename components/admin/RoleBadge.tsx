import React from 'react';

interface RoleBadgeProps {
    role: string;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
    switch (role) {
        case 'admin':
            return (
                <span className="bg-blue-500/20 text-[#101828] dark:text-[#ffffffe0] px-2 py-1 rounded text-xs font-bold border border-blue-500/50">
                    Admin
                </span>
            );
        case 'member':
            return (
                <span className="bg-green-500/20 text-[#101828] dark:text-[#ffffffe0] px-2 py-1 rounded text-xs font-bold border border-green-500/50">
                    Member
                </span>
            );
        case 'trial':
            return (
                <span className="bg-yellow-500/20 text-[#101828] dark:text-[#ffffffe0] px-2 py-1 rounded text-xs font-bold border border-yellow-500/50">
                    Trial
                </span>
            );
        default:
            return (
                <span className="bg-red-500/20 text-[#101828] dark:text-[#ffffffe0] px-2 py-1 rounded text-xs font-bold border border-red-500/50">
                    Inactive
                </span>
            );
    }
};

export default RoleBadge;
