'use client';

import { useState } from "react";
import { createBooking } from "@/lib/actions/booking.actions";
import { isValidEmail } from "@/lib/utils";

/**
 * Booking form component with real-time validation and submission handling
 * Features loading states, error handling, and success feedback
 */

interface BookEventProps {
    eventId: string;
    slug: string;
    eventTitle: string;
    capacity?: number;
}

const BookEvent = ({ eventId, slug, eventTitle, capacity }: BookEventProps) => {
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        // Client-side validation
        if (!formData.email || !formData.fullName) {
            setError('Please fill in all required fields');
            setIsSubmitting(false);
            return;
        }

        if (!isValidEmail(formData.email)) {
            setError('Please enter a valid email address');
            setIsSubmitting(false);
            return;
        }

        if (formData.fullName.length < 2) {
            setError('Please enter your full name');
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await createBooking({
                eventId,
                email: formData.email,
                fullName: formData.fullName,
            });

            if (result.success) {
                setSubmitted(true);
                // Track successful booking with analytics
                if (typeof window !== 'undefined' && (window as any).posthog) {
                    (window as any).posthog.capture('event_booked', {
                        eventId,
                        slug,
                        eventTitle,
                        email: formData.email
                    });
                }
            } else {
                setError(result.message || 'Booking failed. Please try again.');
            }
        } catch (err) {
            console.error('Booking submission error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success state
    if (submitted) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Successfully Registered!</h3>
                <p className="text-gray-400">
                    You're all set for <span className="text-white font-medium">{eventTitle}</span>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    We've sent a confirmation email to {formData.email}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Capacity Warning */}
            {capacity && capacity < 50 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <span>Limited spots available - {capacity} remaining</span>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-red-400 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name Field */}
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        disabled={isSubmitting}
                        required
                    />
                </div>

                {/* Email Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                        disabled={isSubmitting}
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-glow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Processing...</span>
                        </>
                    ) : (
                        <span>Register for Event</span>
                    )}
                </button>

                {/* Privacy Notice */}
                <p className="text-xs text-gray-500 text-center">
                    By registering, you agree to our privacy policy and terms of service.
                </p>
            </form>
        </div>
    );
};

export default BookEvent;