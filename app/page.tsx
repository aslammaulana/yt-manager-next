"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    // Optional: Preload or prefetch anything if needed
  }, []);

  return (
    <div className="hero">
      <div className="hero-card">
        <h1 className="hero-title">Bang Memed YT Manager</h1>
        <p className="hero-desc">Solusi manajemen multi-channel YouTube terbaik. Pantau statistik, analitik realtime, dan performa video Anda dalam satu dashboard eksklusif.</p>

        <Link href="/dashboard" className="btn-main">
          Masuk ke Dashboard
        </Link>

        <div className="legal-links" style={{ marginTop: '40px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
          <a href="#" style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none', margin: '0 10px' }}>Privacy Policy</a>
          <a href="#" style={{ color: '#64748b', fontSize: '13px', textDecoration: 'none', margin: '0 10px' }}>Terms of Service</a>
        </div>
      </div>
    </div>
  );
}
