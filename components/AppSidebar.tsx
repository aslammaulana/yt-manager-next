"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Sidebar from "./Sidebar";

// Constants
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "262964938761-4e41cgkbud489toac5midmamoecb3jrq.apps.googleusercontent.com";
const SCOPES = "openid email profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/youtube.upload";

export default function AppSidebar({ isOpen, onClose, withHeader = false }: { isOpen: boolean; onClose: () => void; withHeader?: boolean }) {
    const router = useRouter();
    const supabase = createClient();
    const [role, setRole] = useState<string>("inactive");
    const [expiryDate, setExpiryDate] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchRole = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, access_expires_at')
                    .eq('id', session.user.id)
                    .single();
                if (profile) {
                    setRole(profile.role);
                    setExpiryDate(profile.access_expires_at);
                }
            }
        };
        fetchRole();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const googleSignIn = () => {
        const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/api/auth` : '';
        if (!REDIRECT_URI) return;
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${CLIENT_ID}&` +
            `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
            `response_type=code&` +
            `scope=${encodeURIComponent(SCOPES)}&` +
            `access_type=offline&` +
            `prompt=consent`;
        window.location.href = authUrl;
    };

    return (
        <Sidebar
            role={role}
            expiryDate={expiryDate}
            googleSignIn={googleSignIn}
            handleSignOut={handleSignOut}
            isOpen={isOpen}
            onClose={onClose}
            withHeader={withHeader}
        />
    );
}
