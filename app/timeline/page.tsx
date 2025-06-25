"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import BottomNav from "@/components/BottomNav"
import Link from "next/link"

const REACTION_TYPES = [
  { type: "erai", label: "えらいね！" },
  { type: "sugoi", label: "すごい！" },
  { type: "shinpai", label: "心配！" },
]

export default function TimelinePage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<any[]>([])
  const [reactions, setReactions] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<"gaman" | "cheatday">("gaman")

  useEffect(() => {
    const fetchData = async () => {
      const { data: postsData, error: postsError } = await supabase
        .from("gaman_logs")
        .select("id, content, created_at, user_id, profiles(nickname)")
        .order("created_at", { ascending: false })

      const { data: reactionsData, error: reactionsError } = await supabase
        .from("reactions")
        .select("id, post_id, user_id, type")

      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("id, post_id, user_id, content, created_at, profiles(nickname)")
        .order("created_at", { ascending: true })

      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)

      if (!postsError && !reactionsError && !commentsError) {
        setPosts(postsData)
        setReactions(reactionsData)
        setComments(commentsData)
      }
      setLoading(false)
    }
    fetchData()
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

  const filteredPosts = posts.filter(post =>
    selectedTab === "gaman" ? !post.cheat_day : post.cheat_day
  )

  return (
    <>
      <main className="px-4 py-6 max-w-xl mx-auto">
        {/* タブUI追加 */}
        <div className="flex mb-4">
          <button
            className={`flex-1 py-2 font-bold rounded-t-lg ${selectedTab === "gaman" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"}`}
            onClick={() => setSelectedTab("gaman")}
          >
            ガマン
          </button>
          <button
            className={`flex-1 py-2 font-bold rounded-t-lg ${selectedTab === "cheatday" ? "bg-pink-500 text-white" : "bg-gray-700 text-gray-300"}`}
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
                className="bg-gray-800 rounded-2xl shadow-md p-4 text-white"
              >
                <div className="text-sm text-gray-400 mb-2">
                  <span className="font-semibold text-blue-300">
                    <Link href={`/user/${post.user_id}`} className="hover:underline">
                      {post.profiles?.nickname ?? "名無し"}
                    </Link>
                  </span>
                  {"｜"}
                  {formatDate(post.created_at)}
                </div>
                <p className="text-base">{post.content}</p>
                <div className="flex gap-2 mt-3">
                  {REACTION_TYPES.map(r => (
                    <button
                      key={r.type}
                      onClick={() => handleReaction(post.id, r.type)}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors duration-150 ${
                        hasReacted(post.id, r.type)
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-gray-700 text-gray-200 border-gray-500 hover:bg-blue-600 hover:text-white"
                      }`}
                    >
                      {r.label} {getReactionCount(post.id, r.type) > 0 && (
                        <span>({getReactionCount(post.id, r.type)})</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="text-xs text-gray-400 mb-1">コメント</div>
                  <div className="space-y-2">
                    {comments.filter((c) => c.post_id === post.id).map((c) => (
                      <div key={c.id} className="bg-gray-900 rounded px-3 py-2 text-xs text-white">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-blue-300">{c.profiles?.nickname ?? "名無し"}</span>
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
                      className="flex-1 rounded bg-gray-700 text-white px-2 py-1 text-xs"
                      placeholder="コメントを書く"
                    />
                    <button
                      onClick={() => handleCommentSubmit(post.id)}
                      className="bg-blue-500 text-white rounded px-3 py-1 text-xs font-bold hover:bg-blue-600"
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
