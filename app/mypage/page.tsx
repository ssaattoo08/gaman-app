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
  // const [reactions, setReactions] = useState<any[]>([])
  // const [comments, setComments] = useState<any[]>([])
  // const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({})

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

        // リアクション・コメント機能を一時的にクローズ
        // const { data: reactionsData } = await supabase
        //   .from("reactions")
        //   .select("id, post_id, user_id, type")
        // const { data: commentsData } = await supabase
        //   .from("comments")
        //   .select("id, post_id, user_id, content, created_at, profiles(nickname)")
        //   .order("created_at", { ascending: true })

        // if (isMountedRef.current) {
        //   setReactions(reactionsData || [])
        //   setComments(commentsData || [])
        // }
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

  // リアクション・コメント機能を一時的にクローズ
  // const GAMAN_REACTIONS = [
  //   { type: "erai", label: "えらい" },
  //   { type: "sugoi", label: "すごい" },
  //   { type: "shinpai", label: "心配" },
  // ]
  // const CHEATDAY_REACTIONS = [
  //   { type: "ii", label: "たまにはいいよね" },
  //   { type: "eh", label: "えっ" },
  //   { type: "ganbaro", label: "明日からがんばろ" },
  // ]
  // const REACTION_TYPES = selectedTab === 'gaman' ? GAMAN_REACTIONS : CHEATDAY_REACTIONS;

  // const getReactionCount = (postId: string, type: string) =>
  //   reactions.filter(r => r.post_id === postId && r.type === type).length

  // const hasReacted = (postId: string, type: string) =>
  //   reactions.some(r => r.post_id === postId && r.type === type && r.user_id === userId)

  // const handleReaction = async (postId: string, type: string) => {
  //   if (!userId) {
  //     alert("ログインしてください")
  //     return
  //   }
  //   if (hasReacted(postId, type)) {
  //     const { error } = await supabase
  //       .from("reactions")
  //       .delete()
  //       .match({ post_id: postId, user_id: userId, type })
  //     if (!error) {
  //       setReactions(prev => prev.filter(
  //         r => !(r.post_id === postId && r.user_id === userId && r.type === type)
  //       ))
  //     }
  //   } else {
  //     const { error } = await supabase.from("reactions").insert({
  //       post_id: postId,
  //       user_id: userId,
  //       type,
  //     })
  //     if (!error) {
  //       setReactions(prev => [...prev, { post_id: postId, user_id: userId, type }])
  //     }
  //   }
  // }

  // const handleCommentInput = (postId: string, value: string) => {
  //   setCommentInputs((prev) => ({ ...prev, [postId]: value }))
  // }

  // const handleCommentSubmit = async (postId: string) => {
  //   if (!userId) {
  //     alert("ログインしてください")
  //     return
  //   }
  //   const content = commentInputs[postId]?.trim()
  //   if (!content) return
  //   const { error, data } = await supabase.from("comments").insert({
  //     post_id: postId,
  //     user_id: userId,
  //     content,
  //   })
  //   if (!error) {
  //     setComments(prev => [...prev, { post_id: postId, user_id: userId, content, created_at: new Date().toISOString(), profiles: { nickname: "あなた" } }])
  //     setCommentInputs((prev) => ({ ...prev, [postId]: "" }))
  //   }
  // }

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
                      <p className="text-base whitespace-pre-line break-words mb-4">{post.content}</p>
                      
                      {/* リアクション・コメント機能を一時的にクローズ */}
                      <div className="bg-gray-700 rounded-xl p-3 text-center">
                        <div className="text-gray-400 text-sm">
                          リアクション・コメント機能は現在一時的にご利用いただけません
                        </div>
                      </div>
                      
                      {/* リアクション・コメント機能を一時的にクローズ
                      <div className="flex gap-2 mb-2">
                        {REACTION_TYPES.map((r, i) => (
                          <button
                            key={r.type}
                            onClick={() => handleReaction(post.id, r.type)}
                            className={`rounded-full px-4 py-1 font-bold transition shadow text-xs text-gray-400 bg-black hover:bg-gray-800`}
                          >
                            {r.label} {getReactionCount(post.id, r.type) > 0 && (
                              <span>({getReactionCount(post.id, r.type)})</span>
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="mt-4">
                        <div className="space-y-2">
                          {comments.filter((c) => c.post_id === post.id).map((c) => (
                            <div key={c.id} className="bg-gray-900 rounded-xl px-3 py-2 text-xs text-white">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`font-bold text-white`}>{c.profiles?.nickname ?? "名無し"}</span>
                                <span className="text-gray-400">{formatDate(c.created_at)}</span>
                              </div>
                              <div className="ml-1">{c.content}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            value={commentInputs[post.id] || ""}
                            onChange={e => handleCommentInput(post.id, e.target.value)}
                            className={`flex-1 rounded-xl bg-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white`}
                            placeholder="コメントを書く"
                          />
                          <button
                            onClick={() => handleCommentSubmit(post.id)}
                            className={`text-white px-4 py-2 rounded-xl font-bold transition bg-black hover:bg-gray-800`}
                          >
                            投稿
                          </button>
                        </div>
                      </div>
                      */}
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
