// File: src/components/Header.js

"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import AuthUI from './AuthUI';
import SearchComponent from './SearchComponent';

export default function Header() {
    const [session, setSession] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const supabase = createClientComponentClient();

    useEffect(() => {
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
        await supabase.auth.signOut();
    };

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
                    
                    <div className="flex-1 flex justify-center px-4">
                      <SearchComponent />
                    </div>

                    <div className="flex items-center gap-4">
                        {session ? (
                            <>
                                <Link href="/community" className="text-sm font-semibold text-gray-600 hover:text-black hidden md:block">
                                    Community
                                </Link>
                                <Link href="/trends" className="text-sm font-semibold text-gray-600 hover:text-black hidden md:block">
                                    AI Trends
                                </Link>
                                <Link href="/bookmarks" className="text-sm font-semibold text-gray-600 hover:text-black hidden md:block">
                                    My Bookmarks
                                </Link>
                                <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-semibold hover:bg-red-600">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setShowAuth(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700">
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}