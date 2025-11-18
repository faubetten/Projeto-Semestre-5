'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";

/**
 * Breadcrumbs component for showing navigation hierarchy
 * Automatically generates breadcrumbs based on current path
 */

const Breadcrumbs = () => {
    const pathname = usePathname();

    // Don't show breadcrumbs on home page
    if (pathname === '/') return null;

    // Generate breadcrumb items from pathname
    const generateBreadcrumbs = () => {
        const paths = pathname.split('/').filter(path => path);

        const breadcrumbs = [
            {
                href: '/',
                label: 'Home',
                icon: <HomeIcon className="w-4 h-4" />
            }
        ];

        let currentPath = '';
        paths.forEach((path, index) => {
            currentPath += `/${path}`;

            // Convert path to readable label
            const label = path
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

            breadcrumbs.push({
                href: currentPath,
                label,
                icon: null
            });
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();
    const isLast = (index: number) => index === breadcrumbs.length - 1;

    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6 px-4 sm:px-0 overflow-x-auto whitespace-nowrap">
            {breadcrumbs.map((breadcrumb, index) => (
                <div key={breadcrumb.href} className="flex items-center space-x-2">
                    {index > 0 && (
                        <ChevronRightIcon className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    )}

                    {isLast(index) ? (
                        <span className="text-white font-medium truncate max-w-[120px] sm:max-w-none">
              {breadcrumb.label}
            </span>
                    ) : (
                        <Link
                            href={breadcrumb.href}
                            className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors truncate max-w-[120px] sm:max-w-none"
                        >
                            {breadcrumb.icon}
                            <span>{breadcrumb.label}</span>
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
};

export default Breadcrumbs;