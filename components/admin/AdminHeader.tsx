import React from 'react';
import { Search, RefreshCw } from "lucide-react";

interface AdminHeaderProps {
    search: string;
    setSearch: (value: string) => void;
    fetchProfiles: () => void;
    loading: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ search, setSearch, fetchProfiles, loading }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                    Kelola Users
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Manage user roles and permissions</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border w-full md:w-auto transition-colors focus-within:border-primary/50">
                    <Search size={16} className="text-muted-foreground" />
                    <input
                        type="text"
                        className="bg-transparent border-none outline-none text-foreground w-full md:w-[250px] text-sm placeholder:text-muted-foreground"
                        placeholder="Cari Nama / Email / WA..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button
                    onClick={fetchProfiles}
                    className="px-5 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all bg-card text-foreground border border-border hover:bg-accent"
                    title="Refresh Data"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
            </div>
        </div>
    );
};

export default AdminHeader;
