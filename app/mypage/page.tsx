"use client"

import { useEffect, useState } from "react"
import { createClient } from "../../lib/supabase/client"
import BottomNav from "../../components/BottomNav"
import { useRouter } from "next/navigation" // 追加

export default function MyPage() {
  const router = useRouter() // 追加
  const supabase = createClient()
  const [posts, setPosts] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [nickname, setNickname] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [editPostId, setEditPostId] = useState<string | null>(null)

  const handleDelete = async (postId: string) => {
    const { error } = await supabase
      .from("gaman_logs")
      .delete()
      .eq("id", postId)

    if (error) {
      alert("削除に失敗しました")
      console.error(error)
    } else {
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    }
  }

  // useEffect修正：セッションがない場合はログインページへリダイレクト
  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        console.error("ユーザーが取得できませんでした", error)
        router.push("/login") // ユーザーがいない場合、ログインページにリダイレクト
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

      setPosts(userPosts || [])
      setLoading(false)
    }

    fetchUserData()
  }, [router])

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
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-gray-400">
                      {formatDate(post.created_at)}
                    </div>
                    {/* 自分の投稿だけに表示 */}
                    {userId === post.user_id && (
                      <div className="space-x-2">
                        <button
                          className="text-sm text-yellow-400 hover:text-yellow-300"
                          onClick={() => {
                            setIsEditing(true)
                            setEditContent(post.content)
                            setEditPostId(post.id)
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="text-sm text-red-400 hover:text-red-300"
                          onClick={() => handleDelete(post.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-base">{post.content}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md text-white">
            <h2 className="text-lg font-bold mb-4">投稿を編集</h2>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-32 p-2 border rounded"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setIsEditing(false)}
              >
                キャンセル
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={async () => {
                  if (!editPostId) return

                  const { error } = await supabase
                    .from("gaman_logs")
                    .update({ content: editContent })
                    .eq("id", editPostId)

                  if (error) {
                    alert("更新に失敗しました")
                    console.error(error)
                  } else {
                    setPosts((prev) =>
                      prev.map((p) =>
                        p.id === editPostId ? { ...p, content: editContent } : p
                      )
                    )
                    setIsEditing(false)
                    setEditPostId(null)
                    setEditContent("")
                  }
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
