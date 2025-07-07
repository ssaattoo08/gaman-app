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
        .select("id, content, created_at, user_id, profiles(nickname, username, icon_url), cheat_day, myrule, url_title")
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
        .select("id, content, created_at, user_id, profiles(nickname, username, icon_url), cheat_day, myrule, url_title")
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
        <div className="mb-6 flex items-start w-full">
          <div className="flex-1 flex flex-col w-full relative">
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full p-4 pb-14 rounded-xl bg-gray-800 text-white resize-none mb-2 placeholder:text-xs text-xs"
              placeholder={
                selectedTab === 'cheatday'
                  ? '例：大好きなお酒を思う存分飲みまくった'
                  : myRule
                    ? 'MyRule例：通勤電車で本を読む'
                    : 'ガマン例：飲み会を断り生成AIの勉強をした'
              }
              style={{minHeight:'60px',height:'80px',maxHeight:'120px', fontSize:'13px', width:'100%'}}
            />
            {/* MyRuleチェックボックスをテキストエリア内左下に絶対配置 */}
            {selectedTab === 'gaman' && (
              <label className="absolute bottom-4 left-4 flex items-center text-gray-300 text-xs" style={{userSelect:'none'}}>
                <input
                  type="checkbox"
                  checked={myRule}
                  onChange={e => setMyRule(e.target.checked)}
                  className="mr-1 accent-blue-500 w-4 h-4"
                  style={{verticalAlign:'middle'}}
                />
                <span style={{lineHeight:'1.2'}}>MyRuleとして投稿</span>
              </label>
            )}
            {/* Postボタンをテキストエリア内右下にしっかり収める */}
            <button
              onClick={() => handlePostSubmit(selectedTab === 'cheatday')}
              disabled={posting || !content.trim()}
              className={`absolute bottom-4 right-4 flex items-center justify-center rounded-full font-bold transition-all duration-150 shadow text-xs cursor-pointer ${posting || !content.trim() ? 'opacity-60 bg-gray-500' : 'bg-gray-500 hover:bg-gray-600 text-white'}`}
              style={{ fontSize: '11px', width: '36px', height: '36px', borderRadius: '50%' }}
            >
              Post
            </button>
          </div>
        </div>
        {/* タブUI */}
        {/* <div className="flex mb-4 gap-2"> ... </div> */}
        {/* 投稿一覧 */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-white text-center">読み込み中...</p>
          ) : (
            posts.filter(post => post.cheat_day !== true).map((post) => (
              <div
                key={post.id}
                className={`x-post${post.myrule ? ' myrule-x-post' : ''} border-b border-gray-500`}
              >
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
                    <Link href={`/user/${post.profiles?.username ?? ""}`} className="text-sm hover:underline" style={post.myrule ? { color: '#bfa100', fontWeight: 600 } : {}}>
                      {post.profiles?.nickname ? post.profiles.nickname : "名無し"}
                    </Link>
                    <span className="text-xs ml-3" style={post.myrule ? { color: '#bfa100', fontWeight: 600 } : {}}>{formatDate(post.created_at)}</span>
                  </div>
                  {post.myrule && (
                    <span
                      className="text-xs font-bold"
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
