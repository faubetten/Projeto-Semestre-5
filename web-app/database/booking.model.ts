import { Schema, model, models, Document, Types, CallbackError } from 'mongoose';
import Event from './event.model';

/**
 * Booking interface representing events registration records
 * Includes comprehensive validation and referential integrity
 */
export interface IBooking extends Document {
    eventId: Types.ObjectId;
    email: string;
    fullName: string;
    status: 'confirmed' | 'cancelled' | 'waitlisted';
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Booking schema with email validation and events reference integrity
 * Prevents duplicate bookings and ensures data consistency
 */
const BookingSchema = new Schema<IBooking>(
    {
        eventId: {
            type: Schema.Types.ObjectId,
            ref: 'Event',
            required: [true, 'Event reference is required'],
            index: true, // Optimize events-based queries
        },
        email: {
            type: String,
            required: [true, 'Attendee email is required'],
            trim: true,
            lowercase: true,
            validate: {
                validator: (email: string) => {
                    // Comprehensive email validation regex
                    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                    return emailRegex.test(email);
                },
                message: 'Please provide a valid email address',
            },
        },
        fullName: {
            type: String,
            required: [true, 'Attendee full name is required'],
            trim: true,
            maxlength: [100, 'Full name cannot exceed 100 characters'],
        },
        status: {
            type: String,
            enum: {
                values: ['confirmed', 'cancelled', 'waitlisted'],
                message: 'Status must be confirmed, cancelled, or waitlisted',
            },
            default: 'confirmed',
            index: true, // Optimize status-based queries
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                // `ret` comes from Mongoose and has a non-optional `_id` type.
                // TypeScript disallows `delete ret._id` unless `_id` is optional,
                // so cast to `any` for the deletion while preserving runtime behavior.
                ret.id = String((ret as any)._id);
                delete (ret as any)._id;
                delete (ret as any).__v;
                return ret;
            },
        },
    }
);

/**
 * Pre-save middleware to validate events existence and prevent duplicates
 * Ensures referential integrity and business rules
 */
BookingSchema.pre('save', async function (next) {
    const booking = this as IBooking;

    try {
        // Validate that the referenced events exists
        const eventExists = await Event.findById(booking.eventId).select('_id capacity');
        if (!eventExists) {
            return next(new Error(`Event with ID ${booking.eventId} does not exist`));
        }

        // Check for duplicate booking (same events and email)
        if (booking.isNew || booking.isModified('email')) {
            const existingBooking = await Booking.findOne({
                eventId: booking.eventId,
                email: booking.email,
                _id: { $ne: booking._id }, // Exclude current document when updating
            });

            if (existingBooking) {
                return next(new Error('A booking with this email already exists for the events'));
            }
        }
    } catch (error: unknown) {
        // `error` is `unknown` in TypeScript catch clauses. Mongoose's `next`
        // expects a `CallbackError | undefined`. Cast here to satisfy the
        // compiler while preserving the original runtime behavior.
        return next(error as CallbackError | undefined);
    }

    next();
});

// Compound indexes for optimal query performance
BookingSchema.index({ eventId: 1, email: 1 }, { unique: true }); // Enforce unique bookings
BookingSchema.index({ email: 1, createdAt: -1 }); // User booking history
BookingSchema.index({ eventId: 1, status: 1 }); // Event attendance reports

const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;