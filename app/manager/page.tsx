"use client";

import { useEffect, useState, useRef } from "react";
import AppSidebar from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";
import { Upload, Image as ImageIcon, Rocket, X, CloudUpload } from "lucide-react";

export default function Manager() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [activeData, setActiveData] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadText, setUploadText] = useState("UNGGAH SEKARANG");
    const [privacy, setPrivacy] = useState("private");
    const [schedule, setSchedule] = useState("");

    // Refs for preview
    const videoPreviewRef = useRef<HTMLVideoElement>(null);
    const thumbPreviewRef = useRef<HTMLImageElement>(null);
    const logBoxRef = useRef<HTMLDivElement>(null);

    // Form Refs
    const videoInputRef = useRef<HTMLInputElement>(null);
    const thumbInputRef = useRef<HTMLInputElement>(null);
    const titleRef = useRef<HTMLInputElement>(null);
    const descRef = useRef<HTMLTextAreaElement>(null);
    const tagsRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // 1. Load Data
        const raw = sessionStorage.getItem("active_manager_data");
        if (!raw) {
            alert("Data Channel tidak ditemukan. Harap buka dari Dashboard.");
            window.close();
            return;
        }
        const data = JSON.parse(raw);
        setActiveData(data);
        addLog("SYSTEM", "Koneksi Aman. Jalur transmisi siap.");
    }, []);

    const addLog = (tag: string, msg: string) => {
        const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
        const logLine = `<span style="color:#64748b">[${time}]</span> <span style="color:#ff4444;font-weight:bold">[${tag}]</span> ${msg}`;
        setLogs(prev => [...prev, logLine]);

        // Auto scroll
        setTimeout(() => {
            if (logBoxRef.current) {
                logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
            }
        }, 100);
    };

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && videoPreviewRef.current) {
            const url = URL.createObjectURL(file);
            videoPreviewRef.current.src = url;
            videoPreviewRef.current.style.display = "block";

            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            addLog("DETECTED", `Video: ${file.name} [${sizeMB} MB]`);

            if (titleRef.current && !titleRef.current.value) {
                titleRef.current.value = file.name.split('.').slice(0, -1).join('.');
            }
        }
    };

    const handleThumbSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && thumbPreviewRef.current) {
            const url = URL.createObjectURL(file);
            thumbPreviewRef.current.src = url;
            thumbPreviewRef.current.style.display = "block";
            addLog("DETECTED", `Thumbnail: ${file.name} terpilih.`);
        }
    };

    const uploadThumb = async (vId: string, file: File) => {
        try {
            const res = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${vId}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${activeData.token}` },
                body: file
            });
            if (res.ok) addLog("SUCCESS", "Thumbnail terpasang.");
            else addLog("WARNING", "Thumbnail gagal upload.");
        } catch (e) { addLog("WARNING", "Thumbnail error."); }
    };

    const startUpload = async () => {
        const vFile = videoInputRef.current?.files?.[0];
        const tFile = thumbInputRef.current?.files?.[0];
        const title = titleRef.current?.value;
        const desc = descRef.current?.value;
        const tags = tagsRef.current?.value;

        if (!vFile || !title) return alert("Pilih Video dan Judul dulu!");

        setIsUploading(true);
        setUploadText("SEDANG PROSES...");
        addLog("SYSTEM", "Memulai protokol upload YouTube...");

        const metadata: any = {
            snippet: {
                title: title,
                description: desc,
                categoryId: "22",
                tags: tags ? tags.split(',').map(t => t.trim()) : []
            },
            status: { privacyStatus: (privacy === "scheduled" ? "private" : privacy) }
        };

        if (privacy === "scheduled") {
            if (!schedule) {
                setIsUploading(false);
                setUploadText("UNGGAH SEKARANG");
                return alert("Set tanggal tayang!");
            }
            metadata.status.publishAt = new Date(schedule).toISOString();
        }

        try {
            // Initial Resumable Upload Request
            const initRes = await fetch(`https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${activeData.token}`,
                    "Content-Type": "application/json",
                    "X-Upload-Content-Length": vFile.size.toString(),
                    "X-Upload-Content-Type": vFile.type
                },
                body: JSON.stringify(metadata)
            });

            if (!initRes.ok) throw new Error("Init Gagal. Token mungkin expired.");
            const uploadUrl = initRes.headers.get("Location");

            if (!uploadUrl) throw new Error("Tidak dapat upload URL.");

            // Upload File via XHR for Progress
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", uploadUrl, true);
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    setUploadText(`UPLOADING ${percent}%`);
                    if (percent % 25 === 0 && percent > 0) addLog("PROGRESS", `Status: ${percent}%`);
                }
            };

            xhr.onload = async () => {
                if (xhr.status === 200 || xhr.status === 201) {
                    const res = JSON.parse(xhr.responseText);
                    addLog("SUCCESS", `Video ID: ${res.id}`);

                    if (tFile) {
                        addLog("SYSTEM", "Mengirim Thumbnail...");
                        await uploadThumb(res.id, tFile);
                    }

                    addLog("FINISHED", "Misi Berhasil!");
                    alert("MANTAP BANG! Sukses.");
                    setIsUploading(false);
                    setUploadText("UPLOAD LAGI");
                } else {
                    addLog("ERROR", `Upload failed code: ${xhr.status}`);
                    setIsUploading(false);
                    setUploadText("TRY AGAIN");
                }
            };
            xhr.send(vFile);

        } catch (err: any) {
            addLog("ERROR", err.message);
            setIsUploading(false);
            setUploadText("GAGAL");
        }
    };

    if (!activeData) return <div className="p-10 text-center">Loading Manager...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] relative z-1 min-h-screen bg-[#101828]">
            <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Mobile Header */}
            <MobileHeader onMenuClick={() => setSidebarOpen(true)} />

            <main className="p-6 md:p-10 w-full overflow-x-hidden font-sans text-slate-200">
                <header className="bg-gradient-to-b from-slate-800 to-slate-900 p-6 rounded-3xl mb-8 shadow-2xl flex justify-between items-center border border-white/5 mx-auto max-w-6xl">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-white tracking-wider">YouTube Manager <span className="text-red-500">PRO</span></h1>
                        <span className="text-xs text-slate-500 italic">by-bangmemed.id</span>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <div className="relative w-20 h-20">
                            <div className="absolute top-0 left-0 w-full h-full rounded-full bg-red-500 blur-xl animate-pulse opacity-40"></div>
                            <img src={activeData.img} className="w-full h-full rounded-full border-2 border-red-500 object-cover relative z-10" />
                        </div>
                        <p className="text-lg font-bold text-white">{activeData.title}</p>
                    </div>

                    <div>
                        <button onClick={() => window.close()} className="border border-slate-700 text-slate-400 px-5 py-2 rounded-full text-xs font-bold hover:border-red-500 hover:text-white transition-all">
                            TUTUP PANEL
                        </button>
                    </div>
                </header>

                <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-[25px]">
                    {/* LEFT: CONTENT */}
                    <div className="flex flex-col gap-6">
                        <section className="bg-slate-800 p-6 rounded-3xl border border-white/5">
                            <h3 className="text-red-500 font-bold mb-5 flex items-center gap-2 text-sm uppercase">
                                <Upload size={16} /> Konten Video
                            </h3>

                            <div
                                className="border-2 border-dashed border-slate-700 p-10 text-center rounded-[15px] cursor-pointer bg-black/20 transition-all duration-300 hover:border-cyan-400 mb-4 group"
                                onClick={() => videoInputRef.current?.click()}
                            >
                                <CloudUpload size={40} className="text-red-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                                <p className="font-bold text-sm text-slate-300">Pilih Video</p>
                                <input type="file" ref={videoInputRef} accept="video/*" className="hidden" onChange={handleVideoSelect} />
                            </div>
                            <video ref={videoPreviewRef} controls className="w-full rounded-xl mt-[15px] hidden border border-slate-700"></video>

                            <div className="mt-6">
                                <label className="block mb-2 text-[11px] font-semibold text-slate-400 uppercase">Judul</label>
                                <input
                                    type="text"
                                    ref={titleRef}
                                    placeholder="Ketik judul video..."
                                    className="w-full p-3 bg-slate-900 border border-slate-700 text-white rounded-[10px] mb-[15px] outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>

                            <div className="mt-4">
                                <label className="block mb-2 text-[11px] font-semibold text-slate-400 uppercase">Deskripsi</label>
                                <textarea
                                    ref={descRef}
                                    rows={4}
                                    placeholder="Ketik deskripsi..."
                                    className="w-full p-3 bg-slate-900 border border-slate-700 text-white rounded-[10px] mb-[15px] outline-none focus:border-cyan-400 transition-colors box-border"
                                ></textarea>
                            </div>

                            <div className="mt-4">
                                <label className="block mb-2 text-[11px] font-semibold text-slate-400 uppercase">Tags</label>
                                <input
                                    type="text"
                                    ref={tagsRef}
                                    placeholder="tag1, tag2, tag3"
                                    className="w-full p-3 bg-slate-900 border border-slate-700 text-white rounded-[10px] mb-[15px] outline-none focus:border-cyan-400 transition-colors"
                                />
                            </div>

                            <h3 className="text-red-500 font-bold mt-8 mb-4 flex items-center gap-2 text-sm uppercase">
                                <ImageIcon size={16} /> Custom Thumbnail
                            </h3>
                            <label className="block mb-2 text-[11px] font-semibold text-slate-400 uppercase">Pilih Gambar Sampul</label>
                            <input
                                type="file"
                                ref={thumbInputRef}
                                accept="image/*"
                                onChange={handleThumbSelect}
                                className="w-full p-3 bg-slate-900 border border-slate-700 text-white rounded-[10px] mb-[15px] outline-none focus:border-cyan-400 transition-colors"
                            />
                            <img ref={thumbPreviewRef} className="w-full rounded-xl mt-[15px] hidden border border-slate-700" />
                        </section>
                    </div>

                    {/* RIGHT: PUBLISH */}
                    <div className="flex flex-col gap-6">
                        <section className="bg-slate-800 p-6 rounded-3xl border border-white/5">
                            <h3 className="text-red-500 font-bold mb-5 flex items-center gap-2 text-sm uppercase">
                                <Rocket size={16} /> Publish
                            </h3>

                            <label className="block mb-2 text-[11px] font-semibold text-slate-400 uppercase">Visibilitas</label>
                            <select
                                value={privacy}
                                onChange={(e) => setPrivacy(e.target.value)}
                                className="w-full p-3 bg-slate-900 border border-slate-700 text-white rounded-[10px] mb-[15px] outline-none focus:border-cyan-400 transition-colors"
                            >
                                <option value="private">🔒 Privat</option>
                                <option value="unlisted">🔗 Unlisted</option>
                                <option value="public">🌐 Publik</option>
                                <option value="scheduled">📅 Jadwalkan</option>
                            </select>

                            {privacy === "scheduled" && (
                                <div className="bg-red-500/10 p-4 rounded-xl border border-red-500 mb-5">
                                    <label className="block mb-2 text-[11px] font-semibold text-slate-400 uppercase">Waktu Tayang</label>
                                    <input
                                        type="datetime-local"
                                        value={schedule}
                                        onChange={(e) => setSchedule(e.target.value)}
                                        className="w-full p-3 bg-slate-900 border border-slate-700 text-white rounded-[10px] mb-[15px] outline-none focus:border-cyan-400 transition-colors"
                                    />
                                </div>
                            )}

                            <button
                                onClick={startUpload}
                                disabled={isUploading}
                                className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all text-white mt-4 ${isUploading ? 'bg-slate-600 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 hover:-translate-y-1 shadow-red-500/30'}`}
                            >
                                {uploadText}
                            </button>

                            <div className="mt-5 p-[15px] bg-black rounded-[15px] border border-slate-800">
                                <div ref={logBoxRef} className="font-mono text-xs text-[#00ff41] h-[120px] overflow-y-auto">
                                    {logs.map((log, i) => (
                                        <div key={i} className="mb-1 text-xs font-mono text-green-400" dangerouslySetInnerHTML={{ __html: log }} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
