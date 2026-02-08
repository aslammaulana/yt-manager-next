
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();

        // Get Session to confirm auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            console.warn("Unauthorized API Access:", authError);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // RLS will allow Admins to see all, Editors to see own.
        // We select * from yt_accounts.
        const { data: accounts, error } = await supabase.from('yt_accounts').select('*');
        if (error) throw error;

        const updatedAccounts = await Promise.all(accounts.map(async (acc) => {
            let token = acc.access_token;
            let expiresAt = acc.expires_at; // In Seconds
            let nowInSeconds = Math.floor(Date.now() / 1000);

            // Token Refresh Logic
            if (nowInSeconds >= expiresAt && acc.refresh_token) {
                try {
                    const response = await fetch("https://oauth2.googleapis.com/token", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({
                            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                            client_secret: process.env.G_CLIENT_SECRET!,
                            refresh_token: acc.refresh_token,
                            grant_type: "refresh_token",
                        }),
                    });

                    const newTokenData = await response.json();

                    if (newTokenData.access_token) {
                        token = newTokenData.access_token;
                        expiresAt = nowInSeconds + (newTokenData.expires_in || 3600);

                        // Update DB with new token
                        await supabase.from('yt_accounts').update({
                            access_token: token,
                            expires_at: expiresAt
                        }).eq('gmail', acc.gmail);
                    }
                } catch (refreshErr) {
                    console.error("Failed Refresh Token for: " + acc.gmail);
                }
            }

            return {
                id: acc.id,
                gmail: acc.gmail,
                name: acc.name || "Unknown Channel",
                subs: acc.subs || "0",
                views: acc.views || "0",
                thumbnail: acc.thumbnail || "",
                access_token: token,
                expires_at: expiresAt,
                emailSource: acc.gmail,
                realtime: acc.realtime || { h48: 0 } // Add realtime property safety
            };
        }));

        return NextResponse.json(updatedAccounts);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
