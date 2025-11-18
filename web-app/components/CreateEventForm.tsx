'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { EVENT_MODES, EVENT_TAGS, DEFAULT_EVENT_VALUES } from '@/lib/constants';
import { generateSlug, cn } from '@/lib/utils';

/**
 * Comprehensive events creation form with real-time validation and image upload
 * Features multi-step form handling, tag management, and agenda building
 */

interface EventFormData {
    title: string;
    description: string;
    overview: string;
    venue: string;
    location: string;
    date: string;
    time: string;
    mode: 'online' | 'offline' | 'hybrid';
    audience: string;
    organizer: string;
    tags: string[];
    agenda: string[];
    price: number;
    capacity: number;
    registrationUrl: string;
    image: File | null;
}

const CreateEventForm = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [imagePreview, setImagePreview] = useState<string>('');
    const [newTag, setNewTag] = useState('');
    const [newAgendaItem, setNewAgendaItem] = useState('');

    const [formData, setFormData] = useState<EventFormData>({
        title: '',
        description: '',
        overview: '',
        venue: '',
        location: '',
        date: '',
        time: '',
        mode: DEFAULT_EVENT_VALUES.mode,
        audience: '',
        organizer: '',
        tags: [...DEFAULT_EVENT_VALUES.tags],
        agenda: [],
        price: DEFAULT_EVENT_VALUES.price,
        capacity: DEFAULT_EVENT_VALUES.capacity,
        registrationUrl: '',
        image: null,
    });

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle image upload
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type and size
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({ ...prev, image: 'Please select a JPEG, PNG, or WebP image' }));
                return;
            }

            if (file.size > maxSize) {
                setErrors(prev => ({ ...prev, image: 'Image must be smaller than 5MB' }));
                return;
            }

            setFormData(prev => ({ ...prev, image: file }));
            setErrors(prev => ({ ...prev, image: '' }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle tag management
    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    // Handle agenda management
    const handleAddAgendaItem = () => {
        if (newAgendaItem.trim()) {
            setFormData(prev => ({
                ...prev,
                agenda: [...prev.agenda, newAgendaItem.trim()]
            }));
            setNewAgendaItem('');
        }
    };

    const handleRemoveAgendaItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            agenda: prev.agenda.filter((_, i) => i !== index)
        }));
    };

    // Form validation
    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.title.trim()) newErrors.title = 'Event title is required';
            if (!formData.description.trim()) newErrors.description = 'Event description is required';
            if (!formData.overview.trim()) newErrors.overview = 'Event overview is required';
            if (!formData.image) newErrors.image = 'Event image is required';
        }

        if (step === 2) {
            if (!formData.venue.trim()) newErrors.venue = 'Venue name is required';
            if (!formData.location.trim()) newErrors.location = 'Event location is required';
            if (!formData.date) newErrors.date = 'Event date is required';
            if (!formData.time) newErrors.time = 'Event time is required';
            if (!formData.audience.trim()) newErrors.audience = 'Target audience is required';
            if (!formData.organizer.trim()) newErrors.organizer = 'Organizer name is required';
        }

        if (step === 3) {
            if (formData.tags.length === 0) newErrors.tags = 'At least one tag is required';
            if (formData.agenda.length === 0) newErrors.agenda = 'At least one agenda item is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateStep(step)) return;

        if (step < 3) {
            setStep(step + 1);
            return;
        }

        // Final submission
        setIsSubmitting(true);
        try {
            const submitData = new FormData();

            // Append all form fields
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'tags' || key === 'agenda') {
                    submitData.append(key, JSON.stringify(value));
                } else if (key === 'image' && value) {
                    submitData.append(key, value as File);
                } else if (value !== null && value !== undefined) {
                    submitData.append(key, value.toString());
                }
            });

            const response = await fetch('/api/events', {
                method: 'POST',
                body: submitData,
            });

            const result = await response.json();

            if (response.ok) {
                // Success - redirect to the new events
                router.push(`/events/${result.event.slug}`);
                router.refresh();
            } else {
                setErrors({ submit: result.message || 'Failed to create events' });
            }
        } catch (error) {
            console.error('Event creation error:', error);
            setErrors({ submit: 'An unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Step navigation
    const nextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    return (
        <div className="max-w-4xl mx-auto bg-white/5 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
            {/* Progress Steps */}
            <div className="flex justify-between mb-8">
                {[1, 2, 3].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                        <div
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200",
                                stepNumber === step
                                    ? "bg-primary-500 text-white"
                                    : stepNumber < step
                                        ? "bg-green-500 text-white"
                                        : "bg-white/10 text-gray-400"
                            )}
                        >
                            {stepNumber}
                        </div>
                        {stepNumber < 3 && (
                            <div
                                className={cn(
                                    "w-16 h-0.5 mx-2 transition-all duration-200",
                                    stepNumber < step ? "bg-green-500" : "bg-white/10"
                                )}
                            />
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Basic Information */}
                {step === 1 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-white">Event Basics</h2>

                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                                Event Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Enter event title"
                            />
                            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                                Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
                                placeholder="Describe your event in detail..."
                            />
                            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
                        </div>

                        {/* Overview */}
                        <div>
                            <label htmlFor="overview" className="block text-sm font-medium text-gray-300 mb-2">
                                Short Overview *
                            </label>
                            <textarea
                                id="overview"
                                name="overview"
                                value={formData.overview}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
                                placeholder="Brief summary of the event..."
                            />
                            {errors.overview && <p className="text-red-400 text-sm mt-1">{errors.overview}</p>}
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Event Image *
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/20 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                                    {imagePreview ? (
                                        <div className="relative w-full h-full rounded-lg overflow-hidden">
                                            <Image
                                                src={imagePreview}
                                                alt="Event preview"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-sm text-gray-400">Click to upload event image</p>
                                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 5MB</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>
                            {errors.image && <p className="text-red-400 text-sm mt-1">{errors.image}</p>}
                        </div>
                    </div>
                )}

                {/* Step 2: Event Details */}
                {step === 2 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-white">Event Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Venue */}
                            <div>
                                <label htmlFor="venue" className="block text-sm font-medium text-gray-300 mb-2">
                                    Venue Name *
                                </label>
                                <input
                                    type="text"
                                    id="venue"
                                    name="venue"
                                    value={formData.venue}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Venue or online platform"
                                />
                                {errors.venue && <p className="text-red-400 text-sm mt-1">{errors.venue}</p>}
                            </div>

                            {/* Location */}
                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                                    Location *
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="City, Country or Online"
                                />
                                {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
                            </div>

                            {/* Date */}
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
                                    Event Date *
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date}</p>}
                            </div>

                            {/* Time */}
                            <div>
                                <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-2">
                                    Event Time *
                                </label>
                                <input
                                    type="time"
                                    id="time"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                {errors.time && <p className="text-red-400 text-sm mt-1">{errors.time}</p>}
                            </div>

                            {/* Mode */}
                            <div>
                                <label htmlFor="mode" className="block text-sm font-medium text-gray-300 mb-2">
                                    Event Mode *
                                </label>
                                <select
                                    id="mode"
                                    name="mode"
                                    value={formData.mode}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    {Object.entries(EVENT_MODES).map(([value, config]) => (
                                        <option key={value} value={value}>
                                            {config.icon} {config.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Audience */}
                            <div>
                                <label htmlFor="audience" className="block text-sm font-medium text-gray-300 mb-2">
                                    Target Audience *
                                </label>
                                <input
                                    type="text"
                                    id="audience"
                                    name="audience"
                                    value={formData.audience}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="e.g., Web Developers, Data Scientists"
                                />
                                {errors.audience && <p className="text-red-400 text-sm mt-1">{errors.audience}</p>}
                            </div>
                        </div>

                        {/* Organizer */}
                        <div>
                            <label htmlFor="organizer" className="block text-sm font-medium text-gray-300 mb-2">
                                Organizer *
                            </label>
                            <input
                                type="text"
                                id="organizer"
                                name="organizer"
                                value={formData.organizer}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="Organization or individual name"
                            />
                            {errors.organizer && <p className="text-red-400 text-sm mt-1">{errors.organizer}</p>}
                        </div>

                        {/* Additional Options */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Price */}
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                                    Price (USD)
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Capacity */}
                            <div>
                                <label htmlFor="capacity" className="block text-sm font-medium text-gray-300 mb-2">
                                    Capacity
                                </label>
                                <input
                                    type="number"
                                    id="capacity"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="100"
                                />
                            </div>

                            {/* Registration URL */}
                            <div>
                                <label htmlFor="registrationUrl" className="block text-sm font-medium text-gray-300 mb-2">
                                    Registration URL
                                </label>
                                <input
                                    type="url"
                                    id="registrationUrl"
                                    name="registrationUrl"
                                    value={formData.registrationUrl}
                                    onChange={handleInputChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Tags & Agenda */}
                {step === 3 && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-white">Tags & Agenda</h2>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Event Tags *
                            </label>
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {formData.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-500/20 text-primary-300"
                                        >
                      {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="ml-2 hover:text-primary-100"
                                            >
                        ×
                      </button>
                    </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Add a tag..."
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                {errors.tags && <p className="text-red-400 text-sm mt-1">{errors.tags}</p>}
                            </div>
                        </div>

                        {/* Agenda */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Event Agenda *
                            </label>
                            <div className="space-y-3">
                                {formData.agenda.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <span className="w-6 h-6 bg-primary-500 rounded-full text-sm flex items-center justify-center text-white font-medium">
                      {index + 1}
                    </span>
                                        <span className="flex-1 text-gray-300">{item}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAgendaItem(index)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newAgendaItem}
                                        onChange={(e) => setNewAgendaItem(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAgendaItem())}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Add agenda item..."
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddAgendaItem}
                                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                {errors.agenda && <p className="text-red-400 text-sm mt-1">{errors.agenda}</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-white/10">
                    {step > 1 ? (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
                        >
                            Back
                        </button>
                    ) : (
                        <div></div>
                    )}

                    {step < 3 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:shadow-glow transition-all duration-200 disabled:opacity-50 flex items-center space-x-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Creating Event...</span>
                                </>
                            ) : (
                                <span>Create Event</span>
                            )}
                        </button>
                    )}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 text-red-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{errors.submit}</span>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default CreateEventForm;