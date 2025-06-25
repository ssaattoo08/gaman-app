"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import BottomNav from "@/components/BottomNav"

export default function NotificationsPage() {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      // 自分のID取得
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      // 自分の投稿に対するリアクションを取得
      const { data, error } = await supabase
        .from("reactions")
        .select(`id, type, created_at, user_id, post_id, profiles:nickname, gaman_logs(content)`) // profilesはリアクションした人
        .eq("gaman_logs.user_id", user.id)
        .order("created_at", { ascending: false })
      if (!error && data) {
        setNotifications(data)
      }
      setLoading(false)
    }
    fetchNotifications()
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

  const reactionLabel = (type: string) => {
    if (type === "erai") return "えらいね！"
    if (type === "sugoi") return "すごい！"
    if (type === "shinpai") return "心配！"
    return type
  }

  return (
    <>
      <main className="px-4 py-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">通知</h1>
        {loading ? (
          <p className="text-white text-center">読み込み中...</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-400 text-center">まだ通知はありません</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div key={n.id} className="bg-gray-900 rounded-2xl p-4 shadow flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
                  📨
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-300 mb-1">
                    <span className="font-bold text-blue-300">{n.profiles?.nickname ?? "名無し"}</span>
                    さんがあなたの投稿に
                    <span className="font-bold text-pink-400">{reactionLabel(n.type)}</span>
                    しました
                  </div>
                  <div className="text-xs text-gray-400 mb-1">{formatDate(n.created_at)}</div>
                  <div className="text-sm text-white bg-gray-800 rounded p-2 mt-1">{n.gaman_logs?.content ?? ""}</div>
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