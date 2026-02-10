"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    // Optional: Preload or prefetch anything if needed
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-center bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#0f172a_100%)]">
      <div className="p-[50px] rounded-[32px] bg-white/3 border border-white/10 backdrop-blur-[10px] max-w-[600px]">
        <h1 className="text-[2.5rem] mb-5 bg-[linear-gradient(90deg,_#22d3ee,_#818cf8)] bg-clip-text text-transparent">Bang Memed YT Manager</h1>
        <p className="text-slate-400 leading-relaxed mb-[30px]">Solusi manajemen multi-channel YouTube terbaik. Pantau statistik, analitik realtime, dan performa video Anda dalam satu dashboard eksklusif.</p>

        <Link href="/dashboard" className="px-10 py-[15px] bg-[#155dfc] text-white rounded-xl font-bold no-underline transition-all duration-300 inline-block cursor-pointer border-none hover:-translate-y-[3px] hover:bg-[#407bfa] hover:shadow-[0_10px_20px_rgba(21,93,252,0.3)]">
          Masuk ke Dashboard
        </Link>

        <div className="mt-10 border-t border-white/10 pt-5">
          <a href="#" className="text-slate-500 text-[13px] no-underline mx-2.5 hover:text-cyan-400 transition-colors">Privacy Policy</a>
          <a href="#" className="text-slate-500 text-[13px] no-underline mx-2.5 hover:text-cyan-400 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
