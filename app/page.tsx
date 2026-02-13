"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {

  useEffect(() => {
    // Optional: Preload or prefetch anything if needed
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-center bg-background relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      <div className="p-[50px] rounded-[32px] bg-card/80 dark:bg-white/3 border border-border dark:border-white/10 backdrop-blur-[10px] max-w-[600px] shadow-2xl">
        <h1 className="text-[2.5rem] mb-5 bg-[linear-gradient(90deg,#22d3ee,#818cf8)] bg-clip-text text-transparent">Bang Memed YT Manager</h1>
        <p className="text-muted-foreground leading-relaxed mb-[30px]">Solusi manajemen multi-channel YouTube terbaik. Pantau statistik, analitik realtime, dan performa video Anda dalam satu dashboard eksklusif.</p>

        <Link href="/dashboard" className="px-10 py-[15px] bg-primary text-primary-foreground rounded-xl font-bold no-underline transition-all duration-300 inline-block cursor-pointer border-none hover:-translate-y-[3px] hover:bg-primary/90 hover:shadow-[0_10px_20px_rgba(21,93,252,0.3)]">
          Masuk ke Dashboard
        </Link>

        <div className="mt-10 border-t border-border dark:border-white/10 pt-5">
          <a href="#" className="text-muted-foreground text-[13px] no-underline mx-2.5 hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="text-muted-foreground text-[13px] no-underline mx-2.5 hover:text-primary transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
