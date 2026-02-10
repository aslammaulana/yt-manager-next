"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";
import { ArrowLeft, Play, ThumbsUp, MessageCircle, Eye, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import AppSidebar from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";

interface VideoItem {
    id: string;
    title: string;
    thumbnail: string;
    publishedAt: string;
    views?: string;
    likes?: string;
    comments?: string;
    description?: string;
    tags?: string[];
}

// Separate component to use useSearchParams
function VideosContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const channelId = searchParams.get("id");
    const email = searchParams.get("email");

    const [loading, setLoading] = useState(true);
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [gApiInited, setGApiInited] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [error, setError] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Initialize GAPI
    const initGapi = () => {
        const gapi = window.gapi;
        if (!gapi) return;

        const start = async () => {
            try {
                await gapi.client.init({
                    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
                    discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"]
                });
                setGApiInited(true);
            } catch (e) {
                console.error("GAPI Init Error", e);
                // Even on error, we might be able to proceed if it was already inited
                if (gapi.client) setGApiInited(true);
            }
        };

        gapi.load("client", start);
    };

    const fetchVideos = async () => {
        if (!channelId || !email || !gApiInited) return;
        setLoading(true);
        setError("");

        try {
            // Check sessionStorage cache first for faster loading
            const cacheKey = `yt_token_${email}`;
            let accessToken = sessionStorage.getItem(cacheKey);

            if (!accessToken) {
                // Fetch from get-stats and filter (proven working)
                const allAccountsRes = await fetch('/api/get-stats');
                if (!allAccountsRes.ok) {
                    throw new Error("Failed to fetch accounts");
                }
                const allAccounts = await allAccountsRes.json();
                const account = allAccounts.find((acc: any) => acc.gmail === email);

                if (!account || !account.access_token) {
                    throw new Error("Account token not found. Please re-login in Dashboard.");
                }

                accessToken = account.access_token;

                // Cache token for session (avoids repeated API calls on navigation)
                if (accessToken) {
                    sessionStorage.setItem(cacheKey, accessToken);
                }
            }

            if (!accessToken) {
                throw new Error("Account token not found. Please re-login in Dashboard.");
            }

            // Set Token
            window.gapi.client.setToken({ access_token: accessToken });

            // Get Uploads Playlist ID
            const chRes = await window.gapi.client.youtube.channels.list({
                part: "contentDetails",
                id: channelId
            });

            if (!chRes.result.items?.length) throw new Error("Channel details not found.");
            const uploadsId = chRes.result.items[0].contentDetails.relatedPlaylists.uploads;

            // Get Playlist Items (Videos)
            const plRes = await window.gapi.client.youtube.playlistItems.list({
                part: "snippet,contentDetails",
                playlistId: uploadsId,
                maxResults: 50
            });

            const items = plRes.result.items || [];
            const mappedVideos: VideoItem[] = items.map((item: any) => ({
                id: item.contentDetails.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
                publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString("id-ID", {
                    day: 'numeric', month: 'short', year: 'numeric'
                })
            }));

            setVideos(mappedVideos);

        } catch (err: any) {
            console.error("Fetch Error:", err);
            // Clear cached token on error (might be expired)
            sessionStorage.removeItem(`yt_token_${email}`);
            setError(err.message || "Failed to load videos.");
        } finally {
            setLoading(false);
        }
    };

    const fetchVideoDetails = async (video: VideoItem) => {
        setSelectedVideo(video); // Show modal immediately with basic info
        setDetailsLoading(true);

        try {
            // Fetch Statistics
            const statsRes = await window.gapi.client.youtube.videos.list({
                part: "statistics,snippet",
                id: video.id
            });

            if (statsRes.result.items?.length) {
                const details = statsRes.result.items[0];
                setSelectedVideo(prev => ({
                    ...prev!,
                    views: Number(details.statistics.viewCount).toLocaleString("id-ID"),
                    likes: Number(details.statistics.likeCount).toLocaleString("id-ID"),
                    comments: Number(details.statistics.commentCount).toLocaleString("id-ID"),
                    description: details.snippet.description,
                    tags: details.snippet.tags
                }));
            }
        } catch (error) {
            console.error("Details Error:", error);
        } finally {
            setDetailsLoading(false);
        }
    };

    useEffect(() => {
        if (gApiInited && channelId && email) {
            fetchVideos();
        }
    }, [gApiInited, channelId, email]);

    // Handle GAPI double-load / navigation issue
    useEffect(() => {
        if (typeof window !== 'undefined' && window.gapi && !gApiInited) {
            initGapi();
        }
    }, []);

    if (!channelId || !email) return <div className="p-10 text-center text-red-500">Missing parameters.</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] relative z-1 min-h-screen bg-[#101828]">
            <Script src="https://apis.google.com/js/api.js" onLoad={initGapi} />

            {/* SIDEBAR */}
            <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Mobile Header */}
            <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

            <main className="p-6 md:p-10 w-full overflow-x-hidden text-white font-sans bg-[#0f0f0f] md:bg-transparent">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard" className="p-2 hover:bg-gray-800 rounded-full transition">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Channel Videos</h1>
                        <p className="text-gray-400 text-sm">Most recent 50 uploads</p>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && !error && (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
                    </div>
                )}

                {/* Video Grid */}
                {!loading && !error && videos.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Video size={48} className="mb-4 opacity-50" />
                        <p className="text-lg font-medium">No videos found.</p>
                        <p className="text-sm">This channel hasn't uploaded any videos yet.</p>
                    </div>
                )}

                {!loading && !error && videos.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {videos.map((video) => (
                            <div
                                key={video.id}
                                onClick={() => fetchVideoDetails(video)}
                                className="group cursor-pointer bg-[#1e1e1e] rounded-xl overflow-hidden hover:ring-2 hover:ring-cyan-500/50 transition duration-300"
                            >
                                <div className="relative aspect-video w-full overflow-hidden">
                                    <img
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="object-cover w-full h-full group-hover:scale-105 transition duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition"></div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-cyan-400 transition">
                                        {video.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar size={12} />
                                        <span>{video.publishedAt}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Details Modal */}
                {selectedVideo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedVideo(null)}>
                        <div className="bg-[#1e1e1e] w-full max-w-2xl rounded-2xl overflow-hidden border border-gray-800 shadow-2xl" onClick={e => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div className="relative aspect-video w-full">
                                <img src={selectedVideo.thumbnail} className="w-full h-full object-cover opacity-50" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] to-transparent"></div>
                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">{selectedVideo.title}</h2>
                                    <div className="flex items-center gap-4 text-sm text-gray-300">
                                        <span>{selectedVideo.publishedAt}</span>
                                        {detailsLoading && <span className="animate-pulse">Loading stats...</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6">
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="bg-[#2a2a2a] p-3 rounded-lg text-center">
                                        <div className="flex justify-center mb-1 text-blue-400"><Eye size={20} /></div>
                                        <div className="text-lg font-bold">{selectedVideo.views || "-"}</div>
                                        <div className="text-xs text-gray-500 uppercase">Views</div>
                                    </div>
                                    <div className="bg-[#2a2a2a] p-3 rounded-lg text-center">
                                        <div className="flex justify-center mb-1 text-green-400"><ThumbsUp size={20} /></div>
                                        <div className="text-lg font-bold">{selectedVideo.likes || "-"}</div>
                                        <div className="text-xs text-gray-500 uppercase">Likes</div>
                                    </div>
                                    <div className="bg-[#2a2a2a] p-3 rounded-lg text-center">
                                        <div className="flex justify-center mb-1 text-purple-400"><MessageCircle size={20} /></div>
                                        <div className="text-lg font-bold">{selectedVideo.comments || "-"}</div>
                                        <div className="text-xs text-gray-500 uppercase">Comments</div>
                                    </div>
                                </div>

                                {selectedVideo.description && (
                                    <div className="bg-[#0f0f0f] p-4 rounded-xl max-h-40 overflow-y-auto text-sm text-gray-400 mb-4 whitespace-pre-wrap">
                                        {selectedVideo.description}
                                    </div>
                                )}

                                <div className="flex justify-end gap-3">
                                    <a
                                        href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
                                    >
                                        <Play size={16} /> Watch on YouTube
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function VideosPage() {
    return (
        <Suspense fallback={<div className="text-white p-10">Loading page...</div>}>
            <VideosContent />
        </Suspense>
    );
}
