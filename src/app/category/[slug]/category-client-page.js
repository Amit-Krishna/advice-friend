// File: src/app/category/[slug]/category-client-page.js

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// Now accepts 'slug' as a simple string prop
export default function CategoryClientPage({ slug }) {
  const [adviceList, setAdviceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use the 'slug' prop directly
  const categoryName = decodeURIComponent(slug);

  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        // Use the 'slug' prop directly
        const response = await fetch(`/api/category/${slug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch advice for this category.");
        }
        const data = await response.json();
        setAdviceList(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvice();
  }, [slug]); // The dependency is now 'slug'

  if (loading) {
    return <p className="text-center mt-12">Loading advice for {categoryName}...</p>;
  }

  if (error) {
    return <p className="text-center mt-12 text-red-500">{error}</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md-p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-gray-500">Browsing Category</p>
          <h1 className="text-3xl font-bold">{categoryName}</h1>
        </div>
        <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700">
          Ask Something New
        </Link>
      </div>

      {adviceList.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No advice has been categorized here yet. Be the first to ask a question!
        </p>
      ) : (
        <div className="space-y-4">
          {adviceList.map((advice) => (
            <Link href={`/advice/${advice.id}`} key={advice.id}>
            <div key={advice.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">{advice.question}</h3>
            </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}