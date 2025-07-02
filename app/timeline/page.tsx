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
  const [selectedTab, setSelectedTab] = useState<"gaman" | "cheatday">("gaman")
  const isMountedRef = useRef(true)
  const [content, setContent] = useState("")
  const [posting, setPosting] = useState(false)
  const [cheatDay, setCheatDay] = useState(false)
  const router = useRouter()

  useEffect(() => {
    isMountedRef.current = true

    const fetchData = async () => {
      const { data: postsData, error: postsError } = await supabase
        .from("gaman_logs")
        .select("id, content, created_at, user_id, profiles(nickname, username), cheat_day")
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
    selectedTab === "gaman"
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
    const { error } = await supabase.from("gaman_logs").insert({
      user_id: user.id,
      content: content.trim(),
      cheat_day: cheatDay,
    })
    if (error) {
      alert("投稿に失敗しました")
      console.error(error)
    } else {
      setContent("")
      // 投稿後に再取得
      setLoading(true)
      const { data: postsData, error: postsError } = await supabase
        .from("gaman_logs")
        .select("id, content, created_at, user_id, profiles(nickname, username), cheat_day")
        .order("created_at", { ascending: false })
      if (!postsError) {
        setPosts(postsData)
      }
      setLoading(false)
    }
    setPosting(false)
  }

  return (
    <>
      <main className="px-4 py-6 max-w-xl mx-auto">
        {/* 投稿フォーム */}
        <div className="mb-6">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full h-20 p-4 rounded-xl bg-gray-800 text-white mb-4 text-base"
            placeholder={selectedTab === 'cheatday' ? '例：大好きなお酒を思う存分飲みまくった' : '例：飲み会を断って生成AIの勉強をした'}
          />
          <button
            onClick={() => handlePostSubmit(selectedTab === 'cheatday')}
            disabled={posting || !content.trim()}
            className={`w-full py-2 rounded-xl bg-gray-500 text-white font-bold hover:bg-gray-600 disabled:opacity-50 text-base cursor-pointer`}
          >
            {posting ? '投稿中...' : selectedTab === 'cheatday' ? 'チートデイとして投稿' : '投稿する'}
          </button>
        </div>
        {/* タブUI */}
        <div className="flex mb-4 gap-2">
          <button
            className={`flex-1 py-2 font-bold transition rounded-t-2xl shadow cursor-pointer ${selectedTab === 'gaman' ? 'bg-black text-white relative z-10' : 'bg-gray-700 text-gray-400 opacity-70'}`}
            style={selectedTab === 'gaman' ? { boxShadow: '0 4px 12px rgba(0,0,0,0.2)' } : {}}
            onClick={() => setSelectedTab('gaman')}
          >
            <span className="block">
              ガマン
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
            className={`flex-1 py-2 font-bold transition rounded-t-2xl shadow cursor-pointer ${selectedTab === 'cheatday' ? 'bg-black text-white relative z-10' : 'bg-gray-700 text-gray-400 opacity-70'}`}
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
                className="bg-gray-800 rounded-2xl shadow-md p-4 text-white"
              >
                <div className="flex items-center mb-2">
                  <Link href={`/user/${post.profiles?.username ?? ""}`} className="text-sm text-gray-400 hover:underline">
                    {post.profiles?.nickname ?? "名無し"}
                  </Link>
                  <span className="text-xs text-gray-500 ml-3">{formatDate(post.created_at)}</span>
                </div>
                <PostContent content={post.content} />
              </div>
            ))
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
