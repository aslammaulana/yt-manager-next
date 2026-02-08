
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
            // Token Refresh Logic
            // Refresh if expired or expires in < 5 mins (300s)
            if ((nowInSeconds + 300) >= expiresAt && acc.refresh_token) {
                if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || !process.env.G_CLIENT_SECRET) {
                    console.error("Missing Google Client ID or Secret");
                } else {
                    try {
                        const response = await fetch("https://oauth2.googleapis.com/token", {
                            method: "POST",
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            body: new URLSearchParams({
                                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                                client_secret: process.env.G_CLIENT_SECRET,
                                refresh_token: acc.refresh_token,
                                grant_type: "refresh_token",
                            }),
                        });

                        const newTokenData = await response.json();

                        if (!response.ok) {
                            console.error(`Failed to refresh token for ${acc.gmail}: ${response.status} ${JSON.stringify(newTokenData)}`);
                        } else if (newTokenData.access_token) {
                            token = newTokenData.access_token;
                            // Google returns expires_in (seconds)
                            expiresAt = nowInSeconds + (newTokenData.expires_in || 3600);

                            console.log(`Token refreshed successfully for ${acc.gmail}. New expiry: ${expiresAt}`);

                            // Update DB with new token
                            const { error: updateError } = await supabase.from('yt_accounts').update({
                                access_token: token,
                                expires_at: expiresAt,
                                updated_at: new Date().toISOString()
                            }).eq('gmail', acc.gmail);

                            if (updateError) console.error("DB Update Error after refresh:", updateError);
                        }
                    } catch (refreshErr) {
                        console.error("Exception during token refresh for " + acc.gmail, refreshErr);
                    }
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
