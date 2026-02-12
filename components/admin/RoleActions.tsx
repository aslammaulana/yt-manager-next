"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Shield, ShieldAlert, CheckCircle, XCircle, Clock, ChevronDown, MoreVertical } from "lucide-react";

interface RoleActionsProps {
    userId: string;
    currentRole: string;
    updateRole: (userId: string, newRole: string) => void;
    updating: string | null;
    children?: React.ReactNode;
}

const RoleActions: React.FC<RoleActionsProps> = ({ userId, currentRole, updateRole, updating, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    const togglePopover = () => setIsOpen(!isOpen);

    const handleRoleSelect = (role: string) => {
        updateRole(userId, role);
        setIsOpen(false);
    };

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    if (updating === userId) {
        return <span className="text-xs text-blue-400 animate-pulse">Updating...</span>;
    }

    const roles = [
        { id: 'admin', label: 'Admin', icon: ShieldAlert, color: 'text-[#101929] dark:[#ffffff]/90', bg: 'bg-blue-500/10' },
        { id: 'member', label: 'Member', icon: CheckCircle, color: 'text-[#101929] dark:[#ffffff]/90', bg: 'bg-green-500/10' },
        { id: 'trial', label: 'Trial', icon: Clock, color: 'text-[#101929] dark:[#ffffff]/90', bg: 'bg-yellow-500/10' },
        { id: 'inactive', label: 'Inactive', icon: XCircle, color: 'text-[#101929] dark:[#ffffff]/90', bg: 'bg-red-500/10' },
    ];

    return (
        <div className="relative inline-block" ref={popoverRef}>
            <div onClick={togglePopover} className="cursor-pointer">
                {children || (
                    <button
                        className="p-2 hover:bg-accent rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                        title="Change Role"
                    >
                        <MoreVertical size={16} className="text-muted-foreground" />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-xs font-semibold text-muted-foreground">Change Role</p>
                    </div>
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => handleRoleSelect(role.id)}
                            disabled={currentRole === role.id}
                            className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-accent transition-colors ${currentRole === role.id ? 'text-blue-500 bg-blue-500/20 cursor-not-allowed' : ''
                                }`}
                        >
                            <role.icon size={14} className={role.color} />
                            <span className={currentRole === role.id ? 'font-semibold' : ''}>{role.label}</span>
                            {currentRole === role.id && <CheckCircle size={12} className="ml-auto text-primary" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoleActions;
