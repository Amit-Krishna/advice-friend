// File: src/app/api/advice/[id]/route.js

import { createClient } from '@/lib/supabase/server';
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const adviceId = params.id;
    const supabase = createClient();

    const { data, error } = await supabase
        .from('advice')
        .select('*')
        .eq('id', adviceId)
        .single(); // .single() is crucial for getting one record

    if (error || !data) {
        return NextResponse.json({ error: 'Advice not found' }, { status: 404 });
    }

    return NextResponse.json(data);
}