// File: src/app/api/trends/route.js
import { createClient } from '@/lib/supabase/server'; 
import { NextResponse } from "next/server";

export async function GET(request) {
    const supabase = createClient();
    
    // Fetch all trends that are marked as published, newest first.
    const { data, error } = await supabase
        .from('ai_trends')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

    if (error) {
        console.error("Error fetching trends:", error);
        return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
    }
    
    return NextResponse.json(data);
}