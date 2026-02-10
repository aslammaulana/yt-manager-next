import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bang Memed - YouTube Manager Pro",
  description: "Solusi manajemen multi-channel YouTube terbaik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#020617] text-white min-h-screen overflow-x-hidden selection:bg-[#155dfc]/30 selection:text-[#93bbff]`}>
        {/* Background Glow */}
        <div className="fixed inset-[-20%] z-0 pointer-events-none blur-[60px]"
          style={{
            background: `
                 radial-gradient(circle at 15% 15%, rgba(59, 130, 246, 0.15), transparent 40%),
                 radial-gradient(circle at 85% 25%, rgba(34, 211, 238, 0.12), transparent 40%),
                 radial-gradient(circle at 50% 80%, rgba(99, 102, 241, 0.1), transparent 50%)
               `
          }}
        />
        <div className="relative z-10 min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
