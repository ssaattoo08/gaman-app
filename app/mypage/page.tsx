"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from '../../lib/supabase/client'
import BottomNav from "../../components/BottomNav"
import { useRouter } from "next/navigation"

export default function MyPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [nickname, setNickname] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const isMountedRef = useRef(true)
  const [selectedTab, setSelectedTab] = useState<'gaman' | 'cheatday'>('gaman')

  useEffect(() => {
    isMountedRef.current = true

    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser()

        if (error || !user || !isMountedRef.current) {
          if (isMountedRef.current) {
            console.error("ユーザーが取得できませんでした", error)
            router.push("/login")
          }
          return
        }

        if (isMountedRef.current) {
          setUserId(user.id)
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("nickname")
          .eq("id", user.id)
          .single()

        if (isMountedRef.current) {
          setNickname(profile?.nickname || "名無し")
        }

        const { data: userPosts } = await supabase
          .from("gaman_logs")
          .select("id, content, created_at, user_id, cheat_day")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        console.log("userPosts", userPosts)

        if (isMountedRef.current) {
          setPosts(userPosts || [])
        }
      } catch (e) {
        console.error("データ取得時にエラー", e)
      } finally {
        if (isMountedRef.current) {
          setLoading(false)
        }
      }
    }

    fetchUserData()

    return () => {
      isMountedRef.current = false
    }
  }, [router, supabase])

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
        {loading ? (
          <p className="text-white text-center">読み込み中...</p>
        ) : (
          <>
            {/* プロフィールセクション */}
            <div className="bg-gray-900 rounded-2xl p-6 mb-6 flex flex-col items-center">
              <div className="text-lg font-bold text-white mb-1">{nickname}</div>
              <div className="text-sm text-gray-400 mt-1">
                ガマン：{posts.filter(p => p.cheat_day === false || p.cheat_day === null || p.cheat_day === undefined).length}
                &nbsp;&nbsp;
                チートデイ：{posts.filter(p => p.cheat_day === true).length}
              </div>
            </div>
            {/* 投稿タブ */}
            <div className="flex mb-4">
              <button
                className={`flex-1 py-2 font-bold rounded-t-lg ${selectedTab === 'gaman' ? 'bg-black text-white' : 'bg-gray-700 text-gray-300'}`}
                onClick={() => setSelectedTab('gaman')}
              >
                ガマン
              </button>
              <button
                className={`flex-1 py-2 font-bold rounded-t-lg ${selectedTab === 'cheatday' ? 'bg-black text-white' : 'bg-gray-700 text-gray-300'}`}
                onClick={() => setSelectedTab('cheatday')}
              >
                チートデイ
              </button>
            </div>
            {/* 投稿一覧 */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="text-center text-gray-400">まだ投稿がありません</p>
              ) : (
                posts
                  .filter(post => selectedTab === 'gaman'
                    ? post.cheat_day === false || post.cheat_day === null || post.cheat_day === undefined
                    : post.cheat_day === true)
                  .map((post) => (
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
