"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function AuthButtons() {
    return (
        <div className="flex items-center gap-3">
            <SignedIn>
                <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <SignedOut>
                <SignInButton mode="modal">
                    <button className="px-3 py-1 rounded-lg bg-blue-500 text-white text-sm font-medium">Sign in</button>
                </SignInButton>
            </SignedOut>
        </div>
    );
}
