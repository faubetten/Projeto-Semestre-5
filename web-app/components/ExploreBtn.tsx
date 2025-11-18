'use client';

/**
 * Animated exploration button with smooth scroll behavior
 * Features hover effects and accessibility support
 */

const ExploreBtn = () => {
    const scrollToEvents = () => {
        const eventsSection = document.getElementById('events');
        if (eventsSection) {
            eventsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <button
            onClick={scrollToEvents}
            className="group relative overflow-hidden bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold py-4 px-8 rounded-full hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 transform hover:scale-105"
            aria-label="Explore upcoming events"
        >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent-500 to-primary-500 transform group-hover:scale-105 transition-transform duration-300" />

            {/* Content */}
            <span className="relative z-10 flex items-center space-x-2">
        <span>Explore Events</span>
        <svg
            className="w-5 h-5 transform group-hover:translate-y-1 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>

            {/* Ripple effect */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
                <div className="absolute inset-0 bg-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-500 opacity-0 group-hover:opacity-100" />
            </div>
        </button>
    );
};

export default ExploreBtn;