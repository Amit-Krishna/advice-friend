// File: src/app/search/page.js

"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from 'next/navigation';
import { CATEGORIES } from '../../lib/categories';

function SearchResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('q');
  const category = searchParams.get('category') || 'all';

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`);
        if (!response.ok) throw new Error("Failed to fetch search results.");
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, category]);

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    router.push(`/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(newCategory)}`);
  };

  if (loading) {
    return <p className="text-center mt-8">Searching for &apos;{query}&apos;...</p>;
  }
  if (error) {
    return <p className="text-center mt-8 text-red-500">{error}</p>;
  }
  if (!query) {
    return <p className="text-center mt-8 text-gray-500">Please enter a search term.</p>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">
          Results for: <span className="text-blue-600">&apos;{query}&apos;</span>
        </h1>
        <div className="flex items-center gap-2">
            <label htmlFor="category-filter" className="text-sm font-medium text-gray-600">Filter by:</label>
            <select
              id="category-filter"
              value={category}
              onChange={handleCategoryChange}
              className="p-2 border border-gray-300 rounded-md shadow-sm"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
        </div>
      </div>
      {results.length === 0 ? (
        <p className="text-gray-500 bg-white p-8 text-center rounded-lg border">No results found for this criteria.</p>
      ) : (
        <div className="space-y-4">
          {results.map((advice) => (
            <Link href={`/advice/${advice.id}`} key={advice.id}>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 cursor-pointer transition-colors">
                <h3 className="text-lg font-semibold text-gray-800">{advice.question}</h3>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{advice.answer}</p>
                <span className="mt-3 inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">{advice.category}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-center mt-8">Loading search...</p>}>
      <SearchResults />
    </Suspense>
  );
}