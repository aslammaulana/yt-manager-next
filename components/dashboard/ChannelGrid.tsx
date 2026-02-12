import React from 'react';
import Link from 'next/link';
import { Trash2, Video } from "lucide-react";

// Reuse types or import if exported
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

interface ChannelGridProps {
    channels: MergedChannel[];
    loading: boolean;
    search: string;
    formatNumber: (n: number | string) => string;
    handleDelete: (email: string) => void;
    handleManagerOpen: (ch: MergedChannel) => void;
}

const ChannelGrid: React.FC<ChannelGridProps> = ({ channels, loading, search, formatNumber, handleDelete, handleManagerOpen }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading && <div className="col-span-2 text-center py-8 text-muted-foreground">Loading data...</div>}

            {!loading && channels.map((ch, idx) => {
                if (!ch.name.toLowerCase().includes(search.toLowerCase())) return null;
                return (
                    <div key={idx} className="bg-card border border-border rounded-lg p-4 flex flex-col gap-3 relative shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <img src={ch.thumbnail} alt="" className="w-10 h-10 rounded-full border border-border" />
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-foreground text-base truncate">{ch.name}</div>
                                <div className="text-xs text-muted-foreground flex gap-2 items-center">
                                    <span>{ch.isExpired ? '---' : formatNumber(ch.subs)} Subs</span>
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                                    <span>{ch.isExpired ? '---' : formatNumber(ch.views)} Views</span>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(ch.emailSource)} className="text-muted-foreground hover:text-red-500 transition-colors p-1 cursor-pointer">
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div className="mt-2 bg-muted/30 p-3 rounded-lg border border-border/50">
                            <div className="text-center">
                                <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">3D Views</div>
                                <div className="text-yellow-500 font-bold text-xl">{ch.isExpired ? '-' : formatNumber(ch.realtime.h48)}</div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-auto">
                            {ch.isExpired ? (
                                <div className="w-full text-center p-2 bg-red-500/10 text-red-500 rounded-lg text-sm font-bold border border-red-500/20">
                                    EXPIRED
                                </div>
                            ) : (
                                <>
                                    <button onClick={() => handleManagerOpen(ch)} className="flex-1 bg-[#155dfc] hover:bg-[#155dfc]/90 text-white p-2 rounded-lg font-bold text-sm transition text-center shadow-lg shadow-blue-500/20 cursor-pointer">
                                        UPLOAD
                                    </button>
                                    <Link href={`/videos?id=${ch.id}&email=${ch.emailSource}`} className="p-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg flex items-center justify-center border border-border transition-colors cursor-pointer">
                                        <Video size={18} />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

export default ChannelGrid;
