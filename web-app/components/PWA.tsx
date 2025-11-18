'use client';

import { useEffect } from 'react';

export default function PWA() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Clear existing service workers
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                for (const registration of registrations) {
                    registration.unregister();
                    console.log('Service Worker unregistered');
                }
            });

            // Clear cache
            caches.keys().then((cacheNames) => {
                cacheNames.forEach((cacheName) => {
                    caches.delete(cacheName);
                    console.log('Cache cleared:', cacheName);
                });
            });

            // Only register in production
            if (process.env.NODE_ENV === 'production') {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                        console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                    });
            }
        }
    }, []);

    return null;
}