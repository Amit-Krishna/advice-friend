// File: src/app/api/search/route.js (Upgraded with Filter Logic)

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const category = searchParams.get('category'); // <<< Get the new category parameter

  if (!query) {
    return NextResponse.json({ error: "Search query is required" }, { status: 400 });
  }

   const supabase = createClient();

  // Start building the query
  let queryBuilder = supabase
    .from("advice")
    .select("id, question, answer, category, created_at")
    .textSearch('fts', query, {
        type: 'websearch',
        config: 'english'
    });

  // --- CONDITIONAL FILTERING ---
  // If a category is provided (and it's not 'all'), add an .eq() filter to the query
  if (category && category !== 'all') {
    queryBuilder = queryBuilder.eq('category', category);
  }
  // ---------------------------

  // Execute the final query
  const { data, error } = await queryBuilder;

  if (error) {
    console.error("Error performing search:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }

  return NextResponse.json(data);
}