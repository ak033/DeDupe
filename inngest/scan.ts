import { inngest } from './client';
import { google } from 'googleapis';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getGoogleAccessToken } from '@/lib/getToken';

export const driveScan = inngest.createFunction(
  { id: 'drive-scan', name: 'Drive Scan' },
  { event: 'scan/started' },
  async ({ event, step }) => {
    const { scanId, userId } = event.data;

    // 1. Get token
    const accessToken = await getGoogleAccessToken(userId);

    const drive = google.drive({ version: 'v3', auth: accessToken });

    // 2. List files and group by hash+size
    let pageToken: string | undefined;
    const hashMap = new Map<string, any[]>();

    do {
      const res = await drive.files.list({
        fields: 'nextPageToken, files(id,name,md5Checksum,size,parents)',
        spaces: 'drive',
        pageSize: 1000,
        pageToken,
      });
      pageToken = res.data.nextPageToken || undefined;

      for (const f of res.data.files ?? []) {
        const key = `${f.md5Checksum}_${f.size}`;
        if (!hashMap.has(key)) hashMap.set(key, []);
        hashMap.get(key)!.push(f);
      }

      // Update progress (fake for now)
      await supabaseAdmin
        .from('scans')
        .update({ percent_complete: 50 })
        .eq('id', scanId);
    } while (pageToken);

    // 3. Persist duplicates
    for (const [, files] of hashMap) {
      if (files.length < 2) continue;
      await supabaseAdmin
        .from('file_meta')
        .insert(
          files.map(f => ({
            scan_id: scanId,
            file_id: f.id,
            path: f.parents?.[0] ?? '',
            md5: f.md5Checksum,
            size: f.size,
            is_duplicate: true,
          }))
        );
    }

    await supabaseAdmin.from('scans')
      .update({ status: 'complete', percent_complete: 100 })
      .eq('id', scanId);
  }
);