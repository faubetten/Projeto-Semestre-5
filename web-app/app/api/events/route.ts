import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

/**
 * Events API Route Handler
 * Handles CRUD operations for events with image upload capabilities
 */

import connectDB from "@/lib/mongodb";
import Event from '@/database/event.model';

// Configure Cloudinary using the URL format
if (process.env.CLOUDINARY_URL) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_URL.match(/cloudinary:\/\/(?:.*)@(.*)/)?.[1],
        api_key: process.env.CLOUDINARY_URL.match(/cloudinary:\/\/(.*):/)?.[1],
        api_secret: process.env.CLOUDINARY_URL.match(/cloudinary:\/\/.*:(.*)@/)?.[1],
    });
} else {
    // Fallback to individual environment variables
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

// Helper function to validate Cloudinary configuration
function validateCloudinaryConfig() {
    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
        console.error('Cloudinary configuration is incomplete:', {
            cloud_name: config.cloud_name ? 'set' : 'missing',
            api_key: config.api_key ? 'set' : 'missing',
            api_secret: config.api_secret ? 'set' : 'missing'
        });
        return false;
    }
    return true;
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        // Validate Cloudinary configuration
        if (!validateCloudinaryConfig()) {
            return NextResponse.json(
                { message: 'Cloud storage service is not properly configured' },
                { status: 500 }
            );
        }

        const formData = await req.formData();

        // Parse form data into event object
        let eventData: Record<string, any> = {};

        try {
            // Convert FormData to plain object
            for (const [key, value] of formData.entries()) {
                if (key === 'tags' || key === 'agenda') {
                    // Parse JSON arrays
                    try {
                        eventData[key] = JSON.parse(value as string);
                    } catch (parseError) {
                        console.error(`Error parsing ${key}:`, parseError);
                        eventData[key] = key === 'tags' ? [] : [value as string];
                    }
                } else if (key !== 'image') {
                    // Store other fields as strings
                    eventData[key] = value;
                }
            }
        } catch (parseError) {
            console.error('Form data parsing error:', parseError);
            return NextResponse.json(
                { message: 'Invalid form data format' },
                { status: 400 }
            );
        }

        // Validate required fields
        const requiredFields = ['title', 'description', 'overview', 'venue', 'location', 'date', 'time', 'mode', 'audience', 'organizer'];
        const missingFields = requiredFields.filter(field => !eventData[field]);

        if (missingFields.length > 0) {
            return NextResponse.json(
                { message: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // Handle image upload
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return NextResponse.json(
                { message: 'Event image is required' },
                { status: 400 }
            );
        }

        // Validate image file
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(imageFile.type)) {
            return NextResponse.json(
                { message: 'Invalid image format. Please use JPEG, PNG, or WebP' },
                { status: 400 }
            );
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (imageFile.size > maxSize) {
            return NextResponse.json(
                { message: 'Image size must be less than 5MB' },
                { status: 400 }
            );
        }

        let imageUrl: string;

        try {
            // Convert file to buffer for Cloudinary upload
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            console.log('Uploading image to Cloudinary...', {
                size: imageFile.size,
                type: imageFile.type,
                cloud_name: cloudinary.config().cloud_name
            });

            // Upload to Cloudinary with simpler configuration
            const uploadResult = await new Promise<any>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'image',
                        folder: 'confAI',
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            reject(error);
                        } else {
                            if (!result) {
                                console.error('Cloudinary upload failed: result is undefined');
                                reject(new Error('Cloudinary upload failed'));
                                return;
                            }

                            console.log('Cloudinary upload successful:', {
                                url: result.secure_url,
                                public_id: result.public_id
                            });
                            resolve(result);
                        }
                    }
                ).end(buffer);
            });

            imageUrl = uploadResult.secure_url;
        } catch (uploadError) {
            console.error('Image upload failed:', uploadError);
            return NextResponse.json(
                {
                    message: 'Failed to upload image to cloud storage',
                    error: process.env.NODE_ENV === 'development' ? (uploadError as Error).message : undefined
                },
                { status: 500 }
            );
        }

        // Create event in database
        try {
            // Try to resolve authenticated user id from Clerk (safe dynamic import)
            let creatorId: string | undefined;
            try {
                const clerk = await import('@clerk/nextjs/server').catch(() => null);
                if (clerk) {
                    // Prefer getAuth(req) which accepts the NextRequest in many Clerk versions
                    if (typeof clerk.getAuth === 'function') {
                        try {
                            const authRes = await clerk.getAuth(req as any);
                            if (authRes && (authRes as any).userId) creatorId = (authRes as any).userId;
                        } catch (e) {
                            // ignore and try other helpers
                        }
                    }

                    // Fallback to auth() if available
                    if (!creatorId && typeof clerk.auth === 'function') {
                        try {
                            const authRes = await clerk.auth();
                            if (authRes && (authRes as any).userId) creatorId = (authRes as any).userId;
                        } catch (e) {
                            // ignore
                        }
                    }
                }
            } catch (e) {
                // If Clerk is not installed or import fails, continue without creatorId
                console.warn('Clerk import or auth check failed, continuing without creatorId');
            }

            const createdEvent = await Event.create({
                ...eventData,
                image: imageUrl,
                ...(creatorId ? { creatorId } : {}),
            });

            // Return success response with created event
            return NextResponse.json(
                {
                    message: 'Event created successfully',
                    event: createdEvent
                },
                { status: 201 }
            );
        } catch (dbError: any) {
            console.error('Database creation error:', dbError);

            // Handle duplicate slug error
            if (dbError.code === 11000) {
                return NextResponse.json(
                    { message: 'An event with this title already exists' },
                    { status: 409 }
                );
            }

            // Handle validation errors
            if (dbError.name === 'ValidationError') {
                const errors = Object.values(dbError.errors).map((err: any) => err.message);
                return NextResponse.json(
                    { message: 'Validation failed', errors },
                    { status: 400 }
                );
            }

            throw dbError;
        }
    } catch (error) {
        console.error('Event creation failed:', error);

        return NextResponse.json(
            {
                message: 'Event creation failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}


/**
 * GET /api/events
 * Fetches events with pagination, filtering, and sorting
 * @param req - NextRequest with query parameters for filtering
 * @returns NextResponse with events array and pagination info
 */
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);

        // Parse query parameters
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
        const mode = searchParams.get('mode');
        const tag = searchParams.get('tag');
        const search = searchParams.get('search');
        const sort = searchParams.get('sort') || 'date';

        const skip = (page - 1) * limit;

        // Build query filter
        const filter: any = {};

        // Only show future events by default
        const today = new Date().toISOString().split('T')[0];
        filter.date = { $gte: today };

        // Apply filters
        if (mode && ['online', 'offline', 'hybrid'].includes(mode)) {
            filter.mode = mode;
        }

        if (tag) {
            filter.tags = { $in: [tag] };
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
            ];
        }

        // Build sort object
        const sortOptions: any = {};
        switch (sort) {
            case 'date':
                sortOptions.date = 1;
                break;
            case 'date-desc':
                sortOptions.date = -1;
                break;
            case 'created':
                sortOptions.createdAt = -1;
                break;
            default:
                sortOptions.date = 1;
        }

        // Execute query with pagination
        const [events, total] = await Promise.all([
            Event.find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            Event.countDocuments(filter),
        ]);

        return NextResponse.json({
            message: 'Events fetched successfully',
            events,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1,
            },
        }, { status: 200 });
    } catch (error) {
        console.error('Event fetching failed:', error);

        return NextResponse.json(
            {
                message: 'Failed to fetch events',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}