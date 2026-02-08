import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        // If login successful, ensure profile exists
        if (data.user && !error) {
            const userId = data.user.id;
            const userEmail = data.user.email || 'unknown@email.com';

            // Check if profile exists
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', userId)
                .single();

            // If no profile, create one
            if (!existingProfile) {
                await supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        email: userEmail,
                        role: 'no_access'
                    });
            }
        }
    }

    return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
