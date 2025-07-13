"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import PostContent from "@/components/PostContent";

export default function CheatdayPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [reactions, setReactions] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReactionModal, setShowReactionModal] = useState<{ open: boolean, postId: string | null, type: string | null }>({ open: false, postId: null, type: null });
  const isMountedRef = useRef(true);

  // 投稿一覧取得関数をuseEffect外に
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

  // リアクション一覧取得
  const fetchReactions = async () => {
    const { data, error } = await supabase
      .from("reactions")
      .select("id, post_id, user_id, type, profiles(nickname)");
    if (!error && data) {
      setReactions(data);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchCheatdayPosts();
    fetchReactions();
    // ユーザーID取得
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (isMountedRef.current) setUserId(user?.id ?? null);
    })();
    return () => { isMountedRef.current = false; };
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

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("ログインが必要です");
      setPosting(false);
      return;
    }
    const { error } = await supabase
      .from("gaman_logs")
      .insert([
        {
          user_id: user.id,
          content,
          cheat_day: true,
          myrule: false,
          url_title: "",
        },
      ]);
    if (!error) {
      setContent("");
      await fetchCheatdayPosts(); // 投稿後に再取得
    }
    setPosting(false);
  };

  // --- リアクション関連 ---
  const REACTION_TYPE = "ii";
  const REACTION_LABEL = "たまにはいいよね";

  const getReactionCount = (postId: string) =>
    reactions.filter(r => r.post_id === postId && r.type === REACTION_TYPE).length;

  const hasReacted = (postId: string) =>
    reactions.some(r => r.post_id === postId && r.type === REACTION_TYPE && r.user_id === userId);

  const handleReaction = async (postId: string) => {
    if (!userId) {
      alert("ログインしてください");
      return;
    }
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (hasReacted(postId)) {
        // 削除
        const { error } = await supabase
          .from("reactions")
          .delete()
          .match({ post_id: postId, user_id: userId, type: REACTION_TYPE });
        if (error) {
          alert("リアクション削除に失敗しました: " + error.message);
          return;
        }
        setReactions(prev => prev.filter(
          r => !(r.post_id === postId && r.user_id === userId && r.type === REACTION_TYPE)
        ));
        await fetchReactions();
      } else {
        // 追加
        const { error } = await supabase.from("reactions").insert({
          post_id: postId,
          user_id: userId,
          type: REACTION_TYPE,
        });
        if (error) {
          alert("リアクション追加に失敗しました: " + error.message);
          return;
        }
        setReactions(prev => [...prev, { post_id: postId, user_id: userId, type: REACTION_TYPE }]);
        await fetchReactions();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // リアクションした人のニックネーム取得
  const getReactionUserNicknames = (postId: string) => {
    return reactions
      .filter(r => r.post_id === postId && r.type === REACTION_TYPE)
      .map(r => r.profiles?.nickname || "名無し");
  };

  return (
    <main className="px-4 py-6 max-w-xl mx-auto">
      {/* 投稿フォーム */}
      <div className="mb-6 flex items-start w-full">
        <div className="flex-1 flex flex-col w-full relative">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full p-4 pb-14 rounded-xl bg-gray-800 text-white resize-none mb-2 placeholder:text-xs text-xs"
            placeholder={"たまにはいいよね！チートデイ！\n例：大好きなお酒を飲みまくった"}
            style={{minHeight:'60px',height:'80px',maxHeight:'120px', fontSize:'13px', width:'100%'}}
          />
          <button
            onClick={handlePostSubmit}
            disabled={posting || !content.trim()}
            className={`absolute bottom-4 right-4 flex items-center justify-center rounded-full font-bold transition-all duration-150 shadow text-xs cursor-pointer ${posting || !content.trim() ? 'opacity-60 bg-gray-500' : 'bg-gray-500 hover:bg-gray-600 text-white'}`}
            style={{ fontSize: '11px', width: '36px', height: '36px', borderRadius: '50%' }}
          >
            Post
          </button>
        </div>
      </div>
      {/* 投稿一覧 */}
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
              {/* リアクションボタン */}
              <div className="flex items-center mt-3">
                <button
                  onClick={() => handleReaction(post.id)}
                  disabled={isProcessing}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    hasReacted(post.id)
                      ? 'bg-yellow-500 text-gray-900 shadow-md'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  } ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <span>{REACTION_LABEL}</span>
                  <span
                    className="ml-1 text-xs opacity-80 cursor-pointer underline hover:text-yellow-400"
                    onClick={e => { e.stopPropagation(); setShowReactionModal({ open: true, postId: post.id, type: REACTION_TYPE }); }}
                  >
                    {getReactionCount(post.id)}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* リアクションした人のニックネーム表示モーダル */}
      {showReactionModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 min-w-[220px] max-w-xs relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setShowReactionModal({ open: false, postId: null, type: null })}>×</button>
            <h2 className="text-lg font-bold mb-4 text-white text-center">リアクションした人</h2>
            <ul className="space-y-2">
              {showReactionModal.postId && getReactionUserNicknames(showReactionModal.postId).length > 0 ? (
                getReactionUserNicknames(showReactionModal.postId).map((nickname, idx) => (
                  <li key={idx} className="text-center text-white bg-gray-800 rounded px-2 py-1">{nickname}</li>
                ))
              ) : (
                <li className="text-center text-gray-400">まだ誰もリアクションしていません</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </main>
  );
} 