"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from '@/lib/supabase/client';
import ReactMarkdown from "react-markdown";
import { CATEGORIES } from '../lib/categories';

export default function HomePage() {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [currentAdviceId, setCurrentAdviceId] = useState(null);
  const [voteScore, setVoteScore] = useState(0);
  const [userVote, setUserVote] = useState(0);
  const [session, setSession] = useState(null);
  const [adviceLevel, setAdviceLevel] = useState('Auto');
  
  const supabase = createClient();
  const resultsRef = useRef(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    getSession();
  }, [supabase]);

  useEffect(() => {
    if (loading) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setError(null);
    setLoading(true);
    setIsSaved(false);
    setAnswer("");
    setCurrentAdviceId(null);
    setVoteScore(0);
    setUserVote(0);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input, level: adviceLevel }),
      });
      if (!response.ok) throw new Error(`API request failed`);
      const data = await response.json();
      setAnswer(data.answer);
      setCurrentAdviceId(data.adviceId);
      if (data.adviceId) {
        const voteResponse = await fetch(`/api/votes?advice_id=${data.adviceId}`);
        if (voteResponse.ok) {
          const voteData = await voteResponse.json();
          setVoteScore(voteData.score);
          setUserVote(voteData.user_vote);
        }
      }
    } catch (err) {
      setError("Sorry, something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentAdviceId) return;
    try {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advice_id: currentAdviceId }),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (newVoteType) => {
    if (!currentAdviceId || !session) return;
    const originalUserVote = userVote;
    const originalVoteScore = voteScore;
    let newUserVote = newVoteType;
    if (newVoteType === userVote) {
      newUserVote = 0;
    }
    setUserVote(newUserVote);
    let scoreChange = newUserVote - originalUserVote;
    setVoteScore(originalVoteScore + scoreChange);
    try {
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advice_id: currentAdviceId,
          vote_type: newUserVote
        }),
      });
      if (!response.ok) {
        setUserVote(originalUserVote);
        setVoteScore(originalVoteScore);
      }
    } catch (err) {
      setUserVote(originalUserVote);
      setVoteScore(originalVoteScore);
      console.error("Failed to cast vote:", err);
    }
  };

  return (
    <>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center text-gray-800 mb-2">
        The Smartest Advice Friend
      </h1>
      <p className="text-center text-gray-500 mb-8">
        AI-powered advice on anything.
      </p>

      <form onSubmit={handleSubmit} className="w-full mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-grow w-full">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything..." className="w-full p-4 pr-20 rounded-full bg-white border border-gray-300 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow" disabled={loading} />
            <button type="submit" className="absolute top-1/2 right-2 -translate-y-1/2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-300" disabled={loading || !input.trim()}>
              {loading ? "Thinking..." : "Ask"}
            </button>
          </div>
          <div className="relative mt-2 sm:mt-0">
            <select value={adviceLevel} onChange={(e) => setAdviceLevel(e.target.value)} className="appearance-none w-full sm:w-auto bg-white border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Auto">Auto Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>
      </form>
      
      {!loading && !answer && !error && (
        <div className="w-full mt-12">
          <p className="text-center text-sm text-gray-500 mb-4">Or browse by category</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((category) => (
              <Link href={`/category/${encodeURIComponent(category.slug)}`} key={category.slug} className="flex flex-col items-center justify-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-500 transition-all">
                <span className="text-4xl mb-2">{category.icon}</span>
                <span className="font-semibold text-gray-700 text-center">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      <div ref={resultsRef} className="w-full mt-8">
        {loading && <p className="text-center text-gray-500 py-4">Thinking...</p>}
        {error && <p className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</p>}
        
        {answer && (
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="prose text-gray-800 lg:prose-xl max-w-none">
              <ReactMarkdown>{answer}</ReactMarkdown>
            </div>
            
            {session && currentAdviceId && (
              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleVote(1)} className="p-2 rounded-full hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${userVote === 1 ? 'text-green-600' : 'text-gray-500 hover:text-green-600'}`} fill={userVote === 1 ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <span className="font-bold text-lg text-gray-700 w-8 text-center">{voteScore}</span>
                  <button onClick={() => handleVote(-1)} className="p-2 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${userVote === -1 ? 'text-red-600' : 'text-gray-500 hover:text-red-600'}`} fill={userVote === -1 ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaved}
                  className="px-4 py-2 text-sm font-semibold rounded-md transition-colors disabled:bg-green-100 disabled:text-green-700 bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {isSaved ? '✓ Saved!' : 'Save to Bookmarks'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}