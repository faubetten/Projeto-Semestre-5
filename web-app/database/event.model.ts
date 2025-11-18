import { Schema, model, models, Document, Types } from 'mongoose';

/**
 * Event interface representing the structure of an events document
 * Includes comprehensive validation and type safety
 */
export interface IEvent extends Document {
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: 'online' | 'offline' | 'hybrid';
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    creatorId?: string;
    price?: number;
    capacity?: number;
    registrationUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Event Data interface for use in React components
 * Separated from Mongoose Document to avoid type conflicts
 */
export interface EventData {
    id: string;
    title: string;
    slug: string;
    description: string;
    overview: string;
    image: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: 'online' | 'offline' | 'hybrid';
    audience: string;
    agenda: string[];
    organizer: string;
    tags: string[];
    creatorId?: string;
    price?: number;
    capacity?: number;
    registrationUrl?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Event schema with comprehensive validation and indexing
 * Includes pre-save hooks for data normalization and slug generation
 */
const EventSchema = new Schema<IEvent>(
    {
        title: {
            type: String,
            required: [true, 'Event title is required'],
            trim: true,
            maxlength: [120, 'Title cannot exceed 120 characters'],
            index: 'text', // Enable text search on title
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            index: true, // Optimize slug-based queries
        },
        description: {
            type: String,
            required: [true, 'Event description is required'],
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        overview: {
            type: String,
            required: [true, 'Event overview is required'],
            trim: true,
            maxlength: [500, 'Overview cannot exceed 500 characters'],
        },
        image: {
            type: String,
            required: [true, 'Event image is required'],
            validate: {
                validator: (url: string) => {
                    // Basic URL validation
                    try {
                        new URL(url);
                        return true;
                    } catch {
                        return false;
                    }
                },
                message: 'Invalid image URL format',
            },
        },
        venue: {
            type: String,
            required: [true, 'Venue name is required'],
            trim: true,
            maxlength: [100, 'Venue name cannot exceed 100 characters'],
        },
        location: {
            type: String,
            required: [true, 'Event location is required'],
            trim: true,
            maxlength: [200, 'Location cannot exceed 200 characters'],
        },
        date: {
            type: String,
            required: [true, 'Event date is required'],
            validate: {
                validator: (date: string) => {
                    // Validate date format (YYYY-MM-DD)
                    const regex = /^\d{4}-\d{2}-\d{2}$/;
                    return regex.test(date) && !isNaN(new Date(date).getTime());
                },
                message: 'Date must be in YYYY-MM-DD format',
            },
        },
        time: {
            type: String,
            required: [true, 'Event time is required'],
            validate: {
                validator: (time: string) => {
                    // Validate time format (HH:MM in 24-hour format)
                    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
                    return regex.test(time);
                },
                message: 'Time must be in HH:MM format (24-hour)',
            },
        },
        mode: {
            type: String,
            required: [true, 'Event mode is required'],
            enum: {
                values: ['online', 'offline', 'hybrid'],
                message: 'Event mode must be online, offline, or hybrid',
            },
            index: true, // Optimize filtering by mode
        },
        audience: {
            type: String,
            required: [true, 'Target audience is required'],
            trim: true,
            maxlength: [100, 'Audience description cannot exceed 100 characters'],
        },
        agenda: {
            type: [String],
            required: [true, 'Event agenda is required'],
            validate: {
                validator: (agenda: string[]) => agenda.length > 0,
                message: 'At least one agenda item is required',
            },
        },
        organizer: {
            type: String,
            required: [true, 'Organizer name is required'],
            trim: true,
            maxlength: [100, 'Organizer name cannot exceed 100 characters'],
        },
        tags: {
            type: [String],
            required: [true, 'Event tags are required'],
            validate: {
                validator: (tags: string[]) => tags.length > 0,
                message: 'At least one tag is required',
            },
            index: true, // Optimize tag-based filtering
        },
        price: {
            type: Number,
            min: [0, 'Price cannot be negative'],
            default: 0,
        },
        capacity: {
            type: Number,
            min: [1, 'Capacity must be at least 1'],
        },
        registrationUrl: {
            type: String,
            validate: {
                validator: (url: string) => {
                    if (!url) return true; // Optional field
                    try {
                        new URL(url);
                        return true;
                    } catch {
                        return false;
                    }
                },
                message: 'Invalid registration URL format',
            },
        },
        // Optional: store the ID of the user who created the event (Clerk user id)
        creatorId: {
            type: String,
            required: false,
            index: true,
        },
    },
    {
        timestamps: true, // Auto-manage createdAt and updatedAt
        toJSON: {
            transform: (doc, ret) => {
                // Correção: Use type assertion para any para evitar erros de tipo
                const retAny = ret as any;
                retAny.id = retAny._id.toString();
                delete retAny._id;
                delete retAny.__v;
                return retAny;
            },
        },
    }
);

/**
 * Pre-save middleware for automatic slug generation and data validation
 * Ensures consistent data formatting before saving to database
 */
EventSchema.pre('save', function (next) {
    const event = this as IEvent;

    // Generate slug from title if not provided or title changed
    if (event.isModified('title') || !event.slug) {
        event.slug = generateSlug(event.title);
    }

    // Validate that date is not in the past - CORRIGIDO
    if (event.isModified('date')) {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zera horas para comparar apenas datas
        
        if (eventDate < today) {
            return next(new Error('Event date cannot be in the past'));
        }
    }

    next();
});

/**
 * Static method to find events by tag with pagination
 */
EventSchema.statics.findByTag = function (tag: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return this.find({ tags: { $in: [tag] } })
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit);
};

/**
 * Helper function to generate URL-friendly slugs
 * Converts title to lowercase, replaces spaces with hyphens, removes special chars
 */
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Collapse multiple hyphens
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Utility function to convert Mongoose document to EventData
 * Solves the type compatibility issues with React components
 */
export const toEventData = (doc: IEvent): EventData => ({
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    overview: doc.overview,
    image: doc.image,
    venue: doc.venue,
    location: doc.location,
    date: doc.date,
    time: doc.time,
    mode: doc.mode,
    audience: doc.audience,
    agenda: [...doc.agenda], // Creates mutable array copy
    organizer: doc.organizer,
    tags: [...doc.tags], // Creates mutable array copy
    creatorId: doc.creatorId,
    price: doc.price,
    capacity: doc.capacity,
    registrationUrl: doc.registrationUrl,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
});

/**
 * Utility function to convert lean Mongoose document to EventData
 */
export const toEventDataFromLean = (doc: any): EventData => ({
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    overview: doc.overview,
    image: doc.image,
    venue: doc.venue,
    location: doc.location,
    date: doc.date,
    time: doc.time,
    mode: doc.mode,
    audience: doc.audience,
    agenda: [...doc.agenda], // Creates mutable array copy
    organizer: doc.organizer,
    tags: [...doc.tags], // Creates mutable array copy
    creatorId: doc.creatorId,
    price: doc.price,
    capacity: doc.capacity,
    registrationUrl: doc.registrationUrl,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
});

// Compound indexes for common query patterns
EventSchema.index({ date: 1, mode: 1 }); // For filtering events by date and mode
EventSchema.index({ tags: 1, date: 1 }); // For tag-based filtering with date sorting
EventSchema.index({ createdAt: -1 }); // For getting latest events

const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;