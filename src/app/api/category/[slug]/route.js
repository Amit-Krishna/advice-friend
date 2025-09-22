// File: src/app/api/category/[slug]/route.js

import { createClient } from '@/lib/supabase/server';
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const categorySlug = params.slug; // Extracts 'coding' from '/api/category/coding'
  const supabase = createClient();

  if (!categorySlug) {
    return NextResponse.json({ error: "Category slug is required" }, { status: 400 });
  }

  // We need to decode the URL component in case it has spaces etc. (e.g., 'Tech%20&%20AI')
  const decodedCategory = decodeURIComponent(categorySlug);

  const { data, error } = await supabase
    .from("advice")
    .select("id, question, answer, created_at, category")
    .eq("category", decodedCategory)
    .order("created_at", { ascending: false }); // Show newest first

  if (error) {
    console.error("Error fetching advice by category:", error);
    return NextResponse.json({ error: "Failed to fetch advice" }, { status: 500 });
  }

  return NextResponse.json(data);
}