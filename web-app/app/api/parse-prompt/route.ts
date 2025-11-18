import { NextResponse } from 'next/server';
import Event from '@/database/event.model';
import connectDB from '@/lib/mongodb';
import parsePrompt from '@/lib/parsePrompt';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const prompt = typeof body?.prompt === 'string' ? body.prompt : '';

        await connectDB();

        // Use event tags to improve tag detection
        const knownTags = await Event.distinct('tags');

        const parsed = await parsePrompt(prompt || '', { knownTags: knownTags || [] });

        return NextResponse.json({ parsed });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to parse prompt' }, { status: 500 });
    }
}
