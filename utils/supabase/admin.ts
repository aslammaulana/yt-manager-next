import { createClient } from "@supabase/supabase-js";

// Service Role Client - BYPASSES RLS
// Only use for admin operations that need to see all data
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
}
