"use client";

import { useEffect, useState } from "react";
import { createClient } from '@/utils/supabase/client';
import DesktopHeader from "@/components/DesktopHeader";
import AppSidebar from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";
import Link from "next/link";
import { ChevronRight, Printer, Download } from "lucide-react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function TransactionDetail() {
    const supabase = createClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // State Data
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Dummy Data untuk meniru Screenshot (Nanti diganti fetch dari DB)
    const transactionData = {
        invoiceId: "#INV/00841",
        status: "Selesai",
        date: "10 Februari 2026",
        dueDate: "-",
        product: "Trial",
        total: "Gratis",
        paymentMethod: "System"
    };

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);
            }
            setLoading(false);
        };
        getUser();
    }, []);

    return (
        <div className="relative z-1 min-h-screen bg-background text-foreground">
            {/* --- LAYOUT HEADER & SIDEBAR --- */}
            <DesktopHeader user={user} />
            <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} withHeader={true} />

            <div className="flex flex-col min-w-0 md:ml-[330px] md:pt-[72px] transition-all duration-300">
                <MobileHeader onMenuClick={() => setSidebarOpen(true)} user={user} />

                <main className="p-6 md:p-10 w-full overflow-x-hidden">

                    {/* --- PAGE HEADER & BREADCRUMBS --- */}
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Transaksi</h1>
                        <nav className="flex items-center text-sm text-muted-foreground">
                            <Link href="/dashboard" className="hover:text-primary transition-colors">Akun</Link>
                            <ChevronRight size={14} className="mx-1" />
                            <span className="font-medium text-foreground">Transaksi</span>
                        </nav>
                    </div>
                    {/* --- INVOICE CARD --- */}
                    {/* Pastikan ada class 'relative', dan JANGAN gunakan 'overflow-hidden' agar lipatan pita terlihat */}
                    <div className="relative w-full max-w-3xl bg-card border border-border rounded-xl shadow-sm">

                        {/* THE FOLDED RIBBON (Gaya Screenshot 53) */}
                        <div className="absolute top-10 -right-[7px] z-10 flex flex-col items-end">
                            {/* Badan Utama Pita */}
                            <div className="bg-[#0ea5e9] text-white px-5 py-2 rounded-l-lg font-bold text-sm shadow-md">
                                {transactionData.status}
                            </div>

                            {/* Efek Lipatan (Segitiga Gelap di bawah) */}
                            <div className="w-0 h-0 
            border-t-[8px] border-t-[#0c4a6e] 
            border-r-[8px] border-r-transparent">
                            </div>
                        </div>

                        {/* Card Header: Invoice ID */}
                        <div className="p-6 border-b border-border/50 bg-muted/20 rounded-t-xl">
                            <div className="pr-24"> {/* Padding kanan agar ID tidak tertutup pita */}
                                <h2 className="text-xl font-bold text-blue-600 tracking-tight">
                                    {transactionData.invoiceId}
                                </h2>
                                <p className="text-xs text-muted-foreground mt-1">Invoice Detail</p>
                            </div>
                        </div>

                        {/* Card Body: Details List */}
                        <div className="p-6 sm:p-8 space-y-6">
                            {/* Row 1: Tanggal Terbit */}
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-dashed border-border">
                                <span className="text-muted-foreground mb-1 sm:mb-0 font-medium">Tanggal Terbit :</span>
                                <span className="font-semibold text-slate-700">{transactionData.date}</span>
                            </div>

                            {/* Row 2: Tenggat Waktu */}
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-dashed border-border">
                                <span className="text-muted-foreground mb-1 sm:mb-0 font-medium">Tenggat Waktu :</span>
                                <span className="font-semibold text-slate-700">{transactionData.dueDate}</span>
                            </div>

                            {/* Row 3: Produk */}
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-dashed border-border">
                                <span className="text-muted-foreground mb-1 sm:mb-0 font-medium">Produk :</span>
                                <span className="font-bold text-foreground">{transactionData.product}</span>
                            </div>

                            {/* Row 4: Total */}
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-4 border-b border-dashed border-border">
                                <span className="text-muted-foreground mb-1 sm:mb-0 font-medium">Total :</span>
                                <span className="font-bold text-blue-600 text-lg">{transactionData.total}</span>
                            </div>

                            {/* Row 5: Metode Pembayaran */}
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                <span className="text-muted-foreground mb-1 sm:mb-0 font-medium">Metode Pembayaran :</span>
                                <span className="font-bold text-slate-700">{transactionData.paymentMethod}</span>
                            </div>
                        </div>

                        {/* Card Footer: Actions */}
                        <div className="bg-muted/30 p-4 flex justify-end gap-3 border-t border-border rounded-b-xl">
                            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all border border-border rounded-lg bg-background hover:bg-muted active:scale-95">
                                <Printer size={16} />
                                Print
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0ea5e9] hover:bg-[#0284c7] rounded-lg transition-all shadow-sm active:scale-95">
                                <Download size={16} />
                                Download PDF
                            </button>
                        </div>
                    </div>
                    {/* --- FOOTER --- */}
                    <div className="mt-10 pt-5 border-t border-border text-muted-foreground text-center text-sm">
                        &copy; {new Date().getFullYear()} WeddingSaas. All rights reserved.
                    </div>
                </main>
            </div>
        </div>
    );
}