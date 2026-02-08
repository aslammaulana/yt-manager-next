import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, type = 'info' } = body;
        
        switch(type) {
            case 'error':
                console.error('❌ Client Error:', message);
                break;
            case 'warn':
                console.warn('⚠️ Client Warning:', message);
                break;
            default:
                console.log('ℹ️ Client Log:', message);
        }
        
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to log' }, { status: 500 });
    }
}
