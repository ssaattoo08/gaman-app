"use client"

import { useEffect, useState } from "react"
import { createClient } from "../../lib/supabase/client"
import BottomNav from "../../components/BottomNav"

export default function MyPage() {
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
  
      console.log("取得したユーザー：", user) // ← これを追加！
  
      if (user) {  
        setUserId(user.id)

        const { data: profile } = await supabase
          .from("profiles")
          .select("nickname")
          .eq("id", user.id)
          .single()

        setNickname(profile?.nickname || "名無し")

        const { data: userPosts } = await supabase
          .from("gaman_logs")
          .select("id, content, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        setPosts(userPosts || [])
      }
      setLoading(false)
    }
    fetchUserData()
  }, [])

  const formatDate = (iso: string) => {
    const date = new Date(iso)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`
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
            <p className="text-white text-sm text-center mb-4">
              ログイン中のユーザー：{nickname}
            </p>
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-gray-800 rounded-2xl shadow-md p-4 text-white"
                >
                  <div className="text-sm text-gray-400 mb-2">
                    {formatDate(post.created_at)}
                  </div>
                  <p className="text-base">{post.content}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </>
  )
}
