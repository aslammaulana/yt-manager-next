
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!Array.isArray(body)) {
            return NextResponse.json({ error: "Input must be a JSON array" }, { status: 400 });
        }

        const validItems = body.filter((item: any) => item.email && item.access_token);

        if (validItems.length === 0) {
            return NextResponse.json({ error: "No valid data found" }, { status: 400 });
        }

        const supabase = await createClient();

        // Get User Session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const upsertData = validItems.map((item: any) => ({
            gmail: item.email,
            user_id: user.id, // Link to owner
            access_token: item.access_token,
            expires_at: item.expires_at || (Math.floor(Date.now() / 1000) + 3600),
            refresh_token: item.refresh_token || null,
            name: item.name || "Imported Channel",
            subs: item.subs || "0",
            views: item.views || "0",
            thumbnail: item.thumbnail || ""
        }));

        const { error } = await supabase
            .from('yt_accounts')
            .upsert(upsertData, { onConflict: 'gmail' });

        if (error) {
            console.error("Supabase Error:", error);
            throw error;
        }

        return NextResponse.json({ success: true, count: validItems.length });

    } catch (err: any) {
        console.error("Import API Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
