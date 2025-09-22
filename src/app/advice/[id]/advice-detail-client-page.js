// File: src/app/advice/[id]/advice-detail-client-page.js

"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

// Accepts 'adviceId' as a simple string prop
export default function AdviceDetailClientPage({ adviceId }) {
    const [advice, setAdvice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAdvice = async () => {
            try {
                // Use the 'adviceId' prop to build the API URL
                const response = await fetch(`/api/advice/${adviceId}`);
                if (!response.ok) {
                    throw new Error("Advice not found.");
                }
                const data = await response.json();
                setAdvice(data);
            } catch (err){
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (adviceId) { // Only fetch if the ID exists
            fetchAdvice();
        }
    }, [adviceId]); // The dependency is now 'adviceId'

    if (loading) return <p className="text-center mt-12">Loading advice...</p>;
    if (error) return <p className="text-center mt-12 text-red-500">{error}</p>;
    if (!advice) return <p className="text-center mt-12">Advice not found.</p>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6">
            <div className="mb-8">
                <Link href="/" className="text-blue-600 hover:underline">&larr; Back to Home</Link>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h1 className="text-2xl font-bold mb-4">{advice.question}</h1>
                <div className="prose text-gray-800 lg:prose-xl max-w-none">
                    <ReactMarkdown>{advice.answer}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}