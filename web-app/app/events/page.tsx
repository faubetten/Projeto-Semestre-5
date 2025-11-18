import EventCard from "@/components/EventCard";
import { IEvent } from "@/database";
import { getUpcomingEvents } from "@/lib/actions/event.actions";
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    Squares2X2Icon,
    ListBulletIcon,
    GlobeAltIcon,
    MapPinIcon,
    ArrowsRightLeftIcon,
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import PromptSearch from '@/components/PromptSearch';

/**
 * Mobile-optimized events listing page with filtering, search, and grid/list views
 * Displays all events with pagination and filtering options
 */

interface EventsPageProps {
    searchParams: {
        page?: string;
        search?: string;
        mode?: string;
        tag?: string;
        view?: "grid" | "list";
        sort?: string;
    };
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
    const page = parseInt(searchParams.page || "1");
    const search = searchParams.search || "";
    const mode = searchParams.mode || "";
    const tag = searchParams.tag || "";
    const view = searchParams.view || "grid";
    const sort = searchParams.sort || "date";

    // Fetch events with filters
    const { events, totalPages, currentPage } = await getUpcomingEvents(
        page,
        12,
        search,
        mode,
        tag,
        sort
    );

    // Available filters
    const eventModes = [
        {
            value: "online",
            label: "Online",
            icon: GlobeAltIcon,
            color: "text-blue-400",
        },
        {
            value: "offline",
            label: "In-Person",
            icon: MapPinIcon,
            color: "text-green-400",
        },
        {
            value: "hybrid",
            label: "Hybrid",
            icon: ArrowsRightLeftIcon,
            color: "text-purple-400",
        },
    ];

    const popularTags = [
        "JavaScript",
        "Next.js",
        "Machine Learning",
        "Python",
        "AI",
        "Web Development",
        "Startup",
        "Networking",
    ];

    const sortOptions = [
        { value: "date", label: "Date (Soonest)" },
        { value: "date-desc", label: "Date (Latest)" },
        { value: "created", label: "Recently Added" },
        { value: "popular", label: "Most Popular" },
    ];

    // Build URL with updated search params
    const buildURL = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams();

        // Add existing params
        if (search) params.set("search", search);
        if (mode) params.set("mode", mode);
        if (tag) params.set("tag", tag);
        if (view) params.set("view", view);
        if (sort && sort !== "date") params.set("sort", sort);

