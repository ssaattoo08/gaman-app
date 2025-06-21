"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function MyPage() {
  const supabase = createClient()
  const router = useRouter()

  const [userId, setUserId] = useState<string | null>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState<string>("")

  // ユーザー情報と投稿を取得
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      const { data, error } = await supabase
        .from("gaman_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setLogs(data)
      }
    }

    fetchData()
  }, [])

  const handleEdit = (logId: string, currentContent: string) => {
    setEditingId(logId)
    setEditedContent(currentContent)
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditedContent("")
  }

  const handleSave = async (logId: string) => {
    const { error } = await supabase
      .from("gaman_logs")
      .update({ content: editedContent })
      .eq("id", logId)
      .eq("user_id", userId)

    if (!error) {
      // ローカルのログも更新
      setLogs((prev) =>
        prev.map((log) =>
          log.id === logId ? { ...log, content: editedContent } : log
        )
      )
      setEditingId(null)
      setEditedContent("")
    } else {
      alert("更新に失敗しました")
    }
  }

  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">マイページ（自分の投稿一覧）</h1>

      <p className="text-sm text-gray-300 mb-4">
        ログイン中のユーザーID: {userId ?? "未ログイン"}
      </p>

      {logs.map((log) => (
        <div key={log.id} className="bg-gray-800 text-white p-4 rounded mb-4">
          <p className="text-sm text-gray-400">{log.created_at}</p>

          {editingId === log.id ? (
            <>
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-2 text-black rounded mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSave(log.id)}
                  className="bg-blue-500 text-white px-4 py-1 rounded"
                >
                  保存
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-4 py-1 rounded"
                >
                  キャンセル
                </button>
              </div>
            </>
          ) : (
            <>
              <p>{log.content}</p>
              <button
                onClick={() => handleEdit(log.id, log.content)}
                className="mt-2 text-sm text-blue-300 underline"
              >
                編集
              </button>
            </>
          )}
        </div>
      ))}
    </main>
  )
}
