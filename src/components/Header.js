"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import AuthUI from './AuthUI';
import SearchComponent from './SearchComponent';

export default function Header() {
    const [session, setSession] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        setIsMounted(true);
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
        };
        getSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setShowAuth(false);
            setIsMenuOpen(false);
        });
        return () => { authListener.subscription.unsubscribe(); };
    }, [supabase]);

    const handleLogout = async () => {
        setIsMenuOpen(false);
        await supabase.auth.signOut();
    };

    const handleLoginClick = () => {
        setIsMenuOpen(false);
        setShowAuth(true);
    };

    // Keep the placeholder for the initial server render to prevent hydration errors.
    const renderPlaceholder = () => (
        <header className="w-full p-4 bg-white border-b sticky top-0 z-40">
            <div className="max-w-6xl mx-auto flex justify-between items-center gap-4 h-[56px]">
                <div className="h-7 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="flex-1 hidden sm:flex justify-center px-4">
                    <div className="h-10 w-full max-w-md bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse md:hidden"></div>
                <div className="hidden md:flex h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
        </header>
    );

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

                    {/* --- [PURGE-PROOF STRUCTURE] --- */}
                    {/* Render a placeholder on the server and initial load, then the real UI on the client */}
                    {!isMounted ? (
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse md:hidden"></div>
                            <div className="hidden md:flex h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            {/* --- Desktop Nav --- */}
                            <nav className="hidden md:flex items-center gap-4">
                                {session && (
                                    <>
                                        <Link href="/community" className="text-sm font-semibold text-gray-600 hover:text-black">Community</Link>
                                        <Link href="/trends" className="text-sm font-semibold text-gray-600 hover:text-black">AI Trends</Link>
                                        <Link href="/bookmarks" className="text-sm font-semibold text-gray-600 hover:text-black">My Bookmarks</Link>
                                    </>
                                )}
                                {session ? (
                                    <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-semibold hover:bg-red-600">Logout</button>
                                ) : (
                                    <button onClick={() => setShowAuth(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700">Login</button>
                                )}
                            </nav>

                            {/* --- Mobile Nav Trigger --- */}
                            <div className="md:hidden">
                                {session ? (
                                    <button onClick={() => setIsMenuOpen(true)} aria-label="Open user menu">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                        </div>
                                    </button>
                                ) : (
                                    <button onClick={() => setIsMenuOpen(true)} aria-label="Open menu">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="sm:hidden mt-4">
                    <SearchComponent />
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setIsMenuOpen(false)}>
                    <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg p-4" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setIsMenuOpen(false)} className="absolute top-4 right-4" aria-label="Close menu">
                           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <nav className="mt-12 flex flex-col space-y-4">
                           {session ? (
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