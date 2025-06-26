"use client"

import { useEffect, useState, useRef } from "react"
import BottomNav from "@/components/BottomNav"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"

const REACTION_TYPES = [
  { type: "erai", label: "えらい" },
  { type: "sugoi", label: "すごい" },
  { type: "shinpai", label: "心配" },
]

export default function TimelinePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [reactions, setReactions] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<"gaman" | "cheatday">("gaman")
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    const fetchData = async () => {
      const { data: postsData, error: postsError } = await supabase
        .from("gaman_logs")
        .select("id, content, created_at, user_id, profiles(nickname), cheat_day")
        .order("created_at", { ascending: false })

      const { data: reactionsData, error: reactionsError } = await supabase
        .from("reactions")
        .select("id, post_id, user_id, type")

      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("id, post_id, user_id, content, created_at, profiles(nickname)")
        .order("created_at", { ascending: true })

      const { data: { user } } = await supabase.auth.getUser()
      
      if (isMountedRef.current) {
        setUserId(user?.id ?? null)

        if (!postsError && !reactionsError && !commentsError) {
          setPosts(postsData)
          setReactions(reactionsData)
          setComments(commentsData)
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
    const date = new Date(iso)
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Tokyo"
    })
  }

  const getReactionCount = (postId: string, type: string) =>
    reactions.filter(r => r.post_id === postId && r.type === type).length

  const hasReacted = (postId: string, type: string) =>
    reactions.some(r => r.post_id === postId && r.type === type && r.user_id === userId)

  const handleReaction = async (postId: string, type: string) => {
    if (!userId) {
      alert("ログインしてください")
      return
    }
    if (hasReacted(postId, type)) {
      const { error } = await supabase
        .from("reactions")
        .delete()
        .match({ post_id: postId, user_id: userId, type })
      if (!error) {
        setReactions(prev => prev.filter(
          r => !(r.post_id === postId && r.user_id === userId && r.type === type)
        ))
      }
    } else {
      const { error } = await supabase.from("reactions").insert({
        post_id: postId,
        user_id: userId,
        type,
      })
      if (!error) {
        setReactions(prev => [...prev, { post_id: postId, user_id: userId, type }])
      }
    }
  }

  const handleCommentInput = (postId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }))
  }

  const handleCommentSubmit = async (postId: string) => {
    if (!userId) {
      alert("ログインしてください")
      return
    }
    const content = commentInputs[postId]?.trim()
    if (!content) return
    const { error, data } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: userId,
      content,
    })
    if (!error) {
      setComments(prev => [...prev, { post_id: postId, user_id: userId, content, created_at: new Date().toISOString(), profiles: { nickname: "あなた" } }])
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }))
    }
  }

  // 投稿の絞り込み
  const filteredPosts = posts.filter(post =>
    selectedTab === "gaman"
      ? post.cheat_day === false || post.cheat_day === null || post.cheat_day === undefined
      : post.cheat_day === true
  );

  return (
    <>
      <main className="px-4 py-4 max-w-[40rem] mx-auto">
        {/* タブUI追加 */}
        <div className="flex mb-4">
          <button
            className={`flex-1 py-2 font-bold rounded-t-lg ${selectedTab === "gaman" ? "bg-black text-white" : "bg-gray-700 text-gray-300"}`}
            onClick={() => setSelectedTab("gaman")}
          >
            ガマン
          </button>
          <button
            className={`flex-1 py-2 font-bold rounded-t-lg ${selectedTab === "cheatday" ? "bg-black text-white" : "bg-gray-700 text-gray-300"}`}
            onClick={() => setSelectedTab("cheatday")}
          >
            チートデイ
          </button>
        </div>

        {loading ? (
          <p className="text-white text-center">読み込み中...</p>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className={`rounded-2xl shadow-xl p-6 border border-gray-700 bg-black`}
              >
                <div className="flex items-center mb-2">
                  <span className={`font-bold text-lg flex items-center gap-2 ${selectedTab === 'gaman' ? 'text-purple-300' : 'text-red-300'}`}>
                    <Link href={`/user/${post.user_id}`} className="hover:underline">
                      {post.profiles?.nickname ?? "名無し"}
                    </Link>
                  </span>
                  <span className="text-xs text-gray-400 ml-2">{formatDate(post.created_at)}</span>
                </div>
                <div className="text-base text-white mt-2 mb-4">
                  {post.content}
                </div>
                <div className="flex gap-2 mb-2">
                  {REACTION_TYPES.map((r, i) => (
                    <button
                      key={r.type}
                      onClick={() => handleReaction(post.id, r.type)}
                      className={`rounded-full px-4 py-1 font-bold transition shadow text-xs text-gray-400 bg-black hover:bg-gray-800 ${hasReacted(post.id, r.type) ? "ring-2 ring-white" : ""}`}
                    >
                      {r.label} {getReactionCount(post.id, r.type) > 0 && (
                        <span>({getReactionCount(post.id, r.type)})</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="space-y-2">
                    {comments.filter((c) => c.post_id === post.id).map((c) => (
                      <div key={c.id} className="bg-gray-900 rounded-xl px-3 py-2 text-xs text-white">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold text-white`}>{c.profiles?.nickname ?? "名無し"}</span>
                          <span className="text-gray-400">{formatDate(c.created_at)}</span>
                        </div>
                        <div className="ml-1">{c.content}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ""}
                      onChange={e => handleCommentInput(post.id, e.target.value)}
                      className={`flex-1 rounded-xl bg-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white`}
                      placeholder="コメントを書く"
                    />
                    <button
                      onClick={() => handleCommentSubmit(post.id)}
                      className={`text-white px-4 py-2 rounded-xl font-bold transition bg-black hover:bg-gray-800`}
                    >
                      投稿
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </>
  )
}
