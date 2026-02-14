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

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);

                // Fetch user transactions
                const { data: trx, error } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });

                if (trx) setTransactions(trx);
            }
            setLoading(false);
        };
        fetchUserData();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return { bg: 'bg-green-500', border: 'border-t-green-700' };
            case 'pending': return { bg: 'bg-yellow-500', border: 'border-t-yellow-700' };
            case 'rejected': return { bg: 'bg-red-500', border: 'border-t-red-700' };
            default: return { bg: 'bg-gray-500', border: 'border-t-gray-700' };
        }
    };

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
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Riwayat Transaksi</h1>
                        <nav className="flex items-center text-sm text-muted-foreground">
                            <Link href="/dashboard" className="hover:text-primary transition-colors">Akun</Link>
                            <ChevronRight size={14} className="mx-1" />
                            <span className="font-medium text-foreground">Transaksi</span>
                        </nav>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-muted-foreground">Loading transactions...</div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-20 bg-card border border-border rounded-xl">
                            <p className="text-muted-foreground">Belum ada riwayat transaksi.</p>
                            <Link href="/pricing" className="text-primary hover:underline mt-2 inline-block">Beli Paket</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {transactions.map((trx) => {
                                const colors = getStatusColor(trx.status);
                                return (
                                    <div key={trx.id} className="relative w-full bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                        {/* THE FOLDED RIBBON */}
                                        <div className="absolute top-8 -right-[6px] z-10 flex flex-col items-end">
                                            <div className={`${colors.bg} text-white px-3 py-1 rounded-l-lg font-bold text-[10px] shadow-md capitalize`}>
                                                {trx.status}
                                            </div>
                                            <div className={`w-0 h-0 border-t-[6px] ${colors.border} border-r-[6px] border-r-transparent`}></div>
                                        </div>

                                        {/* Card Header: Invoice ID */}
                                        <div className="p-4 border-b border-border/50 bg-muted/20 rounded-t-xl">
                                            <div className="pr-16">
                                                <h2 className="text-xs md:text-sm font-bold text-blue-600 tracking-tight break-all">
                                                    {trx.invoice_id}
                                                </h2>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">Invoice Detail</p>
                                            </div>
                                        </div>

                                        {/* Card Body: Details List */}
                                        <div className="p-4 space-y-3">
                                            <div className="flex justify-between items-center pb-2 border-b border-dashed border-border">
                                                <span className="text-muted-foreground text-xs font-medium">Tanggal</span>
                                                <span className="font-semibold text-foreground text-xs">{new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>

                                            <div className="flex justify-between items-center pb-2 border-b border-dashed border-border">
                                                <span className="text-muted-foreground text-xs font-medium">Produk</span>
                                                <span className="font-bold text-foreground text-xs">{trx.product_name}</span>
                                            </div>

                                            <div className="flex justify-between items-center pb-2 border-b border-dashed border-border">
                                                <span className="text-muted-foreground text-xs font-medium">Total</span>
                                                <span className="font-bold text-blue-600 text-sm">Rp {parseInt(trx.amount).toLocaleString('id-ID')}</span>
                                            </div>

                                            {trx.status === 'approved' && (
                                                <>
                                                    <div className="flex justify-between items-center pb-2 border-b border-dashed border-border">
                                                        <span className="text-muted-foreground text-xs font-medium">Disetujui</span>
                                                        <span className="font-bold text-green-600 text-xs">{new Date(trx.approved_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-muted-foreground text-xs font-medium">Akses Berakhir</span>
                                                        <span className="font-bold text-red-500 text-xs">
                                                            {new Date(new Date(trx.approved_at).getTime() + (trx.duration_days * 24 * 60 * 60 * 1000)).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}