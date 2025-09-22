// File: src/app/api/community/posts/[postId]/route.js

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const postId = params.postId;
  const supabase = createClient();

  // This is a powerful Supabase feature: we fetch the post AND its replies in one go.
  // We also order the replies by oldest first to show a proper conversation.
  const { data, error } = await supabase
    .from("community_posts")
    .select(`
      *,
      community_replies (
        id,
        content,
        created_at,
        user_id
      )
    `)
    .eq("id", postId)
    .order('created_at', { foreignTable: 'community_replies', ascending: true })
    .single(); // .single() is crucial here, as we only want one post.

  if (error || !data) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}