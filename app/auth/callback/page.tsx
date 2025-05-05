// app/auth/callback/page.tsx
'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // exchange the auth code automatically, then grab tokens
    supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session;
      if (!session) {
        router.replace('/?error=auth');
        return;
      }

      // POST tokens to an internal API route
      await fetch('/api/store-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: session.user.id,
          access_token: session.provider_token,
          refresh_token: session.refresh_token,
          expires_in: session.expires_in,
        }),
      });

      // redirect user to dashboard or home
      router.replace('/dashboard');
    });
  }, [router, supabase]);

  return (
    <main className="min-h-screen flex items-center justify-center text-white">
      <p>Finishing sign‑in…</p>
    </main>
  );
}
