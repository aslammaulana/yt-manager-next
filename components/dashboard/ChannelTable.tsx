import React from 'react';
import Link from 'next/link';
import { Trash2, Video } from "lucide-react";

interface MergedChannel {
    id: string;
    gmail: string;
    name: string;
    subs: string;
    views: string;
    thumbnail: string;
    access_token?: string;
    expires_at?: number;
    realtime: { h48: number; error?: string };
    isExpired: boolean;
    emailSource: string;
}

interface ChannelTableProps {
    channels: MergedChannel[];
    loading: boolean;
    search: string;
    formatNumber: (n: number | string) => string;
    handleDelete: (email: string) => void;
    handleManagerOpen: (ch: MergedChannel) => void;
}

const ChannelTable: React.FC<ChannelTableProps> = ({ channels, loading, search, formatNumber, handleDelete, handleManagerOpen }) => {
    return (
        <div className="w-full overflow-x-auto">
            {/* This table style is for desktop mostly, but can scroll on mobile if forced */}
            <table className=" w-full border-collapse">
                <thead>
                    <tr>
                        <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-muted-foreground bg-background font-semibold">Channel Name</th>
                        <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-muted-foreground bg-background font-semibold">Subs</th>
                        <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-muted-foreground bg-background font-semibold">Total Views</th>
                        <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-muted-foreground bg-background font-semibold">3D VIEWS</th>

                        <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-muted-foreground bg-background font-semibold">Upload</th>
                        <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-muted-foreground bg-background font-semibold">Videos</th>
                        <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-muted-foreground bg-background font-semibold">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {loading && (
                        <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading data...</td></tr>
                    )}
                    {!loading && channels.map((ch, idx) => {
                        if (!ch.name.toLowerCase().includes(search.toLowerCase())) return null;
                        return (
                            <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                <td className="px-6 py-4.5 text-sm">
                                    <div className="flex items-center gap-3">
                                        <img src={ch.thumbnail} alt="" className="w-8 h-8 rounded-full border border-border" />
                                        <div className="font-semibold text-foreground">{ch.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4.5 text-sm text-muted-foreground">{ch.isExpired ? '---' : formatNumber(ch.subs)}</td>
                                <td className="px-6 py-4.5 text-sm text-muted-foreground">{ch.isExpired ? '---' : formatNumber(ch.views)}</td>
                                <td className="px-6 py-4.5 text-sm text-yellow-500 font-bold" title={ch.realtime.error || "Realtime 48h"}>
                                    {ch.isExpired ? '---' : formatNumber(ch.realtime.h48)}
                                </td>

                                <td className="px-6 py-4.5 text-sm">
                                    {ch.isExpired ? (
                                        <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs font-bold border border-red-500/20">
                                            EXPIRED
                                        </span>
                                    ) : (
                                        <button onClick={() => handleManagerOpen(ch)} className="bg-[#155dfc]/10 text-[#155dfc] px-3 py-1 rounded-lg text-xs font-bold border border-[#155dfc]/20 cursor-pointer hover:bg-[#155dfc]/20 transition-colors">
                                            UPLOAD
                                        </button>
                                    )}
                                </td>
                                <td className="px-6 py-4.5 text-sm">
                                    {ch.isExpired ? (
                                        <span className="text-muted-foreground cursor-not-allowed flex items-center gap-2 opacity-50">
                                            <Video size={16} /> <span className="text-xs">Lihat</span>
                                        </span>
                                    ) : (
                                        <Link href={`/videos?id=${ch.id}&email=${ch.emailSource}`} className="bg-[#155dfc]/10 text-[#155dfc] px-3 py-1 rounded-lg text-xs font-bold border border-[#155dfc]/20 cursor-pointer hover:bg-[#155dfc]/20 transition-colors inline-flex items-center gap-1" title="View Videos"
                                        > <Video size={14} /> <span className="text-xs">LIHAT</span>
                                        </Link>
                                    )}
                                </td>
                                <td className="px-6 py-4.5 text-sm text-center">
                                    <button onClick={() => handleDelete(ch.emailSource)} className="text-muted-foreground hover:text-red-500 transition-colors cursor-pointer" title="Delete Channel">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ChannelTable;
