"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from '@/utils/supabase/client';
import {
    LayoutDashboard,
    Upload,
    Settings,
    LogOut,
    RefreshCw,
    Trash2,
    Search,
    Users,
    Eye,
    Activity,
    Zap,
    Video,
    Copy,
    ClipboardPaste,
    Shield,
    Menu,
    X,
    MoreVertical
} from "lucide-react";
import Sidebar from "@/components/Sidebar";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// --- Types ---
interface ChannelData {
    gmail: string;
    name: string;
    subs: string;
    views: string;
    thumbnail: string;
    access_token?: string;
    expires_at?: number;
}

interface MergedChannel extends ChannelData {
    id: string; // Channel ID
    realtime: { h48: number; h60: number; error?: string }; // Added h60
    isExpired: boolean;
    emailSource: string;
}

// --- Constants ---
// NOTE: Use environment variables in production
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "262964938761-4e41cgkbud489toac5midmamoecb3jrq.apps.googleusercontent.com";
const SCOPES = "openid email profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/youtube.upload";
const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/api/auth` : '';

export default function Dashboard() {
    const router = useRouter();
    const [channels, setChannels] = useState<MergedChannel[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusMsg, setStatusMsg] = useState("Initializing...");
    const [isOnline, setIsOnline] = useState(false);
    const [search, setSearch] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Auth State
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [role, setRole] = useState<string>("no_access");

    const fetchSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            setUser(session.user);
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
            if (profile) setRole(profile.role);
        } else {
            // Middleware should handle this, but double check
            router.push('/login');
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };
    const [gApiInited, setGApiInited] = useState(false);

    // --- Stats ---
    const [totalChannel, setTotalChannel] = useState(0);
    const [totalSubs, setTotalSubs] = useState(0);
    const [totalViews, setTotalViews] = useState(0);
    const [totalRealtime, setTotalRealtime] = useState(0);
    const [lastUpdate, setLastUpdate] = useState("");

    // --- Helpers ---
    const formatNumber = (n: number | string) => Number(n || 0).toLocaleString("id-ID");

    const setStatus = (msg: string, online: boolean) => {
        setStatusMsg("Status: " + msg);
        setIsOnline(online);
    };

    // --- Google Auth ---
    const googleSignIn = () => {
        if (!REDIRECT_URI) return;
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent(SCOPES)}&` +
            `access_type=offline&` +
            `prompt=consent`;
        window.location.href = authUrl;
    };

    // --- Core Sync Logic ---
    // --- Core Sync Logic ---
    const fetchRealtimeStats = async (channelId: string, token: string) => {
        if (!token) return { h48: 0, h60: 0 };

        try {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            let views48h = 0;

            try {
                // Determine URL for Analytics API
                const analyticsUrl = `https://youtubeanalytics.googleapis.com/v2/reports?` +
                    `ids=channel==${channelId}&` +
                    `startDate=${threeDaysAgo}&` +
                    `endDate=${today}&` +
                    `metrics=views&` +
                    `dimensions=liveOrOnDemand`;

                const res = await fetch(analyticsUrl, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!res.ok) throw new Error(`Analytics API error: ${res.status}`);

                const data = await res.json();
                const rows = data.rows || [];
                // Sum all rows returned (usually splits by live vs onDemand)
                views48h = rows.reduce((acc: number, row: any) => acc + (row[1] || 0), 0);

                if (views48h > 0) {
                    console.log(`[Realtime 48h] ${channelId}: ${views48h}`);
                }

            } catch (err: any) {
                console.warn(`Realtime 48h fetch failed for ${channelId}: ${err.message}`);

                // Fallback logic
                try {
                    const fallbackUrl = `https://youtubeanalytics.googleapis.com/v2/reports?` +
                        `ids=channel==${channelId}&` +
                        `startDate=${threeDaysAgo}&` +
                        `endDate=${today}&` +
                        `metrics=views`;

                    const resFallback = await fetch(fallbackUrl, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (resFallback.ok) {
                        const dataFallback = await resFallback.json();
                        const totalRecent = dataFallback.rows?.[0]?.[0] || 0;
                        views48h = Math.floor((totalRecent / 3) * 2);
                    }
                } catch (fallbackErr) {
                    // console.error("Fallback failed", fallbackErr);
                }
            }

            return { h48: views48h, h60: 0 };

        } catch (e: any) {
            console.error("Critical Realtime Error " + channelId, e);
            return { h48: 0, h60: 0, error: e.message };
        }
    };

    const fetchAllChannelsData = async () => {
        setLoading(true);
        setStatus("Syncing with Cloud Database...", true);

        try {
            const response = await fetch('/api/get-stats');
            const dbAccounts: ChannelData[] = await response.json();

            if ((dbAccounts as any).error) throw new Error((dbAccounts as any).error);

            if (!Array.isArray(dbAccounts) || dbAccounts.length === 0) {
                setStatus("Database Kosong.", false);
                setChannels([]);
                setLoading(false);
                return;
            }

            // Parallel Execution
            const promises = dbAccounts.map(async (acc) => {
                try {
                    if (acc.access_token) {
                        // Use pure fetch instead of GAPI library for parallelism
                        const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true`, {
                            headers: { 'Authorization': `Bearer ${acc.access_token}` }
                        });

                        if (!res.ok) throw new Error(`API Error ${res.status}`);
                        const data = await res.json();

                        if (data.items && data.items.length > 0) {
                            const item = data.items[0];
                            const realtime = await fetchRealtimeStats(item.id, acc.access_token);
                            return {
                                ...acc,
                                id: item.id,
                                name: item.snippet.title,
                                thumbnail: item.snippet.thumbnails.default.url,
                                subs: item.statistics.subscriberCount,
                                views: item.statistics.viewCount,
                                realtime: realtime,
                                isExpired: false,
                                emailSource: acc.gmail
                            } as MergedChannel;
                        } else {
                            throw new Error("No channel found");
                        }
                    } else {
                        throw new Error("No token");
                    }
                } catch (err: any) {
                    // Fallback to DB data
                    return {
                        ...acc,
                        id: acc.gmail, // Use email as fake ID
                        realtime: { h48: 0, h60: 0, error: err.message },
                        isExpired: true,
                        emailSource: acc.gmail
                    } as MergedChannel;
                }
            });

            const mergedData = await Promise.all(promises);

            setChannels(mergedData);
            updateAggregates(mergedData);
            setStatus("Dashboard Aktif", true);
            setLastUpdate(new Date().toLocaleTimeString() + " (Auto-Sync)");

        } catch (err: any) {
            console.error("Sync Error:", err);
            setStatus("Database Offline.", false);
        } finally {
            setLoading(false);
        }
    };

    const updateAggregates = (data: MergedChannel[]) => {
        let tSubs = 0, tViews = 0, tReal = 0;
        data.forEach(ch => {
            if (!ch.isExpired) {
                tSubs += Number(ch.subs);
                tViews += Number(ch.views);
                tReal += ch.realtime.h48;
            }
        });
        setTotalChannel(data.length);
        setTotalSubs(tSubs);
        setTotalViews(tViews);
        setTotalRealtime(tReal);
    };

    const handleDelete = async (email: string) => {
        if (confirm("Hapus permanen akun " + email + " dari database?")) {
            try {
                await fetch(`/api/delete-account?email=${email}`, { method: 'DELETE' });
                fetchAllChannelsData();
            } catch (e) { alert("Gagal menghapus."); }
        }
    };

    // --- Copy / Paste Logic ---
    const [showPasteModal, setShowPasteModal] = useState(false);
    const [pasteContent, setPasteContent] = useState("");

    const handleCopyData = () => {
        const dataToCopy = channels.map(ch => ({
            email: ch.emailSource,
            access_token: ch.access_token,
            expires_at: ch.expires_at
        }));
        navigator.clipboard.writeText(JSON.stringify(dataToCopy));
        alert("Data berhasil disalin ke clipboard!");
    };

    const handlePasteSubmit = async () => {
        if (!pasteContent) return;
        try {
            setLoading(true);
            const res = await fetch('/api/import-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: pasteContent
            });
            const result = await res.json();
            if (result.success) {
                alert(`Berhasil mengimpor ${result.count} channel!`);
                setShowPasteModal(false);
                setPasteContent("");
                fetchAllChannelsData(); // Refresh list
            } else {
                alert("Gagal impor: " + result.error);
            }
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleManagerOpen = (ch: MergedChannel) => {
        if (ch.isExpired) return;
        // Find matching access token from raw data if needed, but we merged it
        const sessionData = {
            channelId: ch.id,
            title: ch.name,
            img: ch.thumbnail,
            token: ch.access_token
        };
        sessionStorage.setItem("active_manager_data", JSON.stringify(sessionData));
        window.open('/manager', '_blank');
    };

    // --- Effects ---
    useEffect(() => {
        fetchSession();
    }, []);

    useEffect(() => {
        // Initial fetch - no longer depends on GAPI init
        fetchAllChannelsData();
        const interval = setInterval(fetchAllChannelsData, 300000); // 5 mins
        return () => clearInterval(interval);
    }, []);

    const initGapi = () => {
        const gapi = window.gapi;
        if (!gapi) return;

        gapi.load("client", async () => {
            await gapi.client.init({
                apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY, // Public API Key (From .env)
                discoveryDocs: [
                    "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
                    "https://youtubeanalytics.googleapis.com/$discovery/rest?version=v2"
                ]
            });
            setGApiInited(true);
        });
    };

    return (
        <div className="app">
            <Script
                src="https://apis.google.com/js/api.js"
                onLoad={initGapi}
            />

            {/* SIDEBAR */}
            <div className={`fixed inset-y-0 left-0 z-50 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:block transition-transform duration-300 ease-in-out`}>
                <Sidebar role={role} googleSignIn={googleSignIn} handleSignOut={handleSignOut} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            </div>

            {/* MAIN */}
            <main className="main w-full md:flex-1 overflow-x-hidden">
                {/* TOPBAR */}
                <div className="topbar flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 text-gray-400 hover:text-white">
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 className="page-title text-2xl md:text-3xl font-bold">Dashboard Overview</h1>
                            <div className="page-sub text-gray-500 text-sm">Pantau performa channel secara realtime</div>
                            <div className={`status-badge ${isOnline ? 'status-online' : ''} inline-flex items-center gap-2 mt-2 px-3 py-1 bg-gray-900 rounded-full border border-gray-800 text-xs`}>
                                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span id="statusText">{statusMsg}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 items-center">
                        <div className="search-wrap">
                            <Search size={16} className="text-gray-400" />
                            <input
                                type="text"
                                className="search"
                                placeholder="Cari Channel..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <button onClick={fetchAllChannelsData} className="btn ghost" title="Refresh Data">
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        </button>
                        <button onClick={googleSignIn} className="btn primary" title="Add another YouTube Account">
                            <Upload size={16} /> <span className="hidden md:inline">Tambah Channel</span>
                        </button>
                    </div>
                </div>


                {/* STATS CARDS */}
                <div className="stats-wrapper">
                    <div className="stat-card highlight">
                        <div className="flex justify-between items-center mb-2">
                            <div className="label">TOTAL SUBSCRIBERS</div>
                            <Users size={18} className="text-cyan-400" />
                        </div>
                        <div className="value text-cyan-400">{formatNumber(totalSubs)}</div>
                        <div className="text-xs text-gray-400">Semua Channel</div>
                    </div>
                    <div className="stat-card">
                        <div className="flex justify-between items-center mb-2">
                            <div className="label">TOTAL VIEWS</div>
                            <Eye size={18} className="text-blue-400" />
                        </div>
                        <div className="value">{formatNumber(totalViews)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="flex justify-between items-center mb-2">
                            <div className="label">REALTIME 48H</div>
                            <Activity size={18} className="text-yellow-400" />
                        </div>
                        <div className="value text-yellow-400">{formatNumber(totalRealtime)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="flex justify-between items-center mb-2">
                            <div className="label">ACTIVE CHANNELS</div>
                            <Zap size={18} className="text-green-400" />
                        </div>
                        <div className="value">{totalChannel}</div>
                        <div className="text-xs text-gray-400">Last: {lastUpdate}</div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="panel">
                    <div className="panel-head flex justify-between items-center">
                        <div className="panel-title">Channel List</div>
                        <div className="flex gap-2">
                            <button onClick={handleCopyData} className="btn ghost sm" title="Salin JSON Channel">
                                <Copy size={16} /> Salin Data
                            </button>
                            <button onClick={() => setShowPasteModal(true)} className="btn ghost sm" title="Tempel JSON Channel">
                                <ClipboardPaste size={16} /> Tempel Data
                            </button>
                        </div>
                    </div>
                    <div className="table-wrap">
                        {/* MOBILE CARD VIEW */}
                        <div className="md:hidden grid gap-4">
                            {channels.map((ch, idx) => {
                                if (!ch.name.toLowerCase().includes(search.toLowerCase())) return null;
                                return (
                                    <div key={idx} className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-4 flex flex-col gap-3 relative">
                                        <div className="flex items-center gap-3">
                                            <img src={ch.thumbnail} alt="" className="w-10 h-10 rounded-full border border-gray-700" />
                                            <div>
                                                <div className="font-bold text-white text-base">{ch.name}</div>
                                                <div className="text-xs text-gray-400 flex gap-2">
                                                    <span>{ch.isExpired ? '---' : formatNumber(ch.subs)} Subs</span>
                                                    <span>•</span>
                                                    <span>{ch.isExpired ? '---' : formatNumber(ch.views)} Views</span>
                                                </div>
                                            </div>
                                            <button onClick={() => handleDelete(ch.emailSource)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-2 bg-black/20 p-3 rounded-lg">
                                            <div className="text-center">
                                                <div className="text-xs text-gray-500 uppercase">48H Views</div>
                                                <div className="text-yellow-400 font-bold text-lg">{ch.isExpired ? '-' : formatNumber(ch.realtime.h48)}</div>
                                            </div>
                                            <div className="text-center border-l border-gray-700">
                                                <div className="text-xs text-gray-500 uppercase">60M Views</div>
                                                <div className="text-cyan-400 font-bold text-lg">{ch.isExpired ? '-' : formatNumber(ch.realtime.h60)}</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mt-2">
                                            {ch.isExpired ? (
                                                <div className="w-full text-center p-2 bg-red-500/10 text-red-500 rounded-lg text-sm font-bold border border-red-500/20">
                                                    EXPIRED
                                                </div>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleManagerOpen(ch)} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-lg font-bold text-sm transition text-center">
                                                        UPLOAD
                                                    </button>
                                                    <Link href={`/videos?id=${ch.id}&email=${ch.emailSource}`} className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center justify-center border border-gray-700">
                                                        <Video size={18} />
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* DESKTOP TABLE VIEW */}
                        <table className="channel-table hidden md:table">
                            <thead>
                                <tr>
                                    <th>Channel Name</th>
                                    <th>Subscribers</th>
                                    <th>Total Views</th>
                                    <th>Realtime 48H</th>
                                    <th>Realtime 60M</th>
                                    <th>Upload</th>
                                    <th>Videos</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr><td colSpan={8} className="text-center py-8 text-gray-500">Loading data...</td></tr>
                                )}
                                {!loading && channels.map((ch, idx) => {
                                    if (!ch.name.toLowerCase().includes(search.toLowerCase())) return null;
                                    return (
                                        <tr key={idx}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <img src={ch.thumbnail} alt="" className="w-8 h-8 rounded-full border border-gray-700" />
                                                    <div className="font-semibold">{ch.name}</div>
                                                </div>
                                            </td>
                                            <td>{ch.isExpired ? '---' : formatNumber(ch.subs)}</td>
                                            <td>{ch.isExpired ? '---' : formatNumber(ch.views)}</td>
                                            <td className="text-yellow-400 font-bold" title={ch.realtime.error || "Realtime 48h"}>
                                                {ch.isExpired ? '---' : formatNumber(ch.realtime.h48)}
                                            </td>
                                            <td className="text-cyan-400 font-bold">
                                                {ch.isExpired ? '---' : formatNumber(ch.realtime.h60)}
                                            </td>
                                            <td>
                                                {ch.isExpired ? (
                                                    <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs font-bold">
                                                        EXPIRED
                                                    </span>
                                                ) : (
                                                    <button onClick={() => handleManagerOpen(ch)} className="badge-ok cursor-pointer hover:bg-cyan-500/20 transition-colors">
                                                        UPLOAD
                                                    </button>
                                                )}
                                            </td>
                                            <td>
                                                <Link href={`/videos?id=${ch.id}&email=${ch.emailSource}`} className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2" title="View Videos">
                                                    <Video size={16} /> <span className="text-xs">Lihat</span>
                                                </Link>
                                            </td>
                                            <td className="text-center">
                                                <button onClick={() => handleDelete(ch.emailSource)} className="text-red-500 hover:text-red-400 transition-colors" title="Delete Channel">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="footer text-center text-sm">
                    &copy; {new Date().getFullYear()} Bang Memed Project. All rights reserved.
                </div>

                {/* PASTE MODAL */}
                {
                    showPasteModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                            <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl p-6 w-full max-w-lg shadow-2xl">
                                <h3 className="text-xl font-bold mb-4 text-white">Tempel Data Channel</h3>
                                <textarea
                                    className="w-full h-40 bg-[#0f0f0f] border border-gray-700 rounded-lg p-3 text-sm text-gray-300 focus:outline-none focus:border-cyan-500 transition mb-4"
                                    placeholder='Paste JSON array here... e.g. [{"email": ...}]'
                                    value={pasteContent}
                                    onChange={(e) => setPasteContent(e.target.value)}
                                />
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => { setShowPasteModal(false); setPasteContent(""); }}
                                        className="px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        onClick={() => { handlePasteSubmit(); setShowPasteModal(false); }}
                                        className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition"
                                    >
                                        Simpan Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </main >
        </div >
    );
}

// Type declaration for window.gapi
declare global {
    interface Window {
        gapi: any;
    }
}
