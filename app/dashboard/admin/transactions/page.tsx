"use client";

import { useEffect, useState } from "react";
import { createClient } from '@/utils/supabase/client';
import DesktopHeader from "@/components/DesktopHeader";
import AppSidebar from "@/components/AppSidebar";
import MobileHeader from "@/components/MobileHeader";
import { Check, X, Clock } from "lucide-react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function AdminTransactions() {
    const supabase = createClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);

                // Fetch all transactions (admin only policy should be handled or filtered client side if RLS is strict)
                // Assuming RLS allows admins or we use an API. 
                // Since we are client-side, we rely on RLS 'admin view all'. 
                // If RLS is strict, we might need a dedicated API endpoint for fetching.
                // For now, let's try direct fetch if RLS was setup for admins. 
                // If not, we'll need to create a GET API. 
                // Let's assume we need to use a GET API to be safe/consistent with previous patterns.

                fetchTransactions();
            }
        };
        fetchUserData();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/transactions');
            const result = await res.json();
            if (result.transactions) setTransactions(result.transactions);
        } catch (e) {
            console.error('Failed to fetch transactions:', e);
        }
        setLoading(false);
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Setujui transaksi ini dan aktifkan membership user?')) return;

        try {
            const res = await fetch('/api/admin/transactions/approve', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId: id })
            });

            const result = await res.json();
            if (result.success) {
                alert('Transaksi disetujui!');
                fetchTransactions(); // Refresh
            } else {
                alert('Gagal: ' + result.error);
            }
        } catch (e: any) {
            alert('Error: ' + e.message);
        }
    };

    return (
        <div className="relative z-1 min-h-screen bg-background text-foreground">
            <DesktopHeader user={user} />
            <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} withHeader={true} />

            <div className="flex flex-col min-w-0 md:ml-[330px] md:pt-[72px] transition-all duration-300">
                <MobileHeader onMenuClick={() => setSidebarOpen(true)} user={user} />

                <main className="p-6 md:p-10 w-full overflow-x-hidden">
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">Kelola Transaksi</h1>
                        <p className="text-muted-foreground">Setujui pembayaran untuk mengaktifkan membership user.</p>
                    </div>

                    {/* Loading & Empty States */}
                    {loading && (
                        <div className="text-center py-20 text-muted-foreground">Loading...</div>
                    )}
                    {!loading && transactions.length === 0 && (
                        <div className="text-center py-20 bg-card border border-border rounded-xl text-muted-foreground">Belum ada transaksi.</div>
                    )}

                    {!loading && transactions.length > 0 && (
                        <>
                            {/* === MOBILE: Card Layout === */}
                            <div className="grid grid-cols-1 gap-4 md:hidden">
                                {transactions.map((trx) => (
                                    <div key={trx.id} className="bg-card border border-border rounded-xl shadow-sm p-4 space-y-3">
                                        {/* Header: Invoice + Status */}
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-blue-600 break-all">{trx.invoice_id}</p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5">{trx.email}</p>
                                            </div>
                                            <span className={`shrink-0 text-[10px] px-2 py-1 rounded-full font-bold uppercase ${trx.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                                trx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                {trx.status}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between items-center pb-2 border-b border-dashed border-border">
                                                <span className="text-muted-foreground font-medium">Tanggal</span>
                                                <span className="font-semibold">{new Date(trx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-2 border-b border-dashed border-border">
                                                <span className="text-muted-foreground font-medium">Produk</span>
                                                <span className="font-bold">{trx.product_name}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-muted-foreground font-medium">Total</span>
                                                <span className="font-bold text-blue-600 text-sm">Rp {parseInt(trx.amount).toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>

                                        {/* Action */}
                                        {trx.status === 'pending' && (
                                            <button
                                                onClick={() => handleApprove(trx.id)}
                                                className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                            >
                                                <Check size={14} /> Approve
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* === DESKTOP: Table Layout === */}
                            <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                                        <tr>
                                            <th className="p-4 font-semibold">Invoice</th>
                                            <th className="p-4 font-semibold">User</th>
                                            <th className="p-4 font-semibold">Product</th>
                                            <th className="p-4 font-semibold">Amount</th>
                                            <th className="p-4 font-semibold">Status</th>
                                            <th className="p-4 font-semibold text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {transactions.map((trx) => (
                                            <tr key={trx.id} className="hover:bg-muted/50 transition duration-150">
                                                <td className="p-4 font-mono text-xs">{trx.invoice_id}</td>
                                                <td className="p-4">
                                                    <div className="text-sm font-medium">{trx.email}</div>
                                                    <div className="text-xs text-muted-foreground">{new Date(trx.created_at).toLocaleDateString()}</div>
                                                </td>
                                                <td className="p-4 text-sm">{trx.product_name}</td>
                                                <td className="p-4 font-bold text-sm">Rp {parseInt(trx.amount).toLocaleString('id-ID')}</td>
                                                <td className="p-4">
                                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${trx.status === 'approved' ? 'bg-green-500/10 text-green-500' :
                                                        trx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {trx.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {trx.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleApprove(trx.id)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            <Check size={14} /> Approve
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
