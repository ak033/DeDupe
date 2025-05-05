'use client';

import { createBrowserClient } from '@supabase/ssr';

export default function Home() {
  // initialise Supabase client in the browser
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/drive.readonly',
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <button
        onClick={handleGoogleSignIn}
        className="rounded bg-green-600 px-6 py-3 text-lg font-semibold hover:bg-green-700"
      >
        Connect Google Drive
      </button>
    </main>
  );
}
