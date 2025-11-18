import { Suspense } from "react";
import EventDetails from "@/components/EventDetails";
import { Metadata } from "next";

/**
 * Dynamic events detail page with SSR and metadata generation
 * Features loading states and SEO optimization
 */

type Props = {
    params: Promise<{ slug: string }>;
};

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    try {
        const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
        const response = await fetch(`${BASE_URL}/api/events/${slug}`, {
            next: { revalidate: 3600 } // Revalidate every hour
        });

        if (!response.ok) {
            return {
                title: 'Event Not Found',
                description: 'The requested events could not be found.',
            };
        }

        const { event } = await response.json();

        return {
            title: `${event.title} | confAI`,
            description: event.overview || event.description,
            openGraph: {
                title: event.title,
                description: event.overview || event.description,
                images: [event.image],
                type: 'article',
                publishedTime: event.createdAt,
            },
            twitter: {
                card: 'summary_large_image',
                title: event.title,
                description: event.overview || event.description,
                images: [event.image],
            },
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Event Details',
            description: 'View events details on confAI',
        };
    }
}

// Generate static paths for better performance (optional)
export async function generateStaticParams() {
    // In a real application, you might fetch popular events for static generation
    return []; // Let Next.js handle dynamic rendering
}

export default async function EventDetailsPage({ params }: Props) {
    return (
        <Suspense fallback={<EventDetailsLoading />}>
            <EventDetails params={params} />
        </Suspense>
    );
}

// Loading component for better UX
function EventDetailsLoading() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
                {/* Header Skeleton */}
                <div className="text-center mb-12">
                    <div className="h-8 bg-white/10 rounded-full w-32 mx-auto mb-4"></div>
                    <div className="h-12 bg-white/10 rounded-lg w-3/4 mx-auto mb-4"></div>
                    <div className="h-6 bg-white/10 rounded-lg w-1/2 mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Skeleton */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="aspect-[21/9] bg-white/10 rounded-2xl"></div>

                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white/5 rounded-2xl p-6 space-y-4">
                                <div className="h-6 bg-white/10 rounded-lg w-1/3"></div>
                                <div className="h-4 bg-white/10 rounded-lg w-full"></div>
                                <div className="h-4 bg-white/10 rounded-lg w-2/3"></div>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/5 rounded-2xl p-6 space-y-6">
                            <div className="h-8 bg-white/10 rounded-lg w-1/2 mx-auto"></div>
                            <div className="h-4 bg-white/10 rounded-lg w-3/4 mx-auto"></div>

                            {[1, 2, 3].map((i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-4 bg-white/10 rounded-lg w-1/3"></div>
                                    <div className="h-10 bg-white/10 rounded-lg"></div>
                                </div>
                            ))}

                            <div className="h-12 bg-white/10 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}