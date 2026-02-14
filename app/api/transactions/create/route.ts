import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { productName, amount, durationDays } = await req.json();

        if (!productName || !amount || !durationDays) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate Invoice ID: INV/YYYYMMDD/RANDOM4
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(1000 + Math.random() * 9000);
        const invoiceId = `INV/${date}/${random}`;

        const { data, error } = await supabase
            .from('transactions')
            .insert({
                user_id: user.id,
                invoice_id: invoiceId,
                email: user.email,
                product_name: productName,
                amount: amount,
                duration_days: durationDays,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, invoiceId, transactionId: data.id });
    } catch (error: any) {
        console.error('Create Transaction Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
