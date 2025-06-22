"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import BottomNav from "@/components/BottomNav"

export default function TimelinePage() {
  const supabase = createClient()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("gaman_logs")
        .select("id, content, created_at, user_id, profiles(nickname)")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("エラー:", error.message)
      } else {
        setPosts(data)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const formatDate = (iso: string) => {
    const date = new Date(iso)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`
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
                    {post.profiles?.nickname ?? "名無し"}
                  </span>
                  {"｜"}
                  {formatDate(post.created_at)}
                </div>
                <p className="text-base">{post.content}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </>
  )
}
