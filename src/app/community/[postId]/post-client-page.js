// File: src/app/community/[postId]/post-client-page.js

"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
// --- THIS IS THE FIX ---
// Import our new, central client creation function
import { createClient } from '@/lib/supabase/client';
// --------------------

export default function PostClientPage({ postId }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [session, setSession] = useState(null);
  
  // --- THIS IS THE FIX ---
  // Create the client using the new function
  const supabase = createClient();
  // --------------------

  const fetchPost = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/community/posts/${postId}`);
      if (!response.ok) {
        throw new Error("Post not found.");
      }
      const data = await response.json();
      setPost(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
    };
    getSession();
    fetchPost();
  }, [postId, supabase, fetchPost]);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    try {
        const response = await fetch('/api/community/replies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: replyContent, post_id: postId }),
        });
        if (!response.ok) throw new Error("Failed to post reply.");
        setReplyContent('');
        fetchPost();
    } catch (err) {
        console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-12">Loading post...</p>;
  if (error) return <p className="text-center mt-12 text-red-500">{error}</p>;
  if (!post) return <p className="text-center mt-12">Post not found.</p>;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="mb-8">
        <Link href="/community" className="text-blue-600 hover:underline">&larr; Back to Forum</Link>
      </div>
      <div className="border-b pb-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
        <p className="text-xs text-gray-400 mb-4">
          Posted on {new Date(post.created_at).toLocaleString()}
        </p>
        <div className="prose max-w-none text-gray-800">
          <p>{post.content}</p>
        </div>
      </div>
      <h2 className="text-xl font-bold mb-4">Replies ({post.community_replies.length})</h2>
      <div className="space-y-4">
        {post.community_replies.length > 0 ? (
          post.community_replies.map(reply => (
            <div key={reply.id} className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-gray-800">{reply.content}</p>
                 <p className="text-xs text-gray-400 mt-2">
                    Replied on {new Date(reply.created_at).toLocaleString()}
                </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Be the first to reply!</p>
        )}
      </div>
      {session && (
        <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-bold mb-2">Leave a Reply</h3>
            <form onSubmit={handleReplySubmit}>
                <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply here..."
                    required
                    rows={5}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                />
                <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700">
                    Post Reply
                </button>
            </form>
        </div>
      )}
    </div>
  );
}