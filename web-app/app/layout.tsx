import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import LightRays from "@/components/LightRays";
import Breadcrumbs from "@/components/Breadcrumbs";
import PWA from '@/components/PWA';
import OfflineIndicator from '@/components/OfflineIndicator';
import InstallPrompt from '@/components/InstallPrompt';
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({
    subsets: ["latin"],
    display: 'swap',
});

export const viewport: Viewport = {
    themeColor: "#0ea5e9",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
}

// Defina o metadataBase para produção e desenvolvimento
export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    title: {
        default: "confAI - Connect Through Events",
        template: "%s | confAI"
    },
    description: "Discover and create amazing events. Connect with communities and grow together.",
    manifest: "/manifest.json",
    authors: [{ name: "confAI Team" }],
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "confAI",
    },
    formatDetection: {
        telephone: false,
    },
    openGraph: {
        type: "website",
        siteName: "confAI",
        title: "confAI - Connect Through Events",
        description: "Discover and create amazing developer events.",
        // Adicione uma imagem para Open Graph
        images: [
            {
                url: '/og-image.jpg', // ou '/images/og-image.jpg'
                width: 1200,
                height: 630,
                alt: 'confAI - Connect Through Events',
            }
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "confAI - Connect Through Events",
        description: "Discover and create amazing developer events.",
        // Adicione uma imagem para Twitter
        images: ['/og-image.jpg'], // ou '/images/og-image.jpg'
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.className}>
        <head>
            {/* PWA meta tags */}
            <link rel="icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/icons/ios/16.png" />
            <link rel="apple-touch-icon" href="/icons/ios/20.png" />
            <link rel="apple-touch-icon" href="/icons/ios/29.png" />
            <link rel="apple-touch-icon" href="/icons/ios/32.png" />
            <link rel="apple-touch-icon" href="/icons/ios/40.png" />
            <link rel="apple-touch-icon" href="/icons/ios/50.png" />
            <link rel="apple-touch-icon" href="/icons/ios/57.png" />
            <link rel="apple-touch-icon" href="/icons/ios/58.png" />
            <link rel="apple-touch-icon" href="/icons/ios/60.png" />
            <link rel="apple-touch-icon" href="/icons/ios/64.png" />
            <link rel="apple-touch-icon" href="/icons/ios/72.png" />
            <link rel="apple-touch-icon" href="/icons/ios/76.png" />
            <link rel="apple-touch-icon" href="/icons/ios/80.png" />
            <link rel="apple-touch-icon" href="/icons/ios/87.png" />
            <link rel="apple-touch-icon" href="/icons/ios/100.png" />
            <link rel="apple-touch-icon" href="/icons/ios/114.png" />
            <link rel="apple-touch-icon" href="/icons/ios/120.png" />
            <link rel="apple-touch-icon" href="/icons/ios/128.png" />
            <link rel="apple-touch-icon" href="/icons/ios/144.png" />
            <link rel="apple-touch-icon" href="/icons/ios/152.png" />
            <link rel="apple-touch-icon" href="/icons/ios/167.png" />
            <link rel="apple-touch-icon" href="/icons/ios/180.png" />
            <link rel="apple-touch-icon" href="/icons/ios/192.png" />
            <link rel="apple-touch-icon" href="/icons/ios/256.png" />
            <link rel="apple-touch-icon" href="/icons/ios/512.png" />
            <link rel="apple-touch-icon" href="/icons/ios/1024.png" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="confAI" />
        </head>
        <body className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white antialiased">
        <PWA />
        <OfflineIndicator />
        <InstallPrompt />
        <ClerkProvider>
        {/* Background Effects with LightRays */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
            <LightRays
                raysOrigin="top-center-offset"
                raysColor="#0ea5e9"
                raysSpeed={0.8}
                lightSpread={0.8}
                rayLength={1.2}
                followMouse={true}
                mouseInfluence={0.03}
                noiseAmount={0.1}
                distortion={0.005}
            />

            {/* Additional gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
        </div>

        {/* Main Layout Structure */}
        <div className="min-h-screen flex flex-col relative z-10">
            <Navbar />

            {/* Main Content Area with Breadcrumbs */}
            <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Breadcrumbs />
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/10 bg-white/5 backdrop-blur-sm mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center space-x-2 mb-4 md:mb-0">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xs">AI</span>
                            </div>
                            <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                confAI
                            </span>
                        </div>

                        <div className="text-gray-400 text-sm text-center md:text-right">
                            <p>© {new Date().getFullYear()} confAI. All rights reserved.</p>
                            <p className="text-xs mt-1">Connect • Create • Celebrate</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
        </ClerkProvider>
        </body>
        </html>
    );
}