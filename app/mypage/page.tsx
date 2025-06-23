"use client"

import { useEffect, useState } from "react"
import { createClient } from "../../lib/supabase/client"
import BottomNav from "../../components/BottomNav"
import { useRouter } from "next/navigation"

export default function MyPage() {
  const router = useRouter()
  const supabase = createClient()
  const [posts, setPosts] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [nickname, setNickname] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        console.error("ユーザーが取得できませんでした", error)
        router.push("/login")
        return
      }

      setUserId(user.id)

      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .single()

      setNickname(profile?.nickname || "名無し")

      const { data: userPosts } = await supabase
        .from("gaman_logs")
        .select("id, content, created_at, user_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      console.log("userPosts", userPosts)

      setPosts(userPosts || [])
      setLoading(false)
    }

    fetchUserData()
  }, [router])

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

  return (
    <>
      <main className="px-4 py-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          マイページ
        </h1>
        {loading ? (
          <p className="text-white text-center">読み込み中...</p>
        ) : (
          <>
            {/* プロフィールセクション */}
            <div className="bg-gray-900 rounded-2xl p-6 mb-6 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center text-3xl mb-2">
                🧑
              </div>
              <div className="text-lg font-bold text-white">{nickname}</div>
              <div className="text-sm text-gray-400 mt-1">投稿数: {posts.length}</div>
            </div>
            {/* 投稿一覧 */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="text-center text-gray-400">まだ投稿がありません</p>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-gray-800 rounded-2xl shadow-md p-4 text-white"
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-sm text-gray-400">{formatDate(post.created_at)}</span>
                    </div>
                    <p className="text-base whitespace-pre-line break-words">{post.content}</p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
      <BottomNav />
    </>
  )
}
