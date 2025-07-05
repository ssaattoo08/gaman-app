"use client"

import { useEffect, useState, useRef } from "react"
import BottomNav from "@/components/BottomNav"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import PostContent from "../../components/PostContent"

// リアクション・コメント機能を一時的にクローズ
const GAMAN_REACTIONS = [
  { type: "erai", label: "えらい" },
  { type: "sugoi", label: "すごい" },
  { type: "shinpai", label: "心配" },
]
const CHEATDAY_REACTIONS = [
  { type: "ii", label: "たまにはいいよね" },
  { type: "eh", label: "えっ" },
  { type: "ganbaro", label: "明日からがんばろ" },
]

export default function TimelinePage() {
  const [posts, setPosts] = useState<any[]>([])
  // const [reactions, setReactions] = useState<any[]>([])
  // const [comments, setComments] = useState<any[]>([])
  // const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'gaman' | 'cheatday'>('gaman')
  const isMountedRef = useRef(true)
  const [content, setContent] = useState("")
  const [posting, setPosting] = useState(false)
  const [cheatDay, setCheatDay] = useState(false)
  const [myRule, setMyRule] = useState(false)
  const router = useRouter()

  useEffect(() => {
    isMountedRef.current = true

    const fetchData = async () => {
      const { data: postsData, error: postsError } = await supabase
        .from("gaman_logs")
        .select("id, content, created_at, user_id, profiles(nickname, username), cheat_day, myrule, url_title")
        .order("created_at", { ascending: false })

      // リアクション・コメント機能を一時的にクローズ
      // const { data: reactionsData, error: reactionsError } = await supabase
      //   .from("reactions")
      //   .select("id, post_id, user_id, type")

      // const { data: commentsData, error: commentsError } = await supabase
      //   .from("comments")
      //   .select("id, post_id, user_id, content, created_at, profiles(nickname)")
      //   .order("created_at", { ascending: true })

      const { data: { user } } = await supabase.auth.getUser()
      
      if (isMountedRef.current) {
        setUserId(user?.id ?? null)

        if (!postsError) {
          setPosts(postsData)
          // setReactions(reactionsData)
          // setComments(commentsData)
          console.log("postsData:", postsData)
          console.log("cheat_day一覧:", postsData.map(p => p.cheat_day))
        }
        setLoading(false)
      }
    }
    fetchData()

    return () => {
      isMountedRef.current = false
    }
  }, [])

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
  }

  // リアクション・コメント機能を一時的にクローズ
  // const getReactionCount = (postId: string, type: string) =>
  //   reactions.filter(r => r.post_id === postId && r.type === type).length

  // const hasReacted = (postId: string, type: string) =>
  //   reactions.some(r => r.post_id === postId && r.type === type && r.user_id === userId)

  // const handleReaction = async (postId: string, type: string) => {
  //   if (!userId) {
  //     alert("ログインしてください")
  //     return
  //   }
  //   if (hasReacted(postId, type)) {
  //     const { error } = await supabase
  //       .from("reactions")
  //       .delete()
  //       .match({ post_id: postId, user_id: userId, type })
  //     if (!error) {
  //       setReactions(prev => prev.filter(
  //         r => !(r.post_id === postId && r.user_id === userId && r.type === type)
  //       ))
  //     }
  //   } else {
  //     const { error } = await supabase.from("reactions").insert({
  //       post_id: postId,
  //       user_id: userId,
  //       type,
  //     })
  //     if (!error) {
  //       setReactions(prev => [...prev, { post_id: postId, user_id: userId, type }])
  //     }
  //   }
  // }

  // const handleCommentInput = (postId: string, value: string) => {
  //   setCommentInputs((prev) => ({ ...prev, [postId]: value }))
  // }

  // const handleCommentSubmit = async (postId: string) => {
  //   if (!userId) {
  //     alert("ログインしてください")
  //     return
  //   }
  //   const content = commentInputs[postId]?.trim()
  //   if (!content) return
  //   const { error, data } = await supabase.from("comments").insert({
  //     post_id: postId,
  //     user_id: userId,
  //     content,
  //   })
  //   if (!error) {
  //     setComments(prev => [...prev, { post_id: postId, user_id: userId, content, created_at: new Date().toISOString(), profiles: { nickname: "あなた" } }])
  //     setCommentInputs((prev) => ({ ...prev, [postId]: "" }))
  //   }
  // }

  // 投稿の絞り込み
  const filteredPosts = posts.filter(post =>
    selectedTab === 'gaman'
      ? post.cheat_day === false || post.cheat_day === null || post.cheat_day === undefined
      : post.cheat_day === true
  );

  // const REACTION_TYPES = selectedTab === 'gaman' ? GAMAN_REACTIONS : CHEATDAY_REACTIONS;

  const handlePostSubmit = async (cheatDay: boolean) => {
    setPosting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert("ログインが必要です")
      router.push("/login")
      return
    }
    try {
      const res = await fetch("/api/postWithTitle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          content: content.trim(),
          cheat_day: cheatDay,
          myrule: myRule,
        })
      });
      const result = await res.json();
      if (!res.ok) {
        alert("投稿に失敗しました: " + (result.error || ""));
        setPosting(false);
        return;
      }
      setContent("");
      setMyRule(false);
      // 投稿後に再取得
      setLoading(true)
      const { data: postsData, error: postsError } = await supabase
        .from("gaman_logs")
        .select("id, content, created_at, user_id, profiles(nickname, username), cheat_day, myrule, url_title")
        .order("created_at", { ascending: false })
      if (!postsError) {
        setPosts(postsData)
      }
      setLoading(false)
    } catch (e) {
      alert("投稿に失敗しました");
      console.error(e);
    }
    setPosting(false)
  }

  return (
    <>
      <main className="px-4 py-6 max-w-xl mx-auto">
        {/* 投稿フォーム */}
        <div className="mb-6 flex items-start gap-3">
          {/* プロフィール画像枠（ダミー） */}
          <div style={{width:40,height:40,background:'#333',borderRadius:8,marginTop:2,flexShrink:0}}></div>
          <div className="flex-1 flex flex-col">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full h-12 p-3 rounded-xl bg-gray-800 text-white text-base resize-none mb-2"
              placeholder={
                selectedTab === 'cheatday'
                  ? '例：大好きなお酒を思う存分飲みまくった'
                  : myRule
                    ? '例：通勤電車で寝ずに本を読んだ'
                    : 'いまどうしてる？'
              }
              style={{minHeight:'40px',maxHeight:'80px'}}
            />
            {/* アイコン群（ダミー） */}
            <div className="flex items-center mt-1 mb-1 gap-3 text-blue-400 text-xl">
              <span className="cursor-pointer">🖼️</span>
              <span className="cursor-pointer">GIF</span>
              <span className="cursor-pointer">🖊️</span>
              <span className="cursor-pointer">😊</span>
              <span className="cursor-pointer">📷</span>
              <span className="cursor-pointer">📍</span>
            </div>
          </div>
          <button
            onClick={() => handlePostSubmit(selectedTab === 'cheatday')}
            disabled={posting || !content.trim()}
            className={`ml-2 px-4 py-2 rounded-full font-bold transition-all duration-150 shadow text-base cursor-pointer ${posting || !content.trim() ? 'opacity-60 bg-blue-400' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            style={{ fontSize: '15px', minWidth: '80px', height: '38px', borderRadius: '9999px', alignSelf: 'flex-end' }}
          >
            {posting ? '投稿中...' : selectedTab === 'cheatday' ? 'チートデイとして投稿' : '投稿する'}
          </button>
        </div>
        {/* タブUI */}
        <div className="flex mb-4 gap-2">
          <button
            className={`flex-[7] py-2 font-bold transition rounded-t-2xl shadow cursor-pointer ${selectedTab === 'gaman' ? 'bg-black text-white relative z-10' : 'bg-gray-700 text-gray-400 opacity-70'}`}
            style={selectedTab === 'gaman' ? { boxShadow: '0 4px 12px rgba(0,0,0,0.2)' } : {}}
            onClick={() => setSelectedTab('gaman')}
          >
            <span className="block">
              ガマン / MyRule
              {selectedTab === 'gaman' && (
                <span style={{
                  display: 'block',
                  margin: '4px auto 0',
                  width: '40px',
                  height: '4px',
                  background: '#fff',
                  borderRadius: '2px'
                }} />
              )}
            </span>
          </button>
          <button
            className={`flex-[3] py-2 font-bold transition rounded-t-2xl shadow cursor-pointer ${selectedTab === 'cheatday' ? 'bg-black text-white relative z-10' : 'bg-gray-700 text-gray-400 opacity-70'}`}
            style={selectedTab === 'cheatday' ? { boxShadow: '0 4px 12px rgba(0,0,0,0.2)' } : {}}
            onClick={() => setSelectedTab('cheatday')}
          >
            <span className="block">
              チートデイ
              {selectedTab === 'cheatday' && (
                <span style={{
                  display: 'block',
                  margin: '4px auto 0',
                  width: '40px',
                  height: '4px',
                  background: '#fff',
                  borderRadius: '2px'
                }} />
              )}
            </span>
          </button>
        </div>
        {/* 投稿一覧 */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-white text-center">読み込み中...</p>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className={`x-post${post.myrule ? ' myrule-x-post' : ''}`}
              >
                {post.myrule && (
                  <span
                    className="absolute top-2 right-4 text-xs font-bold"
                    style={{
                      color: '#bfa100',
                      background: 'transparent',
                      borderRadius: '8px',
                      padding: '2px 8px',
                      fontFamily: 'Meiryo UI, Meiryo, sans-serif',
                      opacity: 0.85,
                      fontWeight: 600,
                      fontSize: '12px',
                      letterSpacing: 1,
                    }}
                  >
                    MyRule
                  </span>
                )}
                <div className="flex items-center mb-2">
                  <div style={{width:24,height:24,background:'#333',borderRadius:4,marginRight:8}}></div>
                  <Link href={`/user/${post.profiles?.username ?? ""}`} className="text-sm hover:underline" style={post.myrule ? { color: '#bfa100', fontWeight: 600 } : {}}>
                    {post.profiles?.nickname ? post.profiles.nickname : ""}
                  </Link>
                  <span className="text-xs ml-3" style={post.myrule ? { color: '#bfa100', fontWeight: 600 } : {}}>{formatDate(post.created_at)}</span>
                </div>
                <PostContent content={post.content} url_title={post.url_title} />
              </div>
            ))
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
