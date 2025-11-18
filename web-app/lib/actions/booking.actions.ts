'use server';

/**
 * Server actions for booking management
 * Handles events registration with capacity checks and duplicate prevention
 */

import { revalidatePath } from 'next/cache';
import Booking from '@/database/booking.model';
import Event from '@/database/event.model';
import connectDB from '@/lib/mongodb';
import { API_MESSAGES } from '@/lib/constants';

/**
 * Creates a new booking for an events with comprehensive validation
 * @param bookingData - Booking information including eventId, email, and fullName
 * @returns Promise<{ success: boolean; message: string; bookingId?: string }>
 */
export async function createBooking(bookingData: {
    eventId: string;
    email: string;
    fullName: string;
}) {
    try {
        await connectDB();

        const { eventId, email, fullName } = bookingData;

        // Validate events exists and check capacity
        const event = await Event.findById(eventId);
        if (!event) {
            return {
                success: false,
                message: API_MESSAGES.ERROR.NOT_FOUND
            };
        }

        // Check capacity if events has a limit
        if (event.capacity) {
            const currentBookings = await Booking.countDocuments({
                eventId,
                status: 'confirmed'
            });

            if (currentBookings >= event.capacity) {
                return {
                    success: false,
                    message: API_MESSAGES.ERROR.EVENT_FULL
                };
            }
        }

        // Create new booking
        const booking = await Booking.create({
            eventId,
            email,
            fullName,
            status: 'confirmed',
        });

        // Revalidate events page to update booking count
        revalidatePath(`/events/${event.slug}`);

        return {
            success: true,
            message: API_MESSAGES.SUCCESS.BOOKING_CREATED,
            bookingId: booking._id.toString(),
        };
    } catch (error: any) {
        console.error('Booking creation failed:', error);

        // Handle duplicate booking error
        if (error.code === 11000 || error.message.includes('duplicate')) {
            return {
                success: false,
                message: API_MESSAGES.ERROR.DUPLICATE_BOOKING
            };
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return {
                success: false,
                message: Object.values(error.errors).map((e: any) => e.message).join(', ')
            };
        }

        return {
            success: false,
            message: API_MESSAGES.ERROR.SERVER_ERROR
        };
    }
}

/**
 * Cancels an existing booking
 * @param bookingId - ID of the booking to cancel
 * @returns Promise<{ success: boolean; message: string }>
 */
export async function cancelBooking(bookingId: string) {
    try {
        await connectDB();

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { status: 'cancelled' },
            { new: true }
        ).populate('eventId');

        if (!booking) {
            return {
                success: false,
                message: API_MESSAGES.ERROR.NOT_FOUND
            };
        }

        // Revalidate relevant paths
        revalidatePath(`/events/${(booking.eventId as any).slug}`);

        return {
            success: true,
            message: API_MESSAGES.SUCCESS.BOOKING_CANCELLED
        };
    } catch (error) {
        console.error('Error cancelling booking:', error);
        return {
            success: false,
            message: API_MESSAGES.ERROR.SERVER_ERROR
        };
    }
}

/**
 * Fetches bookings for a specific events (admin functionality)
 * @param eventId - ID of the events
 * @param page - Page number for pagination
 * @param limit - Number of bookings per page
 * @returns Promise<{ bookings: IBooking[], total: number }>
 */
export async function getEventBookings(eventId: string, page: number = 1, limit: number = 50) {
    try {
        await connectDB();

        const skip = (page - 1) * limit;

        const [bookings, total] = await Promise.all([
            Booking.find({ eventId, status: 'confirmed' })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Booking.countDocuments({ eventId, status: 'confirmed' }),
        ]);

        return {
            bookings: JSON.parse(JSON.stringify(bookings)),
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
        };
    } catch (error) {
        console.error('Error fetching events bookings:', error);
        return { bookings: [], total: 0, currentPage: page, totalPages: 0 };
    }
}