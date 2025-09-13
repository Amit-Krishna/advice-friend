// File: src/components/AuthUI.js

"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function AuthUI() {
  const supabase = createClientComponentClient();

  return (
    <div className="max-w-md mx-auto">
      <Auth
        supabaseClient={supabase}
        view="magic_link"
        appearance={{ theme: ThemeSupa }}
        theme="dark"
        showLinks={false}
        providers={["google", "github"]}
        redirectTo={`${location.origin}/auth/callback`}
      />
    </div>
  );
}