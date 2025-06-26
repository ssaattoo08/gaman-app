"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import BottomNav from "@/components/BottomNav"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const isMountedRef = useRef(true)
  const [markingRead, setMarkingRead] = useState(false)

  // すべて既読にする処理
  const handleMarkAllAsRead = async () => {
    setMarkingRead(true)
    const unreadIds = notifications.filter((n) => n.read === false).map((n) => n.id)
    console.log('unreadIds:', unreadIds)
    if (unreadIds.length > 0) {
      await supabase.from("reactions").update({ read: true }).in("id", unreadIds)
      // 再取得
      await fetchNotifications()
    }
    setMarkingRead(false)
  }

  // fetchNotificationsをuseEffect外でも使えるように修正
  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !isMountedRef.current) return
    setUserId(user.id)

    // 1. 自分の投稿ID一覧を取得
    const { data: myPosts } = await supabase
      .from("gaman_logs")
      .select("id")
      .eq("user_id", user.id)
    const myPostIds = (myPosts ?? []).map(p => p.id)
    if (myPostIds.length === 0) {
      setNotifications([])
      setLoading(false)
      return
    }

    // 2. 自分の投稿への通知だけ取得
    const { data, error } = await supabase
      .from("reactions")
      .select("id, type, created_at, user_id, post_id, read")
      .in("post_id", myPostIds)
      .order("created_at", { ascending: false })
    if (!error && data && isMountedRef.current) {
      const notificationsWithDetails = await Promise.all(
        data.map(async (n) => {
          let nickname = "名無し"
          const { data: profile } = await supabase
            .from("profiles")
            .select("nickname")
            .eq("id", n.user_id)
            .single()
          if (profile && profile.nickname) nickname = profile.nickname
          let postContent = ""
          const { data: post } = await supabase
            .from("gaman_logs")
            .select("content")
            .eq("id", n.post_id)
            .single()
          if (post && post.content) postContent = post.content
          return { ...n, nickname, postContent }
        })
      )
      setNotifications(notificationsWithDetails)
    }
    if (isMountedRef.current) {
      setLoading(false)
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    fetchNotifications()
    return () => {
      isMountedRef.current = false
    }
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
        {notifications.some(n => n.read === false) && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingRead}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {markingRead ? "既読にしています..." : "すべて既読にする"}
          </button>
        )}
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
                    <span className="font-bold text-blue-300">{n.nickname ?? "名無し"}</span>
                    さんがあなたの投稿に
                    <span className="font-bold text-pink-400">{reactionLabel(n.type)}</span>
                    しました
                  </div>
                  <div className="text-xs text-gray-400 mb-1">{formatDate(n.created_at)}</div>
                  <div className="text-sm text-white bg-gray-800 rounded p-2 mt-1">{n.postContent ?? ""}</div>
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