import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@/lib/supabase/server'; 
import { NextResponse } from "next/server";

// --- Our Predefined List of Categories ---
const categories = [
  'Entertainment', 'Tech & AI', 'Education', 'Career', 
  'Coding', 'Life Hacks', 'Health', 'General/Other'
];

// --- A Helper Function for AI-Powered Classification ---
async function getCategoryForQuestion(question, genAI) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const prompt = `Your task is to perform text classification. I will provide a user's question and a list of categories. You must respond with only the single most relevant category name from the list.

    Available Categories:
    [${categories.join(', ')}]

    User Question:
    "${question}"

    Example:
    User Question: "What are the best fantasy movies to watch?"
    Your Response: Entertainment

    Your entire response must be ONLY ONE of the category names from the list. You must choose the single best category, even if the fit is not perfect.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const categoryText = response.text().trim();
    
    const categoryRegex = new RegExp(`\\b(${categories.join('|')})\\b`, 'i');
    const match = categoryText.match(categoryRegex);

    if (match && match[1]) {
      const matchedCategory = categories.find(c => c.toLowerCase() === match[1].toLowerCase());
      return matchedCategory || 'General/Other';
    } else {
      console.warn(`AI response "${categoryText}" did not match any category via regex. Falling back.`);
      return 'General/Other';
    }
  } catch (error) {
    console.error("Error in AI categorization:", error);
    return 'General/Other';
  }
}

// --- Our Main API Function (Upgraded with Contextual Levels) ---
export async function POST(req) {
  // 1. Receive the new 'level' parameter from the frontend
  const { question, level = 'Auto' } = await req.json();
  const supabase = createClient();

  if (!question) {
    return new Response(JSON.stringify({ error: "Question is required" }), { status: 400 });
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // 2. Create a dynamic instruction based on the selected level
    let levelInstruction = ''; // Default for 'Auto' level
    if (level === 'Beginner') {
      levelInstruction = "IMPORTANT: The user has requested a beginner-level explanation. Explain the topic in the simplest terms possible. Use short sentences and common analogies. Avoid all technical jargon.";
    } else if (level === 'Intermediate') {
      levelInstruction = "IMPORTANT: The user has requested an intermediate-level explanation. Assume they have some foundational knowledge. You can include common technical terms but should define them clearly.";
    } else if (level === 'Expert') {
      levelInstruction = "IMPORTANT: The user has requested an expert-level explanation. Be highly technical, thorough, and nuanced. Use precise, professional terminology as you would with a peer in the field.";
    }

    // --- Main Logic in Parallel ---
    const [answerResponse, category] = await Promise.all([
      // Task 1: Generate the detailed, level-aware answer
      (async () => {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
        
        // 3. Inject the dynamic instruction into our main prompt
        const prompt = `Act as a world-class expert advisor. ${levelInstruction} 
        
        Your response must be structured in three parts:
        1. A direct answer or solution.
        2. A step-by-step reasoning or explanation.
        3. A list of 3-5 relevant, high-quality links to external resources.

        User's Question: "${question}"
        
        Format your entire response in Markdown.`;
        
        const result = await model.generateContent(prompt);
        return result.response.text();
      })(),
      // Task 2: Classify the question into a category
      getCategoryForQuestion(question, genAI)
    ]);
    
    // The rest of the function (saving to DB, returning response) remains the same
    const { data: newAdvice, error: insertError } = await supabase
      .from('advice')
      .insert({
        question: question,
        answer: answerResponse,
        user_id: user?.id,
        category: category,
      })
      .select('id')
      .single();
    
    if (insertError) {
      console.error("Error saving advice to DB:", insertError);
      return new Response(JSON.stringify({ answer: answerResponse, adviceId: null }));
    }
    
    return new Response(JSON.stringify({ answer: answerResponse, adviceId: newAdvice.id }));

  } catch (error) {
    console.error("Error in ask API:", error);
    return new Response(JSON.stringify({ error: "Failed to get response" }), { status: 500 });
  }
}