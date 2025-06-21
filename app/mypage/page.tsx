"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export default function MyPage() {
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [nickname, setNickname] = useState<string>("")
  const [logs, setLogs] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState<string>("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .single()

      if (profile) {
        setNickname(profile.nickname)
      }

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

  const handleDelete = async () => {
    if (!deleteTargetId) return
    const { error } = await supabase
      .from("gaman_logs")
      .delete()
      .eq("id", deleteTargetId)
      .eq("user_id", userId)

    if (!error) {
      setLogs((prev) => prev.filter((log) => log.id !== deleteTargetId))
      setDeleteTargetId(null)
      setShowConfirm(false)
    } else {
      alert("削除に失敗しました")
    }
  }

  const formatDate = (iso: string) => {
    const date = new Date(iso)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`
  }

  return (
    <main className="px-4 py-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6 text-center">
        My Posts
      </h1>

      <div className="text-sm text-gray-400 mb-6 text-center">
        ログイン中のユーザー: <span className="text-white">{nickname || "未ログイン"}</span>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="bg-gray-800 rounded-2xl shadow-md p-4 text-white">
            <div className="text-sm text-gray-400 mb-2">
              {formatDate(log.created_at)}
            </div>

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
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
                  >
                    保存
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded"
                  >
                    キャンセル
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-base">{log.content}</p>
                <div className="mt-2 flex gap-4">
                  <button
                    onClick={() => handleEdit(log.id, log.content)}
                    className="text-sm text-blue-300 underline hover:text-blue-400"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => {
                      setDeleteTargetId(log.id)
                      setShowConfirm(true)
                    }}
                    className="text-sm text-red-300 underline hover:text-red-400"
                  >
                    削除
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md text-black">
            <p className="mb-4">本当に削除してもよろしいですか？</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowConfirm(false)
                  setDeleteTargetId(null)
                }}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
