import CreateEventForm from "@/components/CreateEventForm";
import { Metadata } from "next";

/**
 * Event creation page with comprehensive form and validation
 * Features multi-step form process and image upload
 */

export const metadata: Metadata = {
    title: "Create Event | confAI",
    description: "Create and organize amazing developer events on confAI. Reach thousands of developers worldwide.",
};

export default function CreateEventPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-dark-100 via-dark-200 to-dark-300 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Create Your <span className="text-primary-400">Event</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Share your event with thousands of developers worldwide. Fill in the details below to get started.
                    </p>
                </div>

                {/* Event Creation Form */}
                <CreateEventForm />
            </div>
        </div>
    );
}