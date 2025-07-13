import 'dotenv/config';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fetchTitle(url: string): Promise<string | null> {
  try {
    const res = await axios.get(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
    const json = res.data;
    if (json.status === 'success' && json.data.title) {
      return json.data.title;
    }
    return null;
  } catch (e) {
    console.error('axios error for url:', url, e);
    return null;
  }
}

function extractFirstUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s]+/);
  return match ? match[0] : null;
}

export async function batchAssignTitles() {
  console.log('posts取得開始');
  // url_titleがNULLの投稿を全件取得
  const { data: posts, error } = await supabase
    .from('gaman_logs')
    .select('id, content')
    .is('url_title', null);
  if (error) {
    console.error('取得エラー:', error);
    return;
  }
  if (!posts || posts.length === 0) {
    console.log('未処理の投稿はありません');
    return;
  }
  for (const post of posts) {
    const url = extractFirstUrl(post.content);
    if (!url) continue;
    const title = await fetchTitle(url);
    if (!title) continue;
    const { error: updateError } = await supabase
      .from('gaman_logs')
      .update({ url_title: title })
      .eq('id', post.id);
    if (updateError) {
      console.error('更新エラー:', updateError, 'id:', post.id);
    } else {
      console.log('タイトル付与:', title, 'id:', post.id);
    }
  }
  console.log('バッチ処理完了');
}

// 実行用
batchAssignTitles().then(() => process.exit()); 