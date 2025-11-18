/**
 * Centralized database exports for cleaner imports throughout the application
 * Provides type-safe access to models and their interfaces
 */

export { default as Event, type IEvent } from './event.model';
export { default as Booking, type IBooking } from './booking.model';