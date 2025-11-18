"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface EventPreview {
    _id: string;
    title: string;
    slug?: string;
    date?: string;
    location?: string;
    _score?: number;
}

export default function PromptSearch({ defaultValue = '' }: { defaultValue?: string }) {
    const [query, setQuery] = useState(defaultValue || '');
    const [results, setResults] = useState<EventPreview[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const timer = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const router = useRouter();

    useEffect(() => {
        // keep input synced with defaultValue
        setQuery(defaultValue || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultValue]);

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        const v = e.target.value;
        setQuery(v);
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!query || query.trim() === '') return;
        // navigate to /events with the search prompt; server will use the CSP recommender
        router.push(`/events?search=${encodeURIComponent(query)}`);
    }

    return (
        <div className="relative">
            <form onSubmit={onSubmit} className="flex">
                <input
                    ref={inputRef}
                    name="search"
                    value={query}
                    onChange={onChange}
                    placeholder="Escreve o que queres, ex: 'quero eventos em Lisboa'"
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 sm:py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                />
                <button
                    type="submit"
                    className="ml-2 px-3 py-1 rounded-lg bg-blue-500 text-white font-medium"
                >
                    {loading ? '...' : 'Buscar'}
                </button>
            </form>

            {/* No dropdown — submission navigates to events page which will render IA recommendations */}
        </div>
    );
}
