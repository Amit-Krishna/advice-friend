// File: src/components/SearchComponent.js

"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchComponent() {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return; // Don't search if the input is empty
        
        // Navigate to the search page with the user's query
        router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    };

    return (
        <form onSubmit={handleSearch} className="w-full max-w-md">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input 
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search all advice..."
                    className="w-full p-2 pl-10 border rounded-full bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors"
                />
            </div>
        </form>
    );
}