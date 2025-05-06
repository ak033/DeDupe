'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useState } from 'react';

export default function Dashboard() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [scanId, setScanId] = useState<string | null>(null);

  async function startScan() {
    // 1 · Get the current user from the Supabase session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Not logged in');

    // 2 · Call the scans API with user_id
    const res = await fetch('/api/scans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id }),
    });

    if (!res.ok) {
      const { error } = await res.json();
      return alert(`Scan error: ${error}`);
    }

    // 3 · Show scanId to confirm it started
    const { id } = await res.json();
    setScanId(id);
    alert('Scan started! ID: ' + id);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-white">
      <button
        onClick={startScan}
        className="rounded bg-blue-600 px-6 py-3 hover:bg-blue-700"
      >
        Start Google Drive Scan
      </button>

      {scanId && <p className="mt-4">Scan queued: {scanId}</p>}
    </main>
  );
}
