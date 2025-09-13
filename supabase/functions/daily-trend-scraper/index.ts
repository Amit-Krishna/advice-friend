import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// --- CONFIGURATION ---
const RSS_FEED_URL = 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml';
const VALID_CATEGORIES = ['New Model', 'Tool', 'News', 'Library'];
// This is our safety valve to ensure the function finishes in time.
const MAX_ARTICLES_TO_PROCESS = 10;

// --- Helper function to parse XML/RSS ---
function parseRss(rssText: string) {
  const items = [];
  const itemRegex = /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<\/item>/g;
  let match;

  while ((match = itemRegex.exec(rssText)) !== null) {
    if (match[1] && match[2]) {
      const cleanedTitle = match[1].replace('<![CDATA[', '').replace(']]>', '').trim();
      items.push({
        title: cleanedTitle,
        link: match[2].trim()
      });
    }
  }
  return items;
}

// --- The Main Function ---
serve(async (req) => {
  // 1. Security Check
  const url = new URL(req.url);
  const providedKey = url.searchParams.get('secret');
  const cronSecret = Deno.env.get('CRON_SECRET');
  if (!cronSecret || providedKey !== cronSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  console.log("--- Starting Daily Trend Scraper (with article limit) ---");

  try {
    // 2. Initialize Clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
        throw new Error("Missing required environment variables.");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${geminiApiKey}`;
    
    // 3. Fetch and Parse the RSS Feed
    console.log(`Fetching and parsing RSS feed: ${RSS_FEED_URL}`);
    const response = await fetch(RSS_FEED_URL);
    const rssText = await response.text();
    const articles = parseRss(rssText);
    console.log(`Found ${articles.length} articles.`);

    if (articles.length === 0) {
      return new Response(JSON.stringify({ message: "No articles in RSS feed." }), { status: 200 });
    }

    let processedCount = 0;
    // --- LOOP WITH SAFETY LIMIT ---
    for (const article of articles) {
      // If we have already processed our max number of articles, stop.
      if (processedCount >= MAX_ARTICLES_TO_PROCESS) {
        console.log(`Reached processing limit of ${MAX_ARTICLES_TO_PROCESS}. Stopping.`);
        break; // Exit the loop immediately
      }
      
      const { title, link } = article;
      if (!title || !link) continue;
      
      console.log(`Processing: "${title}"`);

      // Duplicate check
      const { data: existing } = await supabaseAdmin.from('ai_trends').select('id').eq('link', link).single();
      if (existing) {
        console.log(` -> Duplicate, skipping.`);
        continue;
      }
      
      // AI analysis prompt
      const prompt = `You are an expert AI news analyst. I will provide the title of a news article. Your task is to return a JSON object with two fields:
      1. "summary": A concise, one-sentence summary of what the article is likely about.
      2. "category": Choose the single best category for this news from the following list: [${VALID_CATEGORIES.join(', ')}].

      Article Title: "${title}"

      Respond with ONLY the raw JSON object.`;

      const geminiResponse = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (!geminiResponse.ok) {
        console.error(` -> Gemini API Error for "${title}": ${await geminiResponse.text()}`);
        continue;
      }
      
      const geminiData = await geminiResponse.json();
      const rawText = geminiData.candidates[0].content.parts[0].text;
      const aiResult = JSON.parse(rawText.replace(/```json|```/g, '').trim());

      // Save to DB
      const { error } = await supabaseAdmin.from('ai_trends').insert({
        title, description: aiResult.summary, link, category: aiResult.category, is_published: true,
      });

      if (error) {
        console.error(` -> DB Insert Error for "${title}":`, error.message);
      } else {
        processedCount++; // Increment count only after a successful save
        console.log(` -> Success! Saved to database.`);
      }
    }

    return new Response(JSON.stringify({ message: `Scraping complete. ${processedCount} new trends added.` }), { status: 200 });
  } catch (error) {
    console.error("A critical error occurred:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});