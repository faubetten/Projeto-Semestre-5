import { NextRequest, NextResponse } from 'next/server';

/**
 * Dynamic Event API Route Handler
 * Handles operations for specific events identified by slug
 * GET: Fetch single event by slug with comprehensive error handling
 */

import connectDB from '@/lib/mongodb';
import Event from '@/database/event.model';

// Define route parameters type for TypeScript
interface RouteContext {
    params: Promise<{
        slug: string;
    }>;
}

// Define a simple interface for the event data
interface EventData {
    _id: string;
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: string;
    audience: string;
    organizer: string;
    tags: string[];
    agenda: string[];
    price?: number;
    capacity?: number;
    registrationUrl?: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug with comprehensive error handling
 * @param req - NextRequest object
 * @param context - Route context containing the event slug
 * @returns NextResponse with event data or error message
 */
export async function GET(
    req: NextRequest,
    context: RouteContext
) {
    try {
        // Connect to database
        await connectDB();

        // Extract and validate slug from parameters
        const { slug } = await context.params;

        if (!slug || typeof slug !== 'string' || slug.trim() === '') {
            return NextResponse.json(
                { message: 'Valid event slug is required' },
                { status: 400 }
            );
        }

        // Sanitize and normalize slug
        const sanitizedSlug = slug.trim().toLowerCase();

        console.log('🔍 Fetching event with slug:', sanitizedSlug);

        // Query event by slug with lean for better performance
        const event = await Event.findOne({ slug: sanitizedSlug }).lean() as EventData | null;

        // Handle event not found
        if (!event) {
            console.log('❌ Event not found for slug:', sanitizedSlug);
            return NextResponse.json(
                { message: `Event '${sanitizedSlug}' not found` },
                { status: 404 }
            );
        }

        console.log('✅ Event found:', event.title);

        // Return successful response
        return NextResponse.json(
            {
                message: 'Event fetched successfully',
                event
            },
            { status: 200 }
        );
    } catch (error) {
        // Comprehensive error handling with appropriate logging
        console.error(`❌ Error fetching event by slug:`, error);

        // Handle specific error types
        if (error instanceof Error) {
            // Database connection errors
            if (error.message.includes('MONGODB_URI') || error.message.includes('connection')) {
                console.error('🔌 Database connection error');
                return NextResponse.json(
                    { message: 'Database connection error' },
                    { status: 503 }
                );
            }

            // Return specific error message for known errors
            return NextResponse.json(
                {
                    message: 'Failed to fetch event',
                    error: process.env.NODE_ENV === 'development' ? error.message : undefined
                },
                { status: 500 }
            );
        }

        // Handle unknown errors
        return NextResponse.json(
            { message: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}