import Link from "next/link";
import Image from "next/image";
import { formatDate, formatTime } from "@/lib/utils";

interface EventCardProps {
    id: string;
    title: string;
    image?: string;
    slug: string;
    description?: string;
    overview?: string;
    venue?: string;
    location?: string;
    date?: string;
    time?: string;
    mode?: 'online' | 'offline' | 'hybrid';
    tags?: string[];
    className?: string;
    view?: 'grid' | 'list';
}


const EventCard = ({
                    id,
                    title,
                    image,
                    slug,
                    location,
                    date,
                    time,
                    mode,
                    tags,
                    className
                }: EventCardProps) => {
                    const modeKey: 'online' | 'offline' | 'hybrid' = mode ?? 'offline';
                    const modeConfigMap = {
                        online: { label: 'Online', icon: '🌐' },
                        offline: { label: 'In-Person', icon: '📍' },
                        hybrid: { label: 'Hybrid', icon: '🔀' },
                    } as const;
                    const modeConfig = modeConfigMap[modeKey];

                    const displayDate = date ? formatDate(date, { month: 'short', day: 'numeric' }) : 'TBA';
                    const displayTime = time ? formatTime(time) : 'TBA';
                    const imageSrc = image ?? '/images/default-event.jpg';

    return (
        <Link
            href={`/events/${slug}`}
            className={`group block bg-white/5 rounded-xl border border-white/10 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] backdrop-blur-sm ${className}`}
        >
            {/* Event Image */}
            <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                    src={imageSrc}
                    alt={title ?? 'Event image'}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Mode Badge */}
                <div className="absolute top-3 left-3 flex items-center space-x-1 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white">
                    <span>{modeConfig.icon}</span>
                    <span>{modeConfig.label}</span>
                </div>

                {/* Tags */}
                {tags && tags.length > 0 && (
                    <div className="absolute top-3 right-3 flex flex-wrap justify-end gap-1 max-w-[60%]">
                        {tags.slice(0, 2).map((tag) => (
                            <span
                                key={tag}
                                className="bg-blue-500/20 text-blue-200 rounded-full px-2 py-1 text-xs backdrop-blur-sm"
                            >
                {tag}
              </span>
                        ))}
                        {tags.length > 2 && (
                            <span className="bg-black/60 text-white rounded-full px-2 py-1 text-xs backdrop-blur-sm">
                +{tags.length - 2}
              </span>
                        )}
                    </div>
                )}
            </div>

            {/* Event Content */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <h3 className="font-semibold text-white line-clamp-2 group-hover:text-blue-300 transition-colors">
                    {title}
                </h3>

                {/* Location */}
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-1">{location}</span>
                </div>

                {/* Date and Time */}
                <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{displayDate}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{displayTime}</span>
                    </div>
                </div>

                {/* CTA Indicator */}
                <div className="pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs text-blue-400">
                        <span>View details</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default EventCard;