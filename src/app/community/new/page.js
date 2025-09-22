// File: src/app/community/new/page.js

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewPostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      
      if (response.status === 401) {
          setMessage("You must be logged in to ask a question.");
          return;
      }
      if (!response.ok) {
        throw new Error('Failed to create post.');
      }
      
      const newPost = await response.json();
      // Redirect the user to their newly created post page
      router.push(`/community/${newPost.id}`);

    } catch (error) {
      setMessage("Error: Could not create post.");
      console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div>
        <div className="mb-8">
            <Link href="/community" className="text-blue-600 hover:underline">&larr; Back to Forum</Link>
        </div>
      <h1 className="text-3xl font-bold mb-6">Ask the Community</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your question?"
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Provide more details, what you've tried, etc."
            required
            rows={8}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? "Submitting..." : "Submit Question"}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
}