/**
 * Application constants and configuration values
 * Centralizes magic numbers, default values, and static data
 */

/**
 * Event-related constants and default values
 */
export const EVENT_CONSTANTS = {
    MAX_TITLE_LENGTH: 120,
    MAX_DESCRIPTION_LENGTH: 2000,
    MAX_OVERVIEW_LENGTH: 500,
    MAX_AGENDA_ITEMS: 20,
    MAX_TAGS: 10,
    DEFAULT_PAGE_SIZE: 12,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

/**
 * Event modes with display labels and icons
 */
export const EVENT_MODES = {
    online: { label: 'Online', icon: '🌐' },
    offline: { label: 'In-Person', icon: '📍' },
    hybrid: { label: 'Hybrid', icon: '🔀' },
} as const;

/**
 * Common events tags for categorization
 */
export const EVENT_TAGS = [
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'Python',
    'Machine Learning',
    'AI',
    'Web Development',
    'Mobile Development',
    'DevOps',
    'Cloud Computing',
    'Open Source',
    'Startup',
    'Career',
    'Networking',
    'Workshop',
    'Conference',
    'Hackathon',
    'Meetup',
] as const;

/**
 * Date formatting options for consistent display
 */
export const DATE_FORMATS = {
    DISPLAY: { year: 'numeric', month: 'long', day: 'numeric' },
    SHORT: { year: 'numeric', month: 'short', day: 'numeric' },
    TIME: { hour: '2-digit', minute: '2-digit' },
} as const;

/**
 * API response messages for consistency
 */
export const API_MESSAGES = {
    SUCCESS: {
        EVENT_CREATED: 'Event created successfully',
        EVENT_UPDATED: 'Event updated successfully',
        EVENT_DELETED: 'Event deleted successfully',
        BOOKING_CREATED: 'Booking confirmed successfully',
        BOOKING_CANCELLED: 'Booking cancelled successfully',
    },
    ERROR: {
        NOT_FOUND: 'Resource not found',
        UNAUTHORIZED: 'Unauthorized access',
        VALIDATION_ERROR: 'Validation failed',
        SERVER_ERROR: 'Internal server error',
        DUPLICATE_BOOKING: 'Already registered for this events',
        EVENT_FULL: 'Event is at full capacity',
    },
} as const;

/**
 * Default values for new events creation
 */
export const DEFAULT_EVENT_VALUES = {
    mode: 'offline' as const,
    price: 0,
    capacity: 100,
    tags: ['Networking'],
} as const;

export default {
    EVENT_CONSTANTS,
    EVENT_MODES,
    EVENT_TAGS,
    DATE_FORMATS,
    API_MESSAGES,
    DEFAULT_EVENT_VALUES,
};