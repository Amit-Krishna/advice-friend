// File: src/app/api/community/posts/route.js

import { createClient } from '@/lib/supabase/server';
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// --- GET ALL COMMUNITY POSTS ---
export async function GET(request) {
  const supabase = createClient();

  // Fetch all posts, ordered by the newest first.
  // We'll also fetch the user's email using a relationship.
  // NOTE: This requires a 'profiles' table with a foreign key to auth.users. 
  // For now, we'll just get the user_id. We can add author emails later.
  const { data, error } = await supabase
    .from("community_posts")
    .select('id, title, created_at, user_id')
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// --- CREATE A NEW COMMUNITY POST ---
export async function POST(request) {
  const { title, content } = await request.json();
  const supabase = createClient();

  // A user must be logged in to create a post.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("community_posts")
    .insert({ title, content, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }

  return NextResponse.json(data);
}