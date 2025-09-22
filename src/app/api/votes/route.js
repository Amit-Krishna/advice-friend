// File: src/app/api/votes/route.js (Final Correct Version)

import { createClient } from '@/lib/supabase/server';
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// --- FETCH VOTE DATA FOR A PIECE OF ADVICE ---
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const advice_id = searchParams.get('advice_id');

  if (!advice_id) {
    return NextResponse.json({ error: 'advice_id is required' }, { status: 400 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Call the database function we created
  const { data, error } = await supabase.rpc('get_vote_data', {
    p_advice_id: advice_id,
    p_user_id: user?.id,
  });

  if (error) {
    console.error("Error fetching vote data:", error);
    return NextResponse.json({ error: 'Failed to fetch vote data' }, { status: 500 });
  }

  return NextResponse.json(data);
}

// --- CAST (CREATE/UPDATE) A VOTE ---
export async function POST(request) {
  const { advice_id, vote_type } = await request.json();
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { data, error } = await supabase
    .from('votes')
    .upsert({
        advice_id: advice_id,
        user_id: user.id,
        vote_type: vote_type,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ message: "Vote already exists." }, { status: 200 });
    }
    console.error("Error upserting vote:", error);
    return NextResponse.json({ error: 'Failed to cast vote' }, { status: 500 });
  }

  return NextResponse.json(data);
}