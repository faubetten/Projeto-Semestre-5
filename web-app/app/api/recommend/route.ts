import { NextResponse } from 'next/server';
import recommendEvents from '@/lib/recommend';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const prompt = typeof body?.prompt === 'string' ? body.prompt : '';
        const limit = typeof body?.limit === 'number' ? body.limit : 10;

        const recs = await recommendEvents(prompt, limit);

        return NextResponse.json({ results: recs });
    } catch (err) {
        console.error('recommend API error', err);
        return NextResponse.json({ error: 'Failed to compute recommendations' }, { status: 500 });
    }
}
