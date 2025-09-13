// File: src/app/trends/page.js
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TrendsPage() {
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const response = await fetch('/api/trends');
                const data = await response.json();
                setTrends(data);
            } catch (error) {
                console.error("Failed to fetch trends:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrends();
    }, []);

    if (loading) {
        return <p className="text-center mt-12">Loading Latest AI Trends...</p>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">AI Trends Dashboard</h1>
                <Link href="/" className="text-blue-600 hover:underline text-sm font-semibold">
                    &larr; Back to Ask
                </Link>
            </div>
            <div className="space-y-6">
                {trends.map(trend => (
                    <a 
                       href={trend.link} 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       key={trend.id} 
                       className="block bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start">
                            <div className="flex-1">
                                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">{trend.category}</span>
                                <h2 className="text-xl font-bold text-gray-900">{trend.title}</h2>
                                <p className="text-gray-600 mt-2">{trend.description}</p>
                                <p className="text-xs text-gray-400 mt-4">
                                    Published on: {new Date(trend.published_at).toLocaleDateString()}
                                </p>
                            </div>
                            {trend.image_url && (
                                <img 
                                    src={trend.image_url} 
                                    alt={trend.title} 
                                    className="w-full h-40 sm:w-32 sm:h-32 object-cover rounded-md sm:ml-6 mt-4 sm:mt-0" 
                                />
                            )}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}