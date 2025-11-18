'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
    HomeIcon,
    CalendarIcon,
    PlusCircleIcon,
    UserIcon
} from "@heroicons/react/24/outline";
import {
    HomeIcon as HomeIconSolid,
    CalendarIcon as CalendarIconSolid,
    PlusCircleIcon as PlusCircleIconSolid,
    UserIcon as UserIconSolid
} from "@heroicons/react/24/solid";
import AuthButtons from './AuthButtons';

const Navbar = () => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        {
            name: 'Home',
            href: '/',
            current: pathname === '/',
            icon: <HomeIcon className="w-6 h-6" />,
            iconSolid: <HomeIconSolid className="w-6 h-6" />
        },
        {
            name: 'Events',
            href: '/events',
            current: pathname === '/events',
            icon: <CalendarIcon className="w-6 h-6" />,
            iconSolid: <CalendarIconSolid className="w-6 h-6" />
        },
        {
            name: 'Create Event',
            href: '/create-event',
            current: pathname === '/create-event',
            icon: <PlusCircleIcon className="w-6 h-6" />,
            iconSolid: <PlusCircleIconSolid className="w-6 h-6" />
        },
    ];

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Close mobile menu when route changes
    useEffect(() => {
        closeMobileMenu();
    }, [pathname]);

    return (
        <>
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/5 border-b border-white/10">
                <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link
                            href="/"
                            className="flex items-center space-x-2 group"
                            onClick={closeMobileMenu}
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                                <span className="text-white font-bold text-sm">AI</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent hidden sm:block">
                                confAI
                            </span>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`relative px-3 py-2 text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                                        item.current ? "text-white" : "text-gray-400 hover:text-white"
                                    }`}
                                >
                                    {item.current ? item.iconSolid : item.icon}
                                    <span>{item.name}</span>
                                    {item.current && (
                                        <span className="absolute inset-x-1 -bottom-1 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                                    )}
                                </Link>
                            ))}
                            <AuthButtons />
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                type="button"
                                className="text-gray-400 hover:text-white p-2 transition-all duration-200 rounded-lg hover:bg-white/5"
                                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                                onClick={toggleMobileMenu}
                            >
                                {isMobileMenuOpen ? (
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden pb-4">
                            <div className="px-2 pt-2 space-y-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                                            item.current
                                                ? "text-white bg-white/20"
                                                : "text-gray-300 hover:text-white hover:bg-white/10"
                                        }`}
                                        onClick={closeMobileMenu}
                                    >
                                        {item.current ? item.iconSolid : item.icon}
                                        <span>{item.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </nav>
            </header>

            {/* Bottom Navigation Bar - Mobile Only */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-40 md:hidden">
                <div className="flex justify-around items-center py-2">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 flex-1 mx-1 ${
                                item.current
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-gray-600 hover:text-blue-600"
                            }`}
                        >
                            <div className="w-6 h-6">
                                {item.current ? item.iconSolid : item.icon}
                            </div>
                            <span className="text-xs mt-1 font-medium">{item.name}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Padding for bottom navigation */}
            <div className="pb-16 md:pb-0"></div>
        </>
    );
};

export default Navbar;