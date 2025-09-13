"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import AuthUI from './AuthUI';
import SearchComponent from './SearchComponent';

export default function Header() {
    const [session, setSession] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    // State to track if the component has mounted on the client, to prevent hydration errors.
    const [isMounted, setIsMounted] = useState(false);
    const supabase = createClientComponentClient();

    useEffect(() => {
        // This effect runs only once on the client, after the initial render.
        setIsMounted(true);

        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
        };
        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setShowAuth(false); // Close modal on login/logout
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [supabase]);

    const handleLogout = async () => {
        setIsMenuOpen(false); // Close menu on logout
        await supabase.auth.signOut();
    };

    const handleLoginClick = () => {
        setIsMenuOpen(false); // Close menu
        setShowAuth(true);    // Open auth modal
    };
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            {showAuth && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={() => setShowAuth(false)}>
                    <div className="bg-white rounded-lg p-8" onClick={(e) => e.stopPropagation()}>
                        <AuthUI />
                    </div>
                </div>
            )}

            <header className="w-full p-4 bg-white border-b sticky top-0 z-40">
                <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
                    <Link href="/" className="font-bold text-xl text-gray-800 hover:text-blue-600 transition-colors">
                        AdviceFriend
                    </Link>
                    
                    <div className="flex-1 hidden sm:flex justify-center px-4">
                      <SearchComponent />
                    </div>

                    {/* --- DESKTOP NAVIGATION (Hydration-Safe) --- */}
                    <div className="hidden md:flex items-center gap-4">
                        {!isMounted ? (
                            // Render a placeholder on the server and initial client render
                            <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                        ) : session ? (
                            // Once mounted, render the actual user state
                            <>
                                <Link href="/community" className="text-sm font-semibold text-gray-600 hover:text-black">Community</Link>
                                <Link href="/trends" className="text-sm font-semibold text-gray-600 hover:text-black">AI Trends</Link>
                                <Link href="/bookmarks" className="text-sm font-semibold text-gray-600 hover:text-black">My Bookmarks</Link>
                                <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-semibold hover:bg-red-600">Logout</button>
                            </>
                        ) : (
                            <button onClick={() => setShowAuth(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700">Login</button>
                        )}
                    </div>
                    
                    {/* --- HAMBURGER MENU BUTTON --- */}
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Open navigation menu">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                    </div>
                </div>

                <div className="sm:hidden mt-4">
                    <SearchComponent />
                </div>
            </header>

            {/* --- MOBILE MENU OVERLAY (Hydration-Safe) --- */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setIsMenuOpen(false)}>
                    <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg p-4" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4" aria-label="Close navigation menu">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <nav className="mt-12 flex flex-col space-y-4">
                            {!isMounted ? (
                                <div className="space-y-4">
                                    <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-8 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            ) : session ? (
                                <>
                                    <Link onClick={() => setIsMenuOpen(false)} href="/community" className="font-semibold text-gray-700 hover:text-blue-600 py-2">Community</Link>
                                    <Link onClick={() => setIsMenuOpen(false)} href="/trends" className="font-semibold text-gray-700 hover:text-blue-600 py-2">AI Trends</Link>
                                    <Link onClick={() => setIsMenuOpen(false)} href="/bookmarks" className="font-semibold text-gray-700 hover:text-blue-600 py-2">My Bookmarks</Link>
                                    <button onClick={handleLogout} className="px-4 py-2 mt-4 w-full text-left bg-red-500 text-white rounded-md font-semibold hover:bg-red-600">Logout</button>
                                </>
                            ) : (
                                <button onClick={handleLoginClick} className="px-4 py-2 w-full text-left bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700">Login</button>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}