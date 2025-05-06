// app/api/scans/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { inngest } from '@/inngest/client';      // you’ll create this file next

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  const { user_id } = await req.json();
  if (!user_id) {
    return NextResponse.json({ error: 'missing user_id' }, { status: 400 });
  }

  // 1 · insert a new scan row
  const { data: scan, error } = await admin
    .from('scans')
    .insert({ user_id, provider: 'google', status: 'queued' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2 · kick off the background worker
  await inngest.send({
    name: 'scan/started',
    data: { scanId: scan.id, userId: user_id },
  });

  return NextResponse.json({ id: scan.id });
}
