"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import BottomNav from "@/components/BottomNav"
import Link from "next/link"
import WeeklyGamanBarChart from "@/components/WeeklyGamanBarChart"
import PostContent from "../../../components/PostContent"
import ThreeMonthCamelCalendar from "@/components/ThreeMonthCamelCalendar"
import { useRouter } from "next/navigation"

export default function UserProfilePage() {
  const params = useParams()
  const username = params?.username ? String(params.username) : ""
  const [posts, setPosts] = useState<any[]>([])
  const [nickname, setNickname] = useState<string | null>(null)
  const [iconUrl, setIconUrl] = useState<string>("")
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const isMountedRef = useRef(true)
  const [selectedTab, setSelectedTab] = useState<'gaman' | 'myrule' | 'cheatday'>('gaman')
  const [reactions, setReactions] = useState<any[]>([])
  const [comments, setComments] = useState<any[]>([])
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({})
  const router = useRouter()

  useEffect(() => {
    isMountedRef.current = true

    const fetchUserData = async () => {
      if (!username || !isMountedRef.current) return
      // usernameからユーザー情報を取得
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, nickname, icon_url")
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
        setIconUrl(profile.icon_url || "")
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
    { type: "sugoi", label: "すごい" },
  ]
  const CHEATDAY_REACTIONS = [
    { type: "ii", label: "たまにはいいよね" },
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
        {/* プロフィール欄＋カレンダーをまとめてカード化 */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6 flex flex-col items-center">
          <div className="flex items-center mb-1">
            {iconUrl ? (
              <img
                src={iconUrl}
                alt="プロフィール画像"
                style={{ width: 32, height: 32, borderRadius: 6, marginRight: 12, objectFit: 'cover', background: '#333' }}
              />
            ) : (
              <div style={{width:32,height:32,background:'#333',borderRadius:6,marginRight:12}}></div>
            )}
            <div className="text-lg font-bold text-white">{nickname}</div>
          </div>
          {/* <div className="text-sm text-gray-400 mt-1">
            ガマン：{posts.filter(p => p.cheat_day === false || p.myrule === true).length}
            &nbsp;&nbsp;
            チートデイ：{posts.filter(p => p.cheat_day === true).length}
            <div className="mt-1 text-center">連続記録：{getStreak()}日</div>
          </div> */}
          {/* カレンダーをカード内に追加 */}
          <div className="w-full mt-4 flex justify-center">
            <ThreeMonthCamelCalendar data={(() => {
              if (posts.length === 0) return [];
              const filtered = posts.filter(p => p.cheat_day === false || p.myrule === true);
              const dateMap: { [date: string]: { date: string, gaman: number, myrule: boolean } } = {};
              filtered.forEach(p => {
                const d = new Date(new Date(p.created_at).getTime() + 9 * 60 * 60 * 1000);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                const ymd = `${year}-${month}-${day}`;
                if (!dateMap[ymd]) {
                  dateMap[ymd] = { date: ymd, gaman: 0, myrule: false };
                }
                dateMap[ymd].gaman++;
                if (p.myrule) dateMap[ymd].myrule = true;
              });
              return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
            })()} />
          </div>
        </div>
        {/* ヒートマップ（ガマンorMyRuleのみ・1年分グリッド） */}
        {/* この部分を削除 */}
        {/* タブUI（MyPageと同じ分かれ方） */}
        {/* <div className="flex mb-4 gap-2"> ... </div> */}
        {/* 投稿一覧（MyPageと同じ分岐） */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-white text-center">読み込み中...</p>
          ) : (
            posts.filter(post => post.cheat_day !== true).map((post) => (
              <div
                key={post.id}
                className={`x-post${post.myrule ? ' myrule-x-post' : ''}`}
              >
                <div className="flex items-center mb-2 justify-between">
                  <div className="flex items-center">
                    {/* 投稿欄にもプロフィール画像を表示 */}
                    {iconUrl ? (
                      <img
                        src={iconUrl}
                        alt="プロフィール画像"
                        style={{width:24,height:24,borderRadius:4,marginRight:8,objectFit:'cover',background:'#333'}}
                      />
                    ) : (
                      <div style={{width:24,height:24,background:'#333',borderRadius:4,marginRight:8}}></div>
                    )}
                    <span className="text-sm" style={post.myrule ? { color: '#bfa100', fontWeight: 600 } : {}}>{post.profiles?.nickname ?? "名無し"}</span>
                    <span className="text-xs ml-3" style={post.myrule ? { color: '#bfa100', fontWeight: 600 } : {}}>{formatDate(post.created_at)}</span>
                  </div>
                  {post.myrule && (
                    <span
                      className="text-xs font-bold"
                      style={{
                        color: '#bfa100',
                        background: 'transparent',
                        borderRadius: '8px',
                        padding: '2px 8px',
                        fontFamily: 'Meiryo UI, Meiryo, sans-serif',
                        opacity: 0.85,
                        fontWeight: 600,
                        fontSize: '12px',
                        letterSpacing: 1,
                      }}
                    >
                      MyRule
                    </span>
                  )}
                </div>
                <PostContent content={post.content} url_title={post.url_title} />
                {/* リアクションボタン */}
                <div className="flex items-center mt-3 pt-3 border-t border-gray-700">
                  <button
                    onClick={() => handleReaction(post.id, post.cheat_day ? 'ii' : 'sugoi')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      hasReacted(post.id, post.cheat_day ? 'ii' : 'sugoi')
                        ? 'bg-yellow-500 text-gray-900 shadow-md'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    <span className="text-sm">
                      {post.cheat_day ? '😊' : '✨'}
                    </span>
                    <span>{post.cheat_day ? 'たまにはいいよね' : 'すごい'}</span>
                    <span className="ml-1 text-xs opacity-80">
                      {getReactionCount(post.id, post.cheat_day ? 'ii' : 'sugoi')}
                    </span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
} 