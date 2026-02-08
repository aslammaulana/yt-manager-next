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
    Shield
} from "lucide-react";

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
    realtime: { h48: number; error?: string }; // Added error field
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
    const fetchRealtimeStats = async (channelId: string) => {
        if (!gApiInited || !window.gapi?.client?.youtubeAnalytics) return { h48: 0 };

        try {
            // According to YouTube Analytics API docs/user finding:
            // "For real-time data, startDate and endDate are not required or should be set 
            // to a recent date to get the live/realtime feed."
            // However, the API *technically* requires startDate/endDate parameters for reports.query.
            // We'll set them to today/yesterday to satisfy the API shape, but rely on 'liveOrOnDemand'

            const now = new Date();
            const today = now.toISOString().split('T')[0];
            const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            let views48h = 0;

            try {
                // Primary Method: 'liveOrOnDemand' dimension
                const res = await window.gapi.client.youtubeAnalytics.reports.query({
                    ids: `channel==${channelId}`,
                    startDate: threeDaysAgo, // Broad range to catch all recent realtime data
                    endDate: today,
                    metrics: "views",
                    dimensions: "liveOrOnDemand"
                    // sort: "-views" // Optional
                });

                const rows = res.result.rows || [];
                // Sum all rows returned (usually splits by live vs onDemand)
                views48h = rows.reduce((acc: number, row: any) => acc + (row[1] || 0), 0);

                console.log(`[Realtime 48h] ${channelId}: ${views48h}`);

                // Log success
                if (views48h > 0) {
                    fetch('/api/log', {
                        method: 'POST',
                        body: JSON.stringify({
                            message: `✅ Realtime 48h for ${channelId}: ${views48h}`,
                            type: 'info'
                        })
                    }).catch(() => { });
                }

            } catch (err: any) {
                const errMsg = err?.result?.error?.message || err.message || "Unknown error";
                console.warn(`Realtime 48h fetch failed for ${channelId}: ${errMsg}`);

                fetch('/api/log', {
                    method: 'POST',
                    body: JSON.stringify({
                        message: `⚠️ Realtime 48h Error for ${channelId}: ${errMsg}`,
                        type: 'warn'
                    })
                }).catch(() => { });

                // Fallback: Standard daily query (proxied)
                try {
                    const resFallback = await window.gapi.client.youtubeAnalytics.reports.query({
                        ids: `channel==${channelId}`,
                        startDate: threeDaysAgo,
                        endDate: today,
                        metrics: "views"
                    });

                    // Estimate 48h from last ~3 days of data
                    const totalRecent = resFallback.result.rows?.[0]?.[0] || 0;
                    views48h = Math.floor((totalRecent / 3) * 2);

                } catch (fallbackErr) {
                    console.error("Fallback failed", fallbackErr);
                }
            }

            return { h48: views48h };

        } catch (e: any) {
            console.error("Critical Realtime Error " + channelId, e);
            const errorMsg = e?.result?.error?.message || e.message || "Unknown error";
            return { h48: 0, error: errorMsg };
        }
    };

    const fetchAllChannelsData = async () => {
        setLoading(true);
        setStatus("Syncing with Cloud Database...", true);

        try {
            const response = await fetch('/api/get-stats');
            const dbAccounts: ChannelData[] = await response.json();

            if ((dbAccounts as any).error) throw new Error((dbAccounts as any).error);

            if (dbAccounts.length === 0) {
                setStatus("Database Kosong.", false);
                setChannels([]);
                setLoading(false);
                return;
            }

            let mergedData: MergedChannel[] = [];

            for (const acc of dbAccounts) {
                try {
                    // Only try gapi if initialized and token exists
                    if (gApiInited && window.gapi && acc.access_token) {
                        window.gapi.client.setToken({ access_token: acc.access_token });
                        const res = await window.gapi.client.youtube.channels.list({ part: "snippet,statistics", mine: true });

                        if (res.result && res.result.items) {
                            for (let item of res.result.items) {
                                const realtime = await fetchRealtimeStats(item.id);
                                mergedData.push({
                                    ...acc,
                                    id: item.id,
                                    name: item.snippet.title,
                                    thumbnail: item.snippet.thumbnails.default.url,
                                    subs: item.statistics.subscriberCount,
                                    views: item.statistics.viewCount,
                                    realtime: realtime,
                                    isExpired: false,
                                    emailSource: acc.gmail
                                });
                            }
                        } else {
                            throw new Error("No channel found");
                        }
                    } else {
                        throw new Error("GAPI not ready or no token");
                    }
                } catch (err) {
                    // Fallback to DB data
                    mergedData.push({
                        ...acc,
                        id: acc.gmail, // Use email as fake ID
                        realtime: { h48: 0 },
                        isExpired: true,
                        emailSource: acc.gmail
                    });
                }
            }

            setChannels(mergedData);
            updateAggregates(mergedData);
            setStatus("Dashboard Aktif", true);
            setLastUpdate(new Date().toLocaleTimeString() + " (Auto-Sync)");

        } catch (err: any) {
            console.error("Sync Error:", err);

            // Log sync error to server
            fetch('/api/log', {
                method: 'POST',
                body: JSON.stringify({
                    message: `Sync Error: ${err.message || err}`,
                    type: 'error'
                })
            }).catch(() => { });

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
        // Initial fetch when GAPI is ready
        if (gApiInited) {
            fetchAllChannelsData();
            const interval = setInterval(fetchAllChannelsData, 300000); // 5 mins
            return () => clearInterval(interval);
        }
    }, [gApiInited]);

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
            <aside className="sidebar">
                <div className="side-brand">
                    <div className="logo">
                        {/* Placeholder Logo */}
                        <LayoutDashboard size={24} className="text-cyan-400" />
                    </div>
                    <div className="side-title">
                        <div className="name">YT Manager</div>
                        <div className="sub">PRO EDITION</div>
                    </div>
                </div>

                <nav className="side-nav">
                    <a href="#" className="side-link active">
                        <LayoutDashboard size={18} /> Dashboard
                    </a>
                    <a href="#" className="side-link" onClick={(e) => { e.preventDefault(); googleSignIn(); }}>
                        <Upload size={18} /> Tambah Channel
                    </a>
                    <a href="/admin" className="side-link active">
                        <LayoutDashboard size={18} /> Kelola User
                    </a>
                </nav>



                <div className="side-footer">
                    <div className="hint">
                        💡 Tip: Token akan auto-refresh jika Anda membuka dashboard ini.
                    </div>
                </div>
            </aside>

            {/* MAIN */}
            <main className="main">
                {/* TOPBAR */}
                <div className="topbar">
                    <div>
                        <h1 className="page-title">Dashboard Overview</h1>
                        <div className="page-sub">Pantau performa channel secara realtime</div>
                        <div className={`status-badge ${isOnline ? 'status-online' : ''}`}>
                            <div className="status-dot"></div>
                            <span id="statusText">{statusMsg}</span>
                        </div>
                    </div>

                    <div className="flex gap-4 items-center">
                        {role === 'admin' && (
                            <Link href="/admin" className="btn ghost text-purple-400 border border-purple-500/30 hover:bg-purple-500/10 px-3 py-1.5 rounded-lg flex items-center gap-2 transition" title="Admin Panel">
                                <Shield size={16} /> <span className="hidden md:inline">Admin</span>
                            </Link>
                        )}

                        <div className="h-6 w-px bg-gray-700 mx-1"></div>

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
                            <Upload size={16} /> <span className="hidden md:inline">Add Gmail</span>
                        </button>

                        <button onClick={handleSignOut} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 p-2 rounded-lg transition" title="Sign Out">
                            <LogOut size={16} />
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
                        {/* ... existing table code ... */}
                        <table className="channel-table">
                            <thead>
                                <tr>
                                    <th>Channel Name</th>
                                    <th>Subscribers</th>
                                    <th>Total Views</th>
                                    <th>Realtime 48h</th>
                                    <th>Status</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading data...</td></tr>
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
                                            <td className="text-yellow-400 font-bold" title={ch.realtime.error || "Realtime estimate"}>
                                                {ch.isExpired ? '---' : formatNumber(ch.realtime.h48)}
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
                                            <td className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link href={`/videos?id=${ch.id}&email=${ch.emailSource}`} className="text-blue-400 hover:text-blue-300 transition-colors" title="View Videos">
                                                        <Video size={16} />
                                                    </Link>
                                                    <button onClick={() => handleDelete(ch.emailSource)} className="text-red-500 hover:text-red-400 transition-colors" title="Remove Channel">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
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
