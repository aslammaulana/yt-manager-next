import { createAdminClient } from '@/utils/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { email, password, full_name, whatsapp } = await req.json();

        if (!email || !password || !full_name || !whatsapp) {
            return NextResponse.json(
                { error: 'Semua field wajib diisi' },
                { status: 400 }
            );
        }

        const adminClient = createAdminClient();

        // 1. Create user with admin API (auto-confirms email)
        const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm, no email verification needed
            user_metadata: {
                full_name,
                whatsapp,
            },
        });

        if (createError) throw createError;

        // 2. Create profile with trial role (2 days)
        if (userData.user) {
            const trialExpiry = new Date();
            trialExpiry.setDate(trialExpiry.getDate() + 2); // 2 hari trial

            const { error: profileError } = await adminClient
                .from('profiles')
                .upsert({
                    id: userData.user.id,
                    email: email,
                    full_name: full_name,
                    whatsapp: whatsapp,
                    role: 'trial',
                    access_expires_at: trialExpiry.toISOString(),
                });

            if (profileError) {
                console.error("Profile creation error:", profileError);
            }
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error("Signup Error:", err);
        return NextResponse.json(
            { error: err.message || 'Terjadi kesalahan saat mendaftar' },
            { status: 500 }
        );
    }
}
