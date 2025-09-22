// File: src/app/community/page.js

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/community/posts');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return <p className="text-center mt-12">Loading community posts...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Community Forum</h1>
        <Link
          href="/community/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700"
        >
          Ask a Question
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-500">No one has asked a question yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              href={`/community/${post.id}`}
              key={post.id}
              className="block bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
              <p className="text-xs text-gray-400 mt-2">
                Posted on {new Date(post.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}