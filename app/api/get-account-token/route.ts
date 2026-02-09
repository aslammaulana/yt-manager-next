import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    try {
        const supabase = await createClient();

        // Get user session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Query the specific account by email (using yt_accounts table, same as get-stats)
        // RLS handles access control
        const { data, error } = await supabase
            .from("yt_accounts")
            .select("access_token, refresh_token, gmail, id, expires_at")
            .eq("gmail", email)
            .single();

        if (error || !data) {
            console.error("Account query error:", error);
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        // Check if token needs refresh
        let accessToken = data.access_token;
        const nowInSeconds = Math.floor(Date.now() / 1000);

        if ((nowInSeconds + 300) >= data.expires_at && data.refresh_token) {
            // Token expired or expiring soon, refresh it
            if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && process.env.G_CLIENT_SECRET) {
                try {
                    const response = await fetch("https://oauth2.googleapis.com/token", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({
                            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
                            client_secret: process.env.G_CLIENT_SECRET,
                            refresh_token: data.refresh_token,
                            grant_type: "refresh_token",
                        }),
                    });

                    const newTokenData = await response.json();

                    if (response.ok && newTokenData.access_token) {
                        accessToken = newTokenData.access_token;
                        const newExpiresAt = nowInSeconds + (newTokenData.expires_in || 3600);

                        // Update DB with new token
                        await supabase.from('yt_accounts').update({
                            access_token: accessToken,
                            expires_at: newExpiresAt,
                            updated_at: new Date().toISOString()
                        }).eq('gmail', email);

                        console.log(`Token refreshed for ${email}`);
                    }
                } catch (refreshErr) {
                    console.error("Token refresh error:", refreshErr);
                }
            }
        }

        return NextResponse.json({
            access_token: accessToken,
            gmail: data.gmail,
            id: data.id
        });

    } catch (error) {
        console.error("Error fetching account token:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
