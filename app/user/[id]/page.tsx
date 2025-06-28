"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import BottomNav from "@/components/BottomNav"
import Link from "next/link"

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const [posts, setPosts] = useState<any[]>([])
  const [nickname, setNickname] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const isMountedRef = useRef(true)
  const [selectedTab, setSelectedTab] = useState<'gaman' | 'cheatday'>('gaman')
  const [reactions, setReactions] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    isMountedRef.current = true

    const fetchUserData = async () => {
      if (!userId || !isMountedRef.current) return
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", userId)
        .single()
      
      if (isMountedRef.current) {
      setNickname(profile?.nickname || "名無し")
      }

      const { data: userPosts } = await supabase
        .from("gaman_logs")
        .select("id, content, created_at, user_id, cheat_day, profiles(nickname)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
      
      // リアクション・コメントも取得
      const { data: reactionsData } = await supabase
        .from("reactions")
        .select("id, post_id, user_id, type")
      const { data: commentsData } = await supabase
        .from("comments")
        .select("id, post_id, user_id, content, created_at, profiles(nickname)")
        .order("created_at", { ascending: true })

      if (isMountedRef.current) {
      setPosts(userPosts || [])
        setReactions(reactionsData || [])
        setComments(commentsData || [])
      setLoading(false)
      }
    }
    fetchUserData()

    return () => {
      isMountedRef.current = false
    }
  }, [userId])

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    return jstDate.toLocaleString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  // タイムライン・マイページと同じリアクション種別
  const GAMAN_REACTIONS = [
    { type: "erai", label: "えらい" },
    { type: "sugoi", label: "すごい" },
    { type: "shinpai", label: "心配" },
  ]
  const CHEATDAY_REACTIONS = [
    { type: "ii", label: "たまにはいいよね" },
    { type: "eh", label: "えっ" },
    { type: "ganbaro", label: "明日からがんばろ" },
  ]
  const REACTION_TYPES = selectedTab === 'gaman' ? GAMAN_REACTIONS : CHEATDAY_REACTIONS;

  const getReactionCount = (postId: string, type: string) =>
    reactions.filter(r => r.post_id === postId && r.type === type).length

  const hasReacted = (postId: string, type: string) =>
    reactions.some(r => r.post_id === postId && r.type === type && r.user_id === userId)

  const handleReaction = async (postId: string, type: string) => {
    // ログイン不要（他ユーザーなので）
    if (hasReacted(postId, type)) {
      const { error } = await supabase
        .from("reactions")
        .delete()
        .match({ post_id: postId, user_id: userId, type })
      if (!error) {
        setReactions(prev => prev.filter(
          r => !(r.post_id === postId && r.user_id === userId && r.type === type)
        ))
      }
    } else {
      const { error } = await supabase.from("reactions").insert({
        post_id: postId,
        user_id: userId,
        type,
      })
      if (!error) {
        setReactions(prev => [...prev, { post_id: postId, user_id: userId, type }])
      }
    }
  }

  const handleCommentInput = (postId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }))
  }

  const handleCommentSubmit = async (postId: string) => {
    // ログイン不要（他ユーザーなので）
    const content = commentInputs[postId]?.trim()
    if (!content) return
    const { error, data } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: userId,
      content,
    })
    if (!error) {
      setComments(prev => [...prev, { post_id: postId, user_id: userId, content, created_at: new Date().toISOString(), profiles: { nickname: nickname || "名無し" } }])
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }))
    }
  }

  // 連続記録日数を計算
  const getStreak = () => {
    if (!posts || posts.length === 0) return 0;
    // 日付（YYYY-MM-DD）だけを抜き出し、重複排除＆降順ソート
    const days = Array.from(new Set(posts.map(p => new Date(new Date(p.created_at).getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)))).sort((a, b) => b.localeCompare(a));
    let streak = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      prev.setHours(0, 0, 0, 0);
      const curr = new Date(days[i]);
      curr.setHours(0, 0, 0, 0);
      if ((prev.getTime() - curr.getTime()) === 24 * 60 * 60 * 1000) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  return (
    <>
      <main className="px-4 py-6 max-w-xl mx-auto">
        {/* プロフィール欄 */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6 flex flex-col items-center">
          <div className="text-lg font-bold text-white mb-1">{nickname}</div>
          <div className="text-sm text-gray-400 mt-1">
            ガマン：{posts.filter(p => p.cheat_day === false || p.cheat_day === null || p.cheat_day === undefined).length}
            &nbsp;&nbsp;
            チートデイ：{posts.filter(p => p.cheat_day === true).length}
            <div className="mt-1 text-center">連続記録：{getStreak()}日</div>
          </div>
        </div>
        {/* タブUI */}
        <div className="flex mb-4">
          <button
            className={`flex-1 py-2 font-bold rounded-t-lg ${selectedTab === 'gaman' ? 'bg-black text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setSelectedTab('gaman')}
          >
            <span className={selectedTab === 'gaman' ? 'underline underline-offset-4 decoration-2 decoration-white' : ''}>ガマン</span>
          </button>
          <button
            className={`flex-1 py-2 font-bold rounded-t-lg ${selectedTab === 'cheatday' ? 'bg-black text-white' : 'bg-gray-700 text-gray-300'}`}
            onClick={() => setSelectedTab('cheatday')}
          >
            <span className={selectedTab === 'cheatday' ? 'underline underline-offset-4 decoration-2 decoration-white' : ''}>チートデイ</span>
          </button>
        </div>
        {/* 投稿一覧 */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-white text-center">読み込み中...</p>
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
                    <span className="text-sm text-gray-400">{post.profiles?.nickname ?? "名無し"}</span>
                    <span className="text-xs text-gray-500 ml-3">{formatDate(post.created_at)}</span>
                  </div>
                  <p className="text-base whitespace-pre-line break-words mb-2">{post.content}</p>
                </div>
              ))
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
} 