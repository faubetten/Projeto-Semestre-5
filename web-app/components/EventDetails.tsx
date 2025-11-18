import React from 'react'
import { notFound } from "next/navigation";
import { IEvent } from "@/database";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { formatDate, formatTime, cn } from "@/lib/utils";
import { EVENT_MODES } from "@/lib/constants";

/**
 * Event details page component with comprehensive events information
 * Features responsive layout, similar events recommendations, and booking functionality
 */

// Reusable detail item component for consistent styling
const EventDetailItem = ({
                             icon,
                             alt,
                             label,
                             value
                         }: {
    icon: string;
    alt: string;
    label: string;
    value: string;
}) => (
    <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
        <div className="flex items-center justify-center w-8 h-8 bg-primary-500/20 rounded-lg">
            <Image src={icon} alt={alt} width={16} height={16} className="text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-400 font-medium">{label}</p>
            <p className="text-white font-medium truncate">{value}</p>
        </div>
    </div>
);

// Agenda component for structured events timeline
const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white mb-4">Event Agenda</h2>
        <div className="space-y-3">
            {agendaItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-center w-6 h-6 bg-primary-500 rounded-full text-xs font-bold text-white mt-0.5 flex-shrink-0">
                        {index + 1}
                    </div>
                    <p className="text-gray-300 leading-relaxed">{item}</p>
                </div>
            ))}
        </div>
    </div>
);

// Tags component for events categorization
const EventTags = ({ tags }: { tags: string[] }) => (
    <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">Tags & Topics</h3>
        <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
                <span
                    key={tag}
                    className="px-3 py-1.5 bg-primary-500/20 text-primary-300 rounded-full text-sm font-medium backdrop-blur-sm border border-primary-500/30"
                >
          {tag}
        </span>
            ))}
        </div>
    </div>
);

// Main events details component
const EventDetails = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;

    let event: IEvent | null = null;

    try {
        // Fetch events data from API
        const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
        const response = await fetch(`${BASE_URL}/api/events/${slug}`, {
            next: {
                revalidate: 60, // Revalidate every minute
                tags: [`event-${slug}`] // For on-demand revalidation
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return notFound();
            }
            throw new Error(`Failed to fetch event: ${response.statusText}`);
        }

        const data = await response.json();
        event = data.event;

        if (!event) {
            return notFound();
        }
    } catch (error) {
        console.error('Error fetching events details:', error);
        return notFound();
    }

    // Extract events properties with fallbacks
    const {
        title,
        description,
        image,
        overview,
        date,
        time,
        location,
        mode,
        agenda,
        audience,
        tags,
        organizer,
        venue,
        capacity,
        price,
        registrationUrl,
        _id: eventId
    } = event;

    const modeConfig = EVENT_MODES[mode as keyof typeof EVENT_MODES] || EVENT_MODES.offline;

    // Fetch similar events for recommendations
    const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug, 3);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Section */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center space-x-2 bg-white/5 rounded-full px-4 py-2 mb-4 border border-white/10">
                    <span className="text-sm text-primary-400 font-medium">{modeConfig.icon} {modeConfig.label}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {title}
                </h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                    {description}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content - 2/3 width on large screens */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Event Banner */}
                    <div className="relative aspect-[21/9] rounded-2xl overflow-hidden">
                        <Image
                            src={image}
                            alt={title}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 1024px) 100vw, 66vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>

                    {/* Overview Section */}
                    <section className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
                        <p className="text-gray-300 leading-relaxed text-lg">{overview}</p>
                    </section>

                    {/* Event Details Grid */}
                    <section className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-6">Event Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <EventDetailItem
                                icon="/icons/calendar.svg"
                                alt="Date"
                                label="Date"
                                value={formatDate(date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            />
                            <EventDetailItem
                                icon="/icons/clock.svg"
                                alt="Time"
                                label="Time"
                                value={formatTime(time)}
                            />
                            <EventDetailItem
                                icon="/icons/pin.svg"
                                alt="Venue"
                                label="Venue"
                                value={venue}
                            />
                            <EventDetailItem
                                icon="/icons/location.svg"
                                alt="Location"
                                label="Location"
                                value={location}
                            />
                            <EventDetailItem
                                icon="/icons/audience.svg"
                                alt="Audience"
                                label="Audience"
                                value={audience}
                            />
                            {capacity && (
                                <EventDetailItem
                                    icon="/icons/users.svg"
                                    alt="Capacity"
                                    label="Capacity"
                                    value={`${capacity} attendees`}
                                />
                            )}
                        </div>
                    </section>

                    {/* Agenda Section */}
                    {agenda && agenda.length > 0 && (
                        <section className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                            <EventAgenda agendaItems={agenda} />
                        </section>
                    )}

                    {/* Organizer Section */}
                    <section className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-4">About the Organizer</h2>
                        <p className="text-gray-300 leading-relaxed">{organizer}</p>
                    </section>

                    {/* Tags Section */}
                    {tags && tags.length > 0 && (
                        <section className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                            <EventTags tags={tags} />
                        </section>
                    )}
                </div>

                {/* Sidebar - Booking Section */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-gradient-to-br from-dark-200 to-dark-300 rounded-2xl p-6 border border-white/10 shadow-glow">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Register Now</h2>
                            <p className="text-gray-400">
                                Secure your spot at this exciting event
                            </p>
                        </div>

                        {/* Price Display */}
                        {price !== undefined && price > 0 && (
                            <div className="text-center mb-6">
                                <span className="text-3xl font-bold text-white">${price}</span>
                                <span className="text-gray-400 ml-2">per ticket</span>
                            </div>
                        )}

                        {/* External Registration Link */}
                        {registrationUrl ? (
                            <a
                                href={registrationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-glow transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                                <span>Register on External Site</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        ) : (
                            // Internal Booking Form
                            <BookEvent
                                eventId={eventId.toString()}
                                slug={slug}
                                eventTitle={title}
                                capacity={capacity}
                            />
                        )}

                        {/* Additional Info */}
                        <div className="mt-6 space-y-3 text-sm text-gray-400">
                            <div className="flex items-center justify-between">
                                <span>Mode</span>
                                <span className="text-white font-medium">{modeConfig.label}</span>
                            </div>
                            {capacity && (
                                <div className="flex items-center justify-between">
                                    <span>Capacity</span>
                                    <span className="text-white font-medium">{capacity} spots</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Events Section */}
            {similarEvents.length > 0 && (
                <section className="mt-16">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Similar Events</h2>
                        <p className="text-gray-400">You might also be interested in these events</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {similarEvents.map((similarEvent) => (
                            <EventCard
                                key={similarEvent._id.toString()}
                                {...similarEvent}
                                id={similarEvent._id.toString()}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default EventDetails;