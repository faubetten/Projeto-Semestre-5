import { NextResponse } from 'next/server';
import recommendEventsCSP from '@/lib/recommend_csp';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const prompt = typeof body?.prompt === 'string' ? body.prompt : '';
        const limit = typeof body?.limit === 'number' ? body.limit : 5;

        const recs = await recommendEventsCSP(prompt, { limit });

        return NextResponse.json({ results: recs });
    } catch (err) {
        console.error('recommend-csp API error', err);
        return NextResponse.json({ error: 'Failed to compute CSP recommendations' }, { status: 500 });
    }
}
