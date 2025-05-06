// lib/getToken.ts
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface GoogleTokenRes {
  access_token: string;
  expires_in: number; // seconds
}

export async function getGoogleAccessToken(userId: string): Promise<string> {
  // 1 · Fetch stored tokens for this user
  const { data, error } = await supabaseAdmin
    .from('oauth_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) throw new Error('No stored refresh token for user');

  // 2 · If the current access‑token is still valid (60 s buffer) → return it
  if (Date.now() / 1000 < data.expires_at - 60) {
    return data.access_token;
  }

  // 3 · Otherwise use the refresh_token to get a new access_token
  const tokenRes: GoogleTokenRes = await (
    await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: data.refresh_token,
        grant_type: 'refresh_token',
      }),
    })
  ).json();

  // 4 · Persist the new access_token + expiry
  await supabaseAdmin
    .from('oauth_tokens')
    .update({
      access_token: tokenRes.access_token,
      expires_at: Math.floor(Date.now() / 1000) + tokenRes.expires_in,
    })
    .eq('user_id', userId);

  return tokenRes.access_token;
}
