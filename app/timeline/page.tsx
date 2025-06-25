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
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: postsData, error: postsError } = await supabase
        .from("gaman_logs")
        .select("id, content, created_at, user_id, profiles(nickname)")
        .order("created_at", { ascending: false })

      const { data: reactionsData, error: reactionsError } = await supabase
        .from("reactions")
        .select("id, post_id, user_id, type")

      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)

      if (!postsError && !reactionsError) {
        setPosts(postsData)
        setReactions(reactionsData)
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

  return (
    <>
      <main className="px-4 py-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          HOME
        </h1>

        {loading ? (
          <p className="text-white text-center">読み込み中...</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
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
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </>
  )
}
