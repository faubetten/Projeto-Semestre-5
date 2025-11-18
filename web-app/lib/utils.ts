/**
 * Utility functions for common operations throughout the application
 * Includes validation helpers, formatters, and utility functions
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names with Tailwind CSS conflict resolution
 * Uses clsx for conditional classes and tailwind-merge for conflict resolution
 * @param inputs - Class names or conditional class objects
 * @returns string - Merged and deduplicated class string
 */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

/**
 * Formats a date string into a human-readable format
 * @param dateString - ISO date string or Date object
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns string - Formatted date string
 */
export function formatDate(
    dateString: string | Date,
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }
): string {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

    // Validate date
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date provided');
    }

    return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Formats time string to 12-hour format with AM/PM
 * @param timeString - Time in HH:MM format (24-hour)
 * @returns string - Formatted time in 12-hour format
 */
export function formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':').map(Number);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error('Invalid time format');
    }

    const period = hours >= 12 ? 'PM' : 'AM';
    const twelveHour = hours % 12 || 12;

    return `${twelveHour}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Generates a URL-friendly slug from any string
 * @param text - Input text to convert to slug
 * @returns string - URL-friendly slug
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validates email format using comprehensive regex
 * @param email - Email address to validate
 * @returns boolean - True if email is valid
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
}

/**
 * Debounce function for limiting function execution frequency
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), wait);
    };
}

/**
 * Truncates text to specified length with ellipsis
 * @param text - Text to truncate
 * @param length - Maximum length before truncation
 * @returns string - Truncated text
 */
export function truncateText(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length).trim() + '...';
}

/**
 * Capitalizes the first letter of each word in a string
 * @param text - Text to capitalize
 * @returns string - Capitalized text
 */
export function capitalizeWords(text: string): string {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
}