        // Apply updates
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        const queryString = params.toString();
        return `/events${queryString ? `?${queryString}` : ""}`;
    };

    const hasActiveFilters = search || mode || tag;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                {/* Enhanced Header */}
                <div className="text-center mb-6 sm:mb-12">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
                        Discover <span className="text-blue-400">Events</span>
                    </h1>
                    <p className="text-sm sm:text-base md:text-xl text-gray-300 max-w-2xl mx-auto">
                        Find developer events, hackathons, meetups, and conferences
                    </p>
                </div>

                {/* Enhanced Search and Filters Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 mb-6 sm:mb-8">
                    {/* Search and Controls Row */}
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                        {/* Search Form (client-side recommender) */}
                        <div className="flex-1">
                            <div className="relative">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                                <PromptSearch defaultValue={search} />
                            </div>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center gap-2">
                            <Link
                                href={buildURL({ view: "grid" })}
                                className={`p-2 rounded-lg border transition-all ${
                                    view === "grid"
                                        ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25"
                                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                                }`}
                            >
                                <Squares2X2Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Link>
                            <Link
                                href={buildURL({ view: "list" })}
                                className={`p-2 rounded-lg border transition-all ${
                                    view === "list"
                                        ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25"
                                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                                }`}
                            >
                                <ListBulletIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </Link>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {search && (
                                <div className="flex items-center gap-1 bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1 text-sm text-blue-300">
                                    <span>Search: "{search}"</span>
                                    <Link
                                        href={buildURL({ search: null })}
                                        className="hover:text-white transition-colors"
                                    >
                                        <XMarkIcon className="w-3 h-3" />
                                    </Link>
                                </div>
                            )}
                            {mode && (
                                <div className="flex items-center gap-1 bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1 text-sm text-green-300">
                                    <span>Mode: {eventModes.find(m => m.value === mode)?.label}</span>
                                    <Link
                                        href={buildURL({ mode: null })}
                                        className="hover:text-white transition-colors"
                                    >
                                        <XMarkIcon className="w-3 h-3" />
                                    </Link>
                                </div>
                            )}
                            {tag && (
                                <div className="flex items-center gap-1 bg-purple-500/20 border border-purple-500/30 rounded-full px-3 py-1 text-sm text-purple-300">
                                    <span>Tag: {tag}</span>
                                    <Link
                                        href={buildURL({ tag: null })}
                                        className="hover:text-white transition-colors"
                                    >
                                        <XMarkIcon className="w-3 h-3" />
                                    </Link>
                                </div>
                            )}
                            <Link
                                href="/events"
                                className="flex items-center gap-1 bg-gray-500/20 border border-gray-500/30 rounded-full px-3 py-1 text-sm text-gray-300 hover:text-white transition-colors"
                            >
                                <XMarkIcon className="w-3 h-3" />
                                Clear All
                            </Link>
                        </div>
                    )}

                    {/* Filter Chips */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        {/* Mode Filters */}
                        <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1 text-xs text-gray-400 font-medium whitespace-nowrap">
                <FunnelIcon className="w-3 h-3" />
                Mode:
              </span>
                            {eventModes.map((modeItem) => {
                                const IconComponent = modeItem.icon;
                                return (
                                    <Link
                                        key={modeItem.value}
                                        href={
                                            mode === modeItem.value
                                                ? buildURL({ mode: null })
                                                : buildURL({ mode: modeItem.value, page: null })
                                        }
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all whitespace-nowrap ${
                                            mode === modeItem.value
                                                ? `bg-green-500/20 border-green-500 text-green-300`
                                                : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                                        }`}
                                    >
                                        <IconComponent className={`w-3 h-3 ${modeItem.color}`} />
                                        <span>{modeItem.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Popular Tags */}
                        <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-400 font-medium whitespace-nowrap mt-1.5">
                Tags:
              </span>
                            {popularTags.map((tagItem) => (
                                <Link
                                    key={tagItem}
                                    href={
                                        tag === tagItem
                                            ? buildURL({ tag: null })
                                            : buildURL({ tag: tagItem, page: null })
                                    }
                                    className={`px-2 py-1 rounded-full border text-xs font-medium transition-all whitespace-nowrap ${
                                        tag === tagItem
                                            ? "bg-purple-500/20 border-purple-500 text-purple-300"
                                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                                    }`}
                                >
                                    {tagItem}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Events Grid */}
                <div className="mb-8 sm:mb-12">
                    {events.length > 0 ? (
                        <>
                            {/* Results Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
                                <p className="text-gray-400 text-sm sm:text-base">
                                    Showing <span className="text-white font-semibold">{events.length}</span>{" "}
                                    events
                                    {search && (
                                        <span>
                      {" "}
                                            for "<span className="text-blue-300">{search}</span>"
                    </span>
                                    )}
                                </p>

                                {/* Sort Dropdown - Using form submission instead of onChange */}
                                <form action={buildURL({ page: null })} method="GET" className="flex items-center gap-2 text-gray-400 text-sm">
                                    <FunnelIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span>Sort by: </span>
                                    <select
                                        name="sort"
                                        defaultValue={sort}
                                        className="bg-white/5 border border-white/10 rounded-lg px-2 sm:px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm cursor-pointer"
                                    >
                                        {sortOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    {/* Hidden fields to preserve other params */}
                                    <input type="hidden" name="search" value={search} />
                                    <input type="hidden" name="mode" value={mode} />
                                    <input type="hidden" name="tag" value={tag} />
                                    <input type="hidden" name="view" value={view} />
                                    {/* Submit button that's hidden but allows form submission on select change */}
                                    <button type="submit" className="hidden">Apply Sort</button>
                                </form>
                            </div>

                            {/* Events Grid/List View */}
                            <div
                                className={
                                    view === "grid"
                                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                                        : "grid grid-cols-1 gap-4 sm:gap-6"
                                }
                            >
                                {events.map((event: IEvent) => (
                                    <EventCard
                                        key={event._id.toString()}
                                        {...event}
                                        id={event._id.toString()}
                                        view={view}
                                    />
                                ))}
                            </div>

                            {/* Enhanced Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2 mt-8 sm:mt-12">
                                    <Link
                                        href={buildURL({ page: (currentPage - 1).toString() })}
                                        className={`flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto justify-center ${
                                            currentPage === 1
                                                ? "opacity-50 cursor-not-allowed text-gray-500"
                                                : "text-gray-400 hover:bg-white/10 hover:text-white"
                                        }`}
                                        aria-disabled={currentPage === 1}
                                        tabIndex={currentPage === 1 ? -1 : undefined}
                                    >
                                        <ChevronLeftIcon className="w-4 h-4" />
                                        Previous
                                    </Link>

                                    <div className="flex items-center gap-1 order-first sm:order-none">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const pageNum = i + 1;
                                            return (
                                                <Link
                                                    key={pageNum}
                                                    href={buildURL({ page: pageNum.toString() })}
                                                    className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg border font-medium transition-all text-sm ${
                                                        currentPage === pageNum
                                                            ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25"
                                                            : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                                                    }`}
                                                >
                                                    {pageNum}
                                                </Link>
                                            );
                                        })}

                                        {totalPages > 5 && (
                                            <>
                                                <span className="text-gray-400 text-sm mx-1">...</span>
                                                <Link
                                                    href={buildURL({ page: totalPages.toString() })}
                                                    className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white transition-colors text-sm"
                                                >
                                                    {totalPages}
                                                </Link>
                                            </>
                                        )}
                                    </div>

                                    <Link
                                        href={buildURL({ page: (currentPage + 1).toString() })}
                                        className={`flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg transition-colors text-sm sm:text-base w-full sm:w-auto justify-center ${
                                            currentPage === totalPages
                                                ? "opacity-50 cursor-not-allowed text-gray-500"
                                                : "text-gray-400 hover:bg-white/10 hover:text-white"
                                        }`}
                                        aria-disabled={currentPage === totalPages}
                                        tabIndex={currentPage === totalPages ? -1 : undefined}
                                    >
                                        Next
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}
                        </>
                    ) : (
                        // Enhanced Empty State
                        <div className="text-center py-8 sm:py-16">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                                <CalendarIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                                No Events Found
                            </h3>
                            <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto mb-6 sm:mb-8">
                                {hasActiveFilters
                                    ? "Try adjusting your search filters to find more events."
                                    : "There are no upcoming events at the moment. Check back soon!"}
                            </p>
                            {hasActiveFilters && (
                                <Link
                                    href="/events"
                                    className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold text-sm sm:text-base"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                    Clear Filters
                                </Link>
                            )}
                        </div>
                    )}
                </div>

                {/* Enhanced Call to Action */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
                    <div className="relative">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                            Ready to Host Your Own Event?
                        </h2>
                        <p className="text-blue-100 text-sm sm:text-base mb-4 sm:mb-6 max-w-2xl mx-auto">
                            Share your knowledge and connect with the developer community. Create
                            engaging events that inspire and educate.
                        </p>
                        <Link
                            href="/create-event"
                            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base shadow-lg"
                        >
                            <span>Create Event</span>
                            <ChevronRightIcon className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}