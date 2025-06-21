"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function HomePage() {
  const supabase = createClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id ?? null)

      const { data, error } = await supabase
        .from("gaman_logs")
        .select("id, content, created_at, user_id, profiles(nickname)")
        .order("created_at", { ascending: false })

      if (data) setPosts(data)
    }

    fetchData()
  }, [])

  const handleDelete = async (postId: string) => {
    if (!confirm("この投稿を削除しますか？")) return

    await supabase.from("gaman_logs").delete().eq("id", postId)
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">みんなの我慢記録</h1>
      {posts.map((post) => (
        <div key={post.id} className="bg-gray-800 p-4 rounded">
          <p className="text-sm text-gray-400">{post.created_at}</p>
          <p className="text-green-400 font-bold">{post.profiles?.nickname}</p>
          <p className="text-white">{post.content}</p>

          {/* 自分の投稿だけボタン表示 */}
          {post.user_id === userId && (
            <div className="mt-2 space-x-2">
              <button
                onClick={() => handleDelete(post.id)}
                className="text-red-400 hover:underline"
              >
                削除
              </button>

              <a
                href={`/edit/${post.id}`}
                className="text-blue-400 hover:underline"
              >
                編集
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
