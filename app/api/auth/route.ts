import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const host = req.headers.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

    if (!code) {
        return new NextResponse("No code provided", { status: 400 });
    }

    try {
        // 1. TUKAR CODE DENGAN TOKEN
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
                client_secret: process.env.G_CLIENT_SECRET!,
                redirect_uri: `${protocol}://${host}/api/auth`,
                grant_type: 'authorization_code',
            }),
        });

        const tokens = await tokenRes.json();
        if (tokens.error) throw new Error(tokens.error_description);

        // 2. AMBIL DATA GMAIL USER
        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const user = await userRes.json();

        // 3. AMBIL DATA CHANNEL YOUTUBE
        const ytRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const ytData = await ytRes.json();
        const channel = ytData.items ? ytData.items[0] : null;

        // 4. SUSUN DATA UNTUK SUPABASE
        const payload: any = {
            gmail: user.email,
            name: channel ? channel.snippet.title : user.name,
            thumbnail: channel ? channel.snippet.thumbnails.default.url : user.picture,
            subs: channel ? channel.statistics.subscriberCount : "0",
            views: channel ? channel.statistics.viewCount : "0",
            access_token: tokens.access_token,
            expires_at: Math.floor(Date.now() / 1000) + (tokens.expires_in || 3600),
            updated_at: new Date().toISOString() // Ensure updated_at is set
        };

        if (tokens.refresh_token) {
            payload.refresh_token = tokens.refresh_token;
        }

        // 5. SIMPAN KE SUPABASE
        const { error } = await supabase.from('yt_accounts').upsert(payload, { onConflict: 'gmail' });
        if (error) throw error;

        // 6. REDIRECT KE DASHBOARD
        return NextResponse.redirect(new URL('/dashboard', req.url));

    } catch (err: any) {
        console.error("Auth Error:", err.message);
        return new NextResponse("Error: " + err.message, { status: 500 });
    }
}
