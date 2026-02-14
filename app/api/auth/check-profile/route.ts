import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if profile exists
    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

    if (profile) {
        return NextResponse.json({ message: 'Profile exists' });
    }

    console.log(`Profile missing for user ${user.id}. Creating now...`);

    // Create missing profile
    const { error } = await supabase
        .from('profiles')
        .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
            whatsapp: user.user_metadata?.whatsapp || '',
            role: 'member', // Default role for healed users
            created_at: new Date().toISOString()
        });

    if (error) {
        console.error('Error creating profile:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profile created' });
}
