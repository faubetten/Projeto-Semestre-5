'use server';

/**
 * Server actions for event-related operations
 */

import { revalidatePath } from 'next/cache';
import Event from '@/database/event.model';
import connectDB from '@/lib/mongodb';
import parsePrompt from '@/lib/parsePrompt';
import recommendEventsCSP from '@/lib/recommend_csp';

/**
 * Fetches upcoming events with pagination and filtering support
 */
export async function getUpcomingEvents(
    page: number = 1,
    limit: number = 12,
    search?: string,
    mode?: string,
    tag?: string,
    sort?: string
) {
    try {
        await connectDB();

        const skip = (page - 1) * limit;
        const today = new Date().toISOString().split('T')[0];

        // Build query object
        const query: any = {
            date: { $gte: today },
        };

        // If a natural-language prompt was provided in `search`, parse it
        let parsed: any = {};
        if (search && search.trim() !== '') {
            // fetch known tags from DB to improve matching
            const knownTags = await getAllEventTags();
            parsed = await parsePrompt(search, { knownTags });

            // Use CSP recommender to return ranked recommendations when a prompt is provided.
            // This replaces the regular DB full-text search with the CSP-based IA recommender
            // so the UI will display IA recommendations in the same events grid.
            const recommended = await recommendEventsCSP(search, { limit: limit });

            return {
                events: JSON.parse(JSON.stringify(recommended || [])),
                totalPages: 1,
                currentPage: 1,
            };
        }

        // Add location filter
        if (parsed.location) {
            query.location = new RegExp(parsed.location, 'i');
        }

        // Add mode filter (parsed prompt overrides explicit mode param)
        const finalMode = parsed.mode || mode;
        if (finalMode && finalMode.trim() !== '') {
            query.mode = finalMode;
        }

        // Add tag filter (parsed prompt overrides explicit tag param)
        const finalTag = parsed.tag || tag;
        if (finalTag && finalTag.trim() !== '') {
            query.tags = { $in: [new RegExp(finalTag, 'i')] };
        }

        // Add date range if parsed
        if (parsed.dateFrom && parsed.dateTo) {
            query.date = { $gte: parsed.dateFrom, $lte: parsed.dateTo };
        }

        // Add search filter using parsed.search (only if parser produced a non-empty search)
        // If the parser set `parsed.all`, it means user asked for "all events" and
        // we should NOT apply a restrictive full-text search.
        if (!parsed.all && parsed.search && parsed.search.trim() !== '') {
            const searchRegex = new RegExp(parsed.search, 'i');
            query.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { tags: { $in: [searchRegex] } },
                { organizer: searchRegex },
                { location: searchRegex },
            ];
        }

        // Build sort object
        let sortOptions: any = { date: 1 }; // Default: soonest first

        if (sort) {
            switch (sort) {
                case 'date-desc':
                    sortOptions = { date: -1 }; // Latest first
                    break;
                case 'created':
                    sortOptions = { createdAt: -1 }; // Recently added
                    break;
                case 'popular':
                    // Assuming you have a attendees field or similar for popularity
                    sortOptions = { attendees: -1, date: 1 };
                    break;
                default:
                    sortOptions = { date: 1 }; // Soonest first
            }
        }

        // Get total count for pagination
        const total = await Event.countDocuments(query);

        // Fetch paginated events
        const events = await Event.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean();

        return {
            events: JSON.parse(JSON.stringify(events)),
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    } catch (error) {
        console.error('Error fetching upcoming events:', error);
        return { events: [], totalPages: 0, currentPage: page };
    }
}

/**
 * Fetches events similar to the specified event based on shared tags
 */
export async function getSimilarEventsBySlug(slug: string, limit: number = 3) {
    try {
        await connectDB();

        const referenceEvent = await Event.findOne({ slug }).select('tags');

        if (!referenceEvent) {
            console.warn(`Reference event not found for slug: ${slug}`);
            return [];
        }

        const similarEvents = await Event.find({
            _id: { $ne: referenceEvent._id },
            tags: { $in: referenceEvent.tags },
            date: { $gte: new Date().toISOString().split('T')[0] },
        })
            .sort({ date: 1, createdAt: -1 })
            .limit(limit)
            .lean();

        return JSON.parse(JSON.stringify(similarEvents));
    } catch (error) {
        console.error('Error fetching similar events:', error);
        return [];
    }
}

/**
 * Searches events by query string with tag and title matching
 */
export async function searchEvents(query: string, page: number = 1, limit: number = 12) {
    try {
        await connectDB();

        const skip = (page - 1) * limit;
        const searchRegex = new RegExp(query, 'i');

        const searchQuery = {
            $or: [
                { title: searchRegex },
                { description: searchRegex },
                { tags: { $in: [searchRegex] } },
                { organizer: searchRegex },
                { location: searchRegex },
            ],
        };

        const total = await Event.countDocuments(searchQuery);
        const events = await Event.find(searchQuery)
            .sort({ date: 1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        return {
            events: JSON.parse(JSON.stringify(events)),
            totalPages: Math.ceil(total / limit),
            currentPage: page,
        };
    } catch (error) {
        console.error('Error searching events:', error);
        return { events: [], totalPages: 0, currentPage: page };
    }
}

/**
 * Gets all unique tags from events for filtering
 */
export async function getAllEventTags() {
    try {
        await connectDB();

        const tags = await Event.distinct('tags');
        return JSON.parse(JSON.stringify(tags.filter(tag => tag && tag.trim() !== '')));
    } catch (error) {
        console.error('Error fetching event tags:', error);
        return [];
    }
}

/**
 * Gets event counts by mode for statistics
 */
export async function getEventStats() {
    try {
        await connectDB();

        const today = new Date().toISOString().split('T')[0];

        const [totalEvents, onlineEvents, offlineEvents, hybridEvents] = await Promise.all([
            Event.countDocuments({ date: { $gte: today } }),
            Event.countDocuments({ date: { $gte: today }, mode: 'online' }),
            Event.countDocuments({ date: { $gte: today }, mode: 'offline' }),
            Event.countDocuments({ date: { $gte: today }, mode: 'hybrid' }),
        ]);

        return {
            totalEvents,
            onlineEvents,
            offlineEvents,
            hybridEvents,
        };
    } catch (error) {
        console.error('Error fetching event stats:', error);
        return {
            totalEvents: 0,
            onlineEvents: 0,
            offlineEvents: 0,
            hybridEvents: 0,
        };
    }
}