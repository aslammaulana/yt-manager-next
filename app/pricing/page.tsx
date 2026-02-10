"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle, Shield, Crown } from "lucide-react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default function PricingPage() {
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center p-6 pt-20">
            <div className="w-full max-w-4xl text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Access Restricted</h1>
                <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                    Your account currently has <span className="text-yellow-400 font-bold">No Access</span> role.
                    <br />Please select a plan to activate your dashboard.
                </p>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free / No Access Card */}
                    <div className="bg-[#1e1e1e]/50 border border-gray-800 rounded-2xl p-8 flex flex-col opacity-75">
                        <div className="flex items-center justify-center mb-4">
                            <Shield size={32} className="text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Visitor</h2>
                        <div className="text-4xl font-bold mb-6">Free</div>
                        <ul className="text-left space-y-3 mb-8 flex-1">
                            <li className="flex items-center gap-2 text-gray-400"><CheckCircle size={16} /> Restricted Access</li>
                            <li className="flex items-center gap-2 text-gray-400"><CheckCircle size={16} /> No Dashboard View</li>
                        </ul>
                        <button disabled className="btn ghost cursor-not-allowed w-full">Current Plan</button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-gradient-to-b from-[#1e1e1e] to-[#0f0f0f] border border-cyan-500/50 rounded-2xl p-8 flex flex-col relative transform hover:scale-105 transition duration-300 shadow-2xl shadow-cyan-500/10">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-500"></div>
                        <div className="flex items-center justify-center mb-4">
                            <Crown size={32} className="text-cyan-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-cyan-400">Pro Edition</h2>
                        <div className="text-4xl font-bold mb-6">Rp 150K<span className="text-lg font-normal text-gray-500">/mo</span></div>
                        <ul className="text-left space-y-3 mb-8 flex-1">
                            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-cyan-400" /> Full Dashboard Access</li>
                            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-cyan-400" /> Unlimited Channel Sync</li>
                            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-cyan-400" /> Realtime 48h Analytics</li>
                            <li className="flex items-center gap-2"><CheckCircle size={16} className="text-cyan-400" /> Bulk Manager Tools</li>
                        </ul>
                        <a
                            href="https://wa.me/6281234567890?text=Halo%20Admin,%20saya%20tertarik%20upgrade%20Plan%20Pro%20YT%20Manager"
                            target="_blank"
                            className="bg-[#155dfc] hover:bg-[#407bfa] text-white font-bold py-3 px-6 rounded-lg text-center transition flex items-center justify-center gap-2"
                        >
                            Contact Admin to Upgrade <ArrowRight size={16} />
                        </a>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-500 text-sm mb-4">Already upgraded?</p>
                    <button onClick={handleSignOut} className="text-red-400 hover:text-red-300 underline font-medium text-sm">
                        Sign Out & Refund
                    </button>
                </div>
            </div>
        </div>
    );
}
