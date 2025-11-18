import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

/**
 * File Upload API Route
 * Handles standalone file uploads to Cloudinary with validation
 * Used for events images and other media uploads
 */

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

/**
 * POST /api/upload
 * Handles file uploads to Cloudinary with comprehensive validation
 */
export async function POST(req: NextRequest) {
    try {
        // Validate Cloudinary configuration
        if (!validateCloudinaryConfig()) {
            return NextResponse.json(
                { message: 'Cloud storage service is not properly configured' },
                { status: 500 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        // Validate file existence
        if (!file) {
            return NextResponse.json(
                { message: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { message: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { message: 'File size must be less than 5MB' },
                { status: 400 }
            );
        }

        console.log('Uploading file to Cloudinary:', {
            name: file.name,
            type: file.type,
            size: file.size,
            cloud_name: cloudinary.config().cloud_name
        });

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary with better error handling
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder: 'confAI',
                    transformation: [
                        { width: 1200, height: 800, crop: 'limit' },
                        { quality: 'auto', fetch_format: 'auto' }
                    ],
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

        // Return upload result
        return NextResponse.json(
            {
                message: 'File uploaded successfully',
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                format: uploadResult.format,
                size: uploadResult.bytes,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('File upload error:', error);

        // Provide more specific error messages
        let errorMessage = 'File upload failed';
        if (error.message.includes('Invalid credentials')) {
            errorMessage = 'Cloud storage authentication failed. Please check your configuration.';
        } else if (error.message.includes('network') || error.message.includes('timeout')) {
            errorMessage = 'Network error occurred while uploading. Please try again.';
        }

        return NextResponse.json(
            {
                message: errorMessage,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/upload
 * Provides upload configuration and limits
 */
export async function GET() {
    return NextResponse.json({
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        maxSize: 5 * 1024 * 1024, // 5MB
        maxDimensions: { width: 4000, height: 4000 },
    });
}