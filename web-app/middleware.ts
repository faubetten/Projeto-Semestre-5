import { NextResponse } from "next/server";

// Use dynamic import to support different @clerk/nextjs versions and avoid
// build-time errors when `authMiddleware` is not exported.
export default async function middleware(req: Request) {
    try {
        const mod = await import("@clerk/nextjs/server");

        // Preferred export in newer Clerk versions
        if (typeof mod.authMiddleware === "function") {
            const mw = mod.authMiddleware();
            return await mw(req as any);
        }

        // Fallback name used in some versions
        if (typeof mod.withClerkMiddleware === "function") {
            const mw = mod.withClerkMiddleware();
            return await mw(req as any);
        }
    } catch (err) {
        // If dynamic import fails, fall through and allow the request.
        // This keeps the dev server running while you resolve Clerk/Next versions.
        // eslint-disable-next-line no-console
        console.warn("Clerk middleware not available, skipping auth middleware:", err);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/create-event", "/api/(.*)"],
};
