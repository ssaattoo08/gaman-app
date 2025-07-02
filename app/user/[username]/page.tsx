"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import BottomNav from "@/components/BottomNav"
import Link from "next/link"
import WeeklyGamanBarChart from "@/components/WeeklyGamanBarChart"
import PostContent from "../../../components/PostContent"

export default function UserProfilePage() {
  const params = useParams()
  const username = params?.username ? String(params.username) : ""
  const [posts, setPosts] = useState<any[]>([])
  const [nickname, setNickname] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const isMountedRef = useRef(true)
  const [selectedTab, setSelectedTab] = useState<'gaman' | 'myrule' | 'cheatday'>('gaman')
  const [reactions, setReactions] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    isMountedRef.current = true

    const fetchUserData = async () => {
      if (!username || !isMountedRef.current) return
      // usernameからユーザー情報を取得
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, nickname")
        .eq("username", username)
        .single()
      if (!profile) {
        setNickname("名無し")
        setUserId(null)
        setPosts([])
        setLoading(false)
        return
      }
      if (isMountedRef.current) {
        setNickname(profile.nickname || "名無し")
        setUserId(profile.id)
      }
      // 投稿一覧取得
      const { data: userPosts } = await supabase
        .from("gaman_logs")
        .select("id, content, created_at, user_id, cheat_day, profiles(nickname), myrule")
        .eq("user_id", profile.id)
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
  }, [username])

  useEffect(() => {
    // デバッグ用: posts, getStreak, daysを両方で出力
    console.warn('===POSTS DEBUG===', JSON.stringify(posts));
    console.log('===POSTS DEBUG===', JSON.stringify(posts));
    console.warn('===STREAK DEBUG===', getStreak());
    console.log('===STREAK DEBUG===', getStreak());
    // days配列も直接出力
    if (posts && posts.length > 0) {
      const gamanPosts = posts.filter(p => p.cheat_day === false || p.cheat_day === null || p.cheat_day === undefined);
      const days = Array.from(new Set(gamanPosts.map(p => new Date(new Date(p.created_at).getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)))).sort((a, b) => b.localeCompare(a));
      console.warn('===DAYS DEBUG===', JSON.stringify(days));
      console.log('===DAYS DEBUG===', JSON.stringify(days));
    }
    getStreak();
  }, [posts]);

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
    if (!userId) return;
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
    if (!userId) return;
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
    // ガマン投稿のみ抽出
    const gamanPosts = posts.filter(p => p.cheat_day === false || p.cheat_day === null || p.cheat_day === undefined);
    if (gamanPosts.length === 0) return 0;
    // 日付（YYYY-MM-DD）だけを抜き出し、重複排除＆降順ソート
    const days = Array.from(new Set(gamanPosts.map(p => new Date(new Date(p.created_at).getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)))).sort((a, b) => b.localeCompare(a));
    console.warn('===DAYS DEBUG===', days);
    if (days.length === 0) return 0;
    // 1件だけの場合：今日の投稿なら1日、それ以外は0日
    if (days.length === 1) {
      const today = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
      return days[0] === today ? 1 : 0;
    }
    // 2件以上の場合：最新日から1日ずつ連続しているか全てチェック
    for (let i = 0; i < days.length - 1; i++) {
      const curr = new Date(days[i]);
      curr.setHours(0, 0, 0, 0);
      const next = new Date(days[i + 1]);
      next.setHours(0, 0, 0, 0);
      if ((curr.getTime() - next.getTime()) !== 24 * 60 * 60 * 1000) {
        return 0;
      }
    }
    return days.length;
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
        {/* 曜日ごとのガマン投稿数グラフ */}
        <div className="mb-6">
          <WeeklyGamanBarChart data={(() => {
            // 直近7日間の日付配列（新しい順）
            const today = new Date();
            today.setHours(today.getHours() + 9); // JST補正
            const days = [...Array(7)].map((_, i) => {
              const d = new Date(today);
              d.setDate(today.getDate() - (6 - i));
              const mmdd = (d.getMonth() + 1).toString().padStart(2, '0') + '/' + d.getDate().toString().padStart(2, '0');
              return { date: mmdd, ymd: d.toISOString().slice(0, 10), dow: d.getDay(), gaman: 0, cheat: 0, dayNum: d.getDate() };
            });
            posts.forEach(p => {
              const d = new Date(new Date(p.created_at).getTime() + 9 * 60 * 60 * 1000);
              const ymd = d.toISOString().slice(0, 10);
              const idx = days.findIndex(day => day.ymd === ymd);
              if (idx !== -1) {
                if (p.cheat_day === true) {
                  days[idx].cheat++;
                } else {
                  days[idx].gaman++;
                }
              }
            });
            // 0件の日付は除外。ただし10,20,30日は除外しない
            return days.filter(day => (day.gaman > 0 || day.cheat > 0) || [10,20,30].includes(day.dayNum));
          })()} />
        </div>
        {/* タブUI */}
        <div className="flex mb-4 gap-2">
          <button
            className={`flex-1 py-2 font-bold transition rounded-t-2xl shadow cursor-pointer ${selectedTab === 'gaman' ? 'bg-black text-white relative z-10' : 'bg-gray-700 text-gray-400 opacity-70'}`}
            style={selectedTab === 'gaman' ? { boxShadow: '0 4px 12px rgba(0,0,0,0.2)' } : {}}
            onClick={() => setSelectedTab('gaman')}
          >
            <span className="block">
              ガマン
              {selectedTab === 'gaman' && (
                <span style={{
                  display: 'block',
                  margin: '4px auto 0',
                  width: '40px',
                  height: '4px',
                  background: '#fff',
                  borderRadius: '2px'
                }} />
              )}
            </span>
          </button>
          <button
            className={`flex-1 py-2 font-bold transition rounded-t-2xl shadow cursor-pointer ${selectedTab === 'myrule' ? 'bg-black text-yellow-900 relative z-10' : 'bg-yellow-100 text-yellow-900 opacity-70'}`}
            style={selectedTab === 'myrule' ? { boxShadow: '0 4px 12px rgba(0,0,0,0.2)' } : {}}
            onClick={() => setSelectedTab('myrule')}
          >
            <span className="block">
              MyRule
              {selectedTab === 'myrule' && (
                <span style={{
                  display: 'block',
                  margin: '4px auto 0',
                  width: '40px',
                  height: '4px',
                  background: '#eab308',
                  borderRadius: '2px'
                }} />
              )}
            </span>
          </button>
          <button
            className={`flex-1 py-2 font-bold transition rounded-t-2xl shadow cursor-pointer ${selectedTab === 'cheatday' ? 'bg-black text-white relative z-10' : 'bg-gray-700 text-gray-400 opacity-70'}`}
            style={selectedTab === 'cheatday' ? { boxShadow: '0 4px 12px rgba(0,0,0,0.2)' } : {}}
            onClick={() => setSelectedTab('cheatday')}
          >
            <span className="block">
              チートデイ
              {selectedTab === 'cheatday' && (
                <span style={{
                  display: 'block',
                  margin: '4px auto 0',
                  width: '40px',
                  height: '4px',
                  background: '#fff',
                  borderRadius: '2px'
                }} />
              )}
            </span>
          </button>
        </div>
        {/* 投稿一覧 */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-white text-center">読み込み中...</p>
          ) : (
            posts
              .filter(post => {
                if (selectedTab === 'gaman') {
                  return (post.cheat_day === false || post.cheat_day === null || post.cheat_day === undefined) && !post.myrule;
                } else if (selectedTab === 'myrule') {
                  return (post.cheat_day === false || post.cheat_day === null || post.cheat_day === undefined) && post.myrule;
                } else {
                  return post.cheat_day === true;
                }
              })
              .map((post) => (
                <div
                  key={post.id}
                  className="bg-gray-800 rounded-2xl shadow-md p-4 text-white"
                >
                  <div className="flex items-center mb-2">
                    <span className="text-sm text-gray-400">{post.profiles?.nickname ?? "名無し"}</span>
                    <span className="text-xs text-gray-500 ml-3">{formatDate(post.created_at)}</span>
                  </div>
                  <PostContent content={post.content} />
                </div>
              ))
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
} 