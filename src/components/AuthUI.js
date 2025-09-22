// File: src/components/AuthUI.js

"use client";
// --- THIS IS THE FIX ---
// We import our central client creation function instead of the old helper
import { createClient } from '@/lib/supabase/client';
// --------------------
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function AuthUI() {
  // --- THIS IS THE FIX ---
  // We create the client using our new function
  const supabase = createClient();
  // --------------------

  return (
    <div className="max-w-md mx-auto">
      <Auth
        supabaseClient={supabase}
        view="magic_link"
        appearance={{ theme: ThemeSupa }}
        theme="dark"
        showLinks={false}
        providers={["google", "github"]}
        // The redirectTo URL should point to your live site in production,
        // but for local dev, this is fine. Vercel handles this automatically.
        redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
      />
    </div>
  );
}