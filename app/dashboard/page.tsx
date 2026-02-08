"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    Zap
} from "lucide-react";

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
    realtime: { m60: number; h48: number };
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
        if (!gApiInited || !window.gapi?.client?.youtubeAnalytics) return { m60: 0, h48: 0 };

        try {
            const now = new Date();
            const start = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const end = now.toISOString().split('T')[0];

            let res = await window.gapi.client.youtubeAnalytics.reports.query({
                ids: `channel==${channelId}`,
                startDate: start, endDate: end,
                metrics: "views", dimensions: "hour", sort: "-hour"
            });

            let rows = res.result.rows || [];
            if (rows.length > 0) {
                const last24hRows = rows.slice(0, 24);
                const total24h = last24hRows.reduce((acc: any, row: any) => acc + row[1], 0);
                return { m60: Math.floor(total24h / 24), h48: total24h }; // Approximation
            }

            // Fallback
            res = await window.gapi.client.youtubeAnalytics.reports.query({
                ids: `channel==${channelId}`,
                startDate: start, endDate: end,
                metrics: "views"
            });

            let totalFallback = (res.result.rows && res.result.rows[0]) ? res.result.rows[0][0] : 0;
            return { m60: Math.floor(totalFallback / 72), h48: Math.floor(totalFallback / 3) };
        } catch (e) {
            return { m60: 0, h48: 0 };
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
                        realtime: { m60: 0, h48: 0 },
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
                apiKey: "AIzaSyDNT_iVn2c9kY3M6DQOcODBFNwAs-e_qA4", // Public API Key (From original code)
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

                    <div className="flex gap-4">
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
                        <button onClick={fetchAllChannelsData} className="btn ghost">
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
                        </button>
                        <button onClick={googleSignIn} className="btn primary">
                            <Upload size={16} /> Add Gmail
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
                    <div className="panel-head">
                        <div className="panel-title">Channel List</div>
                    </div>
                    <div className="table-wrap">
                        <table className="channel-table">
                            <thead>
                                <tr>
                                    <th>Channel Name</th>
                                    <th>Subscribers</th>
                                    <th>Total Views</th>
                                    <th>Realtime 60m</th>
                                    <th>Realtime 48h</th>
                                    <th>Status</th>
                                    <th className="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && (
                                    <tr><td colSpan={7} className="text-center py-8 text-gray-500">Loading data...</td></tr>
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
                                            <td className="text-cyan-400 font-bold">{ch.isExpired ? '---' : formatNumber(ch.realtime.m60)}</td>
                                            <td className="text-yellow-400 font-bold">{ch.isExpired ? '---' : formatNumber(ch.realtime.h48)}</td>
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
                                                <button onClick={() => handleDelete(ch.emailSource)} className="text-red-500 hover:text-red-400 transition-colors">
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
            </main>
        </div>
    );
}

// Type declaration for window.gapi
declare global {
    interface Window {
        gapi: any;
    }
}
