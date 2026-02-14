import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify Admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { transactionId } = await req.json();

        const adminClient = createAdminClient();

        // 1. Get Transaction Details
        const { data: trx, error: trxError } = await adminClient
            .from('transactions')
            .select('*')
            .eq('id', transactionId)
            .single();

        if (trxError || !trx) throw new Error('Transaction not found');
        if (trx.status === 'approved') return NextResponse.json({ message: 'Already approved' });

        // 2. Update Transaction Status
        const { error: updateError } = await adminClient
            .from('transactions')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString()
            })
            .eq('id', transactionId);

        if (updateError) throw updateError;

        // 3. Update User Profile (Role & Expiry)
        // Calculate new expiry
        const now = new Date();
        const durationMs = trx.duration_days * 24 * 60 * 60 * 1000;
        const newExpiry = new Date(now.getTime() + durationMs).toISOString();

        const { error: profileError } = await adminClient
            .from('profiles')
            .update({
                role: 'member',
                access_expires_at: newExpiry
            })
            .eq('id', trx.user_id);

        if (profileError) throw profileError;

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Approve Transaction Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
