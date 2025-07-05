import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fetchTitle(url: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
    const json = await res.json();
    if (json.status === 'success' && json.data.title) {
      return json.data.title;
    }
    return null;
  } catch {
    return null;
  }
}

function extractFirstUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { user_id, content, cheat_day, myrule } = req.body;
  if (!user_id || !content) {
    return res.status(400).json({ error: 'user_idとcontentは必須です' });
  }
  let url_title: string | null = null;
  const url = extractFirstUrl(content);
  if (url) {
    url_title = await fetchTitle(url);
  }
  const { error } = await supabase.from('gaman_logs').insert({
    user_id,
    content,
    cheat_day,
    myrule,
    url_title,
  });
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json({ message: '投稿完了', url_title });
} 