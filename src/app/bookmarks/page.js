// File: src/app/bookmarks/page.js

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const response = await fetch("/api/bookmarks");
        if (!response.ok) {
          throw new Error("You might not be logged in or there was a server error.");
        }
        const data = await response.json();
        setBookmarks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  if (loading) {
    return <p className="text-center mt-12">Loading your bookmarks...</p>;
  }

  if (error) {
    return (
      <div className="text-center mt-12">
        <p className="text-red-500">{error}</p>
        <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
          Please log in to see your bookmarks.
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Bookmarks</h1>
        <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700">
          Ask Something New
        </Link>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">
            You haven't saved any advice yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
         // Find the bookmarks.map section in src/app/bookmarks/page.js and replace it with this

            {bookmarks.map((bookmark) => (
            // Add this check: only render if bookmark.advice exists
            bookmark.advice && (
                <div key={bookmark.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                    {bookmark.advice.question} {/* Changed this line */}
                </h3>
                <div className="prose text-gray-800 max-w-none">
                    <ReactMarkdown children={bookmark.advice.answer} />
                    </div>
                    <p className="text-xs text-gray-400 mt-4 text-right">
                    Saved on: {new Date(bookmark.created_at).toLocaleDateString()}
                    </p>
                </div>
            )
            ))}
        </div>
      )}
    </div>
  );
}