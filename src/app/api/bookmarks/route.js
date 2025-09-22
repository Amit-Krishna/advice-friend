// File: src/app/api/bookmarks/route.js

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from "next/server";

// --- FETCH USER'S BOOKMARKS (Refactored) ---
export async function GET(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // First, get the bookmarked advice IDs for the user.
  // Then, use those IDs to fetch the full advice details.
  // Supabase's foreign key relationships make this easy!
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`
      id,
      created_at,
      advice (
        id,
        question,
        answer
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// --- SAVE A NEW BOOKMARK (Refactored) ---
export async function POST(request) {
  // We no longer receive question/answer. We receive the advice_id.
  const { advice_id } = await request.json(); 
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Insert a new row linking the user to the advice_id.
  const { data, error } = await supabase
    .from("bookmarks")
    .insert({ advice_id: advice_id, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error saving bookmark:", error);
    return NextResponse.json({ error: "Failed to save bookmark" }, { status: 500 });
  }

  return NextResponse.json(data);
}