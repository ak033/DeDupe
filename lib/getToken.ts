import { supabaseAdmin } from './supabaseAdmin';

export async function getGoogleAccessToken(userId: string) {
  const { data } = await supabaseAdmin
    .from('oauth_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!data) throw new Error('no token');

  if (Date.now() / 1000 < data.expires_at - 60) return data.access_token;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: data.refresh_token,
      grant_type: 'refresh_token',
    }),
  }).then(r => r.json() as any);

  await supabaseAdmin
    .from('oauth_tokens')
    .update({
      access_token: res.access_token,
      expires_at: Math.floor(Date.now() / 1000) + res.expires_in,
    })
    .eq('user_id', userId);

  return res.access_token as string;
}