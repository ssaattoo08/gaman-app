"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import PostContent from "@/components/PostContent";

export default function CheatdayPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCheatdayPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("gaman_logs")
        .select("id, content, created_at, user_id, profiles(nickname, username, icon_url), cheat_day, myrule, url_title")
        .eq("cheat_day", true)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setPosts(data);
      }
      setLoading(false);
    };
    fetchCheatdayPosts();
  }, []);

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    return jstDate.toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <main className="px-4 py-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-6 text-center text-yellow-400">チートデイ投稿一覧</h1>
      {loading ? (
        <p className="text-white text-center">読み込み中...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-400">まだチートデイ投稿がありません</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className={`x-post${post.myrule ? ' myrule-x-post' : ''} border-b border-gray-500`}>
              <div className="flex items-center mb-2 justify-between">
                <div className="flex items-center">
                  {post.profiles?.icon_url ? (
                    <img
                      src={post.profiles.icon_url}
                      alt="プロフィール画像"
                      style={{ width: 24, height: 24, borderRadius: 4, marginRight: 8, objectFit: 'cover', background: '#333' }}
                    />
                  ) : (
                    <div style={{width:24,height:24,background:'#333',borderRadius:4,marginRight:8}}></div>
                  )}
                  <Link href={`/user/${post.profiles?.username ?? ""}`} className="text-sm hover:underline">
                    {post.profiles?.nickname ? post.profiles.nickname : "名無し"}
                  </Link>
                  <span className="text-xs ml-3">{formatDate(post.created_at)}</span>
                </div>
                {post.myrule && (
                  <span className="text-xs font-bold" style={{ color: '#bfa100', background: 'transparent', borderRadius: '8px', padding: '2px 8px', fontFamily: 'Meiryo UI, Meiryo, sans-serif', opacity: 0.85, fontWeight: 600, fontSize: '12px', letterSpacing: 1 }}>
                    MyRule
                  </span>
                )}
              </div>
              <PostContent content={post.content} url_title={post.url_title} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
} 