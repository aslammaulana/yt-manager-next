import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const supabase = await createClient();

        // Verify user is admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        // Use ADMIN CLIENT to bypass RLS
        const adminClient = createAdminClient();
        const { data: profiles, error } = await adminClient
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(profiles);
    } catch (err: any) {
        console.error("Admin Profiles Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const supabase = await createClient();

        // Verify user is admin
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
        }

        // Get request body
        const { userId, newRole } = await req.json();

        if (!userId || !newRole) {
            return NextResponse.json({ error: "Missing userId or newRole" }, { status: 400 });
        }

        // Update role using admin client to bypass RLS
        const adminClient = createAdminClient();
        const { error } = await adminClient
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("Update Role Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
