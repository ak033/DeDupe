import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  const { user_id, access_token, refresh_token, expires_in } = await req.json();

  if (!user_id) return NextResponse.json({ error: 'unauth' }, { status: 401 });

  await admin.from('oauth_tokens').upsert({
    user_id,
    provider: 'google',
    access_token,
    refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + expires_in,
  });

  return NextResponse.json({ ok: true });
}
