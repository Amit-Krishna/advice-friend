// File: src/app/api/community/replies/route.js

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from "next/server";

export async function POST(request) {
  // We need both the content of the reply and the ID of the post it belongs to.
  const { content, post_id } = await request.json();
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!content || !post_id) {
    return NextResponse.json({ error: "Content and post_id are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("community_replies")
    .insert({ content, post_id, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Error creating reply:", error);
    return NextResponse.json({ error: "Failed to create reply" }, { status: 500 });
  }

  return NextResponse.json(data);
}