import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import { IEvent } from "@/database";
import { getUpcomingEvents } from "@/lib/actions/event.actions";
import Link from "next/link";
import {
    CalendarIcon,
    ChevronRightIcon,
    StarIcon,
    UserPlusIcon,
    GlobeAltIcon,
} from "@heroicons/react/24/outline";

/**
 * Homepage component featuring hero section, events discovery, and featured events
 * Implements modern design with gradient effects and responsive layout
 */

export default async function HomePage() {
    // Fetch upcoming events with server-side rendering
    const { events, totalPages } = await getUpcomingEvents(1, 6);

    return (
        <div className="space-y-20">
            {/* Hero Section */}
            <section className="text-center space-y-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                {/* Animated Badge */}
                <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10 animate-pulse-slow">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
                    <span className="text-sm text-gray-300 font-medium">
            Discover Amazing Events
          </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-white to-gray-50 bg-clip-text text-transparent">
                        Where Developers
                    </span>
                    <br />
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Connect & Grow
                    </span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                    Discover meetups and conferences that fuel your passion
                    for technology. Join thousands of developers shaping the future.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                    <ExploreBtn />

                    <Link
                        href="/create-event"
                        className="group relative overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-8 py-4 text-white font-semibold hover:bg-white/10 transition-all duration-300"
                    >
                        <span className="relative z-10">Create Your Event</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    </Link>
                </div>
            </section>

            {/* Featured Events Section */}
            <section id="events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Upcoming <span className="text-primary-400">Events</span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Curated selection of must-attend developer events from around the
                        world
                    </p>
                </div>

                {/* Events Grid */}
                {events && events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event: IEvent) => (
                            <EventCard
                                key={event._id.toString()}
                                {...event}
                                id={event._id.toString()}
                            />
                        ))}
                    </div>
                ) : (
                    // Empty State
                    <div className="text-center py-16">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CalendarIcon className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            No Upcoming Events
                        </h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Check back soon for new events or be the first to create one!
                        </p>
                    </div>
                )}

                {/* View All Events Link */}
                {events && events.length > 0 && (
                    <div className="text-center mt-12">
                        <Link
                            href="/events"
                            className="group inline-flex items-center space-x-2 text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                        >
                            <span>View All Events</span>
                            <ChevronRightIcon className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Why Choose <span className="text-accent-400">confAI</span>
                    </h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Everything you need to discover, organize, and connect at developer
                        events
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: StarIcon,
                            title: "Curated Events",
                            description:
                                "Hand-picked selection of high-quality developer events from around the world.",
                        },
                        {
                            icon: UserPlusIcon,
                            title: "Easy Registration",
                            description:
                                "Simple and secure registration process with instant confirmation.",
                        },
                        {
                            icon: GlobeAltIcon,
                            title: "Global Community",
                            description:
                                "Connect with developers worldwide and expand your professional network.",
                        },
                    ].map((feature, index) => {
                        const IconComponent = feature.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-primary-500/30 transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <IconComponent className="w-8 h-8 text-primary-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}