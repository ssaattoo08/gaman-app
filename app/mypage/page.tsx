"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from '../../lib/supabase/client'
import BottomNav from "../../components/BottomNav"
import { useRouter } from "next/navigation"
import WeeklyGamanBarChart from "../../components/WeeklyGamanBarChart"
import PostContent from "../../components/PostContent"
import ThreeMonthCamelCalendar from "../../components/ThreeMonthCamelCalendar"
import { Pencil, MoreVertical } from "lucide-react"

export default function MyPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [nickname, setNickname] = useState<string | null>(null)
  const [iconUrl, setIconUrl] = useState<string>("");
  const [loading, setLoading] = useState(true)
  const isMountedRef = useRef(true)
  const [selectedTab, setSelectedTab] = useState<'gaman' | 'cheatday'>('gaman')
  const [reactions, setReactions] = useState<any[]>([])
  // const [comments, setComments] = useState<any[]>([])
  // const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({})
  // 投稿フォーム用の状態
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [cheatDay, setCheatDay] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  // 画像編集用の状態
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>("");
  const [editMyrules, setEditMyrules] = useState<string[]>([]);
  const [editMyruleInput, setEditMyruleInput] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showReactionModal, setShowReactionModal] = useState<{ open: boolean, postId: string | null, type: string | null }>({ open: false, postId: null, type: null });
  const [myrules, setMyrules] = useState<string[]>([]);

  // 指定投稿・リアクションタイプのユーザー名リスト取得
  const getReactionUserNicknames = (postId: string, type: string) => {
    return reactions
      .filter(r => r.post_id === postId && r.type === type)
      .map(r => {
        // マイページは自分の投稿のみなのでnicknameでOK
        return nickname || "名無し";
      });
  };

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
          .select("nickname, icon_url, myrules")
          .eq("id", user.id)
          .single()

        if (isMountedRef.current) {
        setNickname(profile?.nickname || "名無し")
        setIconUrl(profile?.icon_url || "")
        setMyrules(profile?.myrules || [])
        }

        const { data: userPosts } = await supabase
          .from("gaman_logs")
          .select("id, content, created_at, user_id, cheat_day, myrule, url_title")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        console.log("userPosts", userPosts)

        if (isMountedRef.current) {
        setPosts(userPosts || [])
        }

        // リアクション・コメント機能を一時的にクローズ
        const { data: reactionsData } = await supabase
          .from("reactions")
          .select("id, post_id, user_id, type")
        // const { data: commentsData } = await supabase
        //   .from("comments")
        //   .select("id, post_id, user_id, content, created_at, profiles(nickname)")
        //   .order("created_at", { ascending: true })

        if (isMountedRef.current) {
        setPosts(userPosts || [])
        setReactions(reactionsData || [])
        // setComments(commentsData || [])
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

  // JST日付変換の共通関数
  const toJstYmd = (iso: string) => {
    const date = new Date(iso);
    // JSTに変換
    const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const year = jst.getFullYear();
    const month = String(jst.getMonth() + 1).padStart(2, '0');
    const day = String(jst.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 日付＋時刻（タイムラインと同じ形式）
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
  };

  // 連続記録日数を計算
  const getStreak = () => {
    if (!posts || posts.length === 0) return 0;
    // ガマン投稿のみ抽出
    const gamanPosts = posts.filter(p => p.cheat_day === false || p.cheat_day === null || p.cheat_day === undefined);
    if (gamanPosts.length === 0) return 0;
    // 日付（YYYY-MM-DD）だけを抜き出し、重複排除＆降順ソート
    const days = Array.from(new Set(gamanPosts.map(p => toJstYmd(p.created_at)))).sort((a, b) => b.localeCompare(a));
    if (days.length === 0) return 0;
    // 1件だけの場合：今日の投稿なら1日、それ以外は0日
    if (days.length === 1) {
      const today = toJstYmd(new Date().toISOString());
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

  const REACTION_TYPE = (post: any) => post.cheat_day ? 'ii' : 'sugoi';
  const REACTION_LABEL = (post: any) => post.cheat_day ? 'たまにはいいよね' : 'すごい';

  const getReactionCount = (postId: string, type: string) =>
    reactions.filter(r => r.post_id === postId && r.type === type).length

  const hasReacted = (postId: string, type: string) =>
    reactions.some(r => r.post_id === postId && r.type === type && r.user_id === userId)

  const handleReaction = async (postId: string, type: string) => {
    if (!userId) {
      alert("ログインしてください")
      return
    }
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

  // 投稿処理
  const handlePostSubmit = async (cheatDay: boolean) => {
    setPosting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("ログインが必要です");
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("/api/postWithTitle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          content: content.trim(),
          cheat_day: cheatDay,
        })
      });
      const result = await res.json();
      if (!res.ok) {
        alert("投稿に失敗しました: " + (result.error || ""));
        setPosting(false);
        return;
      }
      setContent("");
      setCheatDay(false);
      // 投稿後に再取得
      setLoading(true);
      const { data: userPosts, error: postsError } = await supabase
        .from("gaman_logs")
        .select("id, content, created_at, user_id, cheat_day, myrule, url_title")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!postsError) {
        setPosts(userPosts || []);
      }
      setLoading(false);
    } catch (e) {
      alert("投稿に失敗しました");
      console.error(e);
    }
    setPosting(false);
  };

  // 投稿の絞り込み
  const filteredPosts = posts.filter(post =>
    selectedTab === 'gaman'
      ? post.cheat_day === false || post.cheat_day === null || post.cheat_day === undefined
      : post.cheat_day === true
  );

  // プロフィール画像初期値取得
  useEffect(() => {
    if (!showEditModal) return;
    const fetchProfile = async () => {
      setEditLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setEditLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("icon_url")
        .eq("id", user.id)
        .single();
      if (!error && data && data.icon_url) {
        setIconPreview(data.icon_url);
      } else {
        setIconPreview("");
      }
      // MyRuleも初期値セット
      const { data: profile } = await supabase
        .from("profiles")
        .select("myrules")
        .eq("id", user.id)
        .single();
      setEditMyrules(profile?.myrules || []);
      setEditLoading(false);
    };
    fetchProfile();
  }, [showEditModal]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setIconFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setIconPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSaving(true);
    setEditMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setEditMessage("ログイン情報が取得できませんでした");
      setEditSaving(false);
      return;
    }
    let icon_url = iconPreview;
    if (iconFile) {
      const ext = iconFile.name.split('.').pop();
      const filePath = `${user.id}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, iconFile, { contentType: iconFile.type });
      if (uploadError) {
        setEditMessage("画像アップロードに失敗しました");
        setEditSaving(false);
        return;
      }
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      icon_url = data.publicUrl;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ icon_url, myrules: editMyrules })
      .eq("id", user.id);
    if (error) {
      setEditMessage("保存に失敗しました");
    } else {
      setEditMessage("プロフィール画像/MyRuleを更新しました！");
      // 保存成功時はマイページに遷移
      router.push("/mypage");
    }
    setEditSaving(false);
  };

  return (
    <>
      <main className="px-4 py-6 max-w-xl mx-auto">
        {loading ? (
          <p className="text-white text-center">読み込み中...</p>
        ) : (
          <>
            {/* プロフィールセクション＋カレンダーをまとめてカード化 */}
            <div className="bg-gray-900 rounded-2xl p-6 mb-6 flex flex-col items-center w-full relative">
              {/* 右上の三点リーダーアイコンとメニュー */}
              <div className="absolute top-3 right-3">
                <button
                  className="hover:bg-[#222] transition flex items-center justify-center cursor-pointer"
                  style={{ width: 20, height: 20, padding: 0, background: 'none', border: 'none' }}
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="メニューを開く"
                >
                  <MoreVertical size={14} color="#ccc" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-gray-800 rounded shadow-lg z-20 border border-gray-700">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        setShowEditModal(true);
                        setMenuOpen(false);
                      }}
                    >
                      プロフィールを編集する
                    </button>
                  </div>
                )}
              </div>
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
                <div className="text-lg font-bold text-white">{nickname ? nickname : ""}</div>
              </div>
              {/* MyRuleリスト表示 */}
              <div className="w-full flex flex-col items-center mt-4 mb-4">
                <div className="text-lg font-bold text-white mb-3" style={{letterSpacing:1, fontSize:9}}>MyRule</div>
                {myrules && myrules.length > 0 ? (
                  <ul className="w-full max-w-xs flex flex-col items-start gap-2 px-3 py-3 bg-gray-800/60 rounded-lg" style={{lineHeight:1.8}}>
                    {myrules.map((rule, idx) => (
                      <li key={idx} className="text-white" style={{fontSize:9}}>{rule}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-400 text-base" style={{fontSize:9}}>まだMyRuleが登録されていません</div>
                )}
              </div>
              {/* <div className="text-sm text-gray-400 mt-1">
                ガマン：{posts.filter(p => p.cheat_day === false || p.cheat_day === null || p.cheat_day === undefined).length}
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
                    const ymd = toJstYmd(p.created_at);
                    if (!dateMap[ymd]) {
                      dateMap[ymd] = { date: ymd, gaman: 0, myrule: false };
                    }
                    dateMap[ymd].gaman++;
                    if (p.myrule) dateMap[ymd].myrule = true;
                  });
                  const result = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
                  console.log('【カレンダーに渡す日付リスト】', result.map(r => r.date));
                  return result;
                })()} />
              </div>
            </div>
            {/* 画像編集モーダル（本物のUI） */}
            {showEditModal && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                <div className="bg-gray-900 rounded-lg p-6 relative w-full max-w-md">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-white cursor-pointer"
                    onClick={() => setShowEditModal(false)}
                  >
                    ×
                  </button>
                  <h2 className="text-xl font-bold mb-6 text-white text-center">プロフィール編集</h2>
                  {editLoading ? (
                    <p className="text-gray-400 text-center">読み込み中...</p>
                  ) : (
                    <form onSubmit={handleEditSubmit} className="flex flex-col items-center">
                      <div
                        className="relative mb-4 cursor-pointer group"
                        style={{ width: 96, height: 96 }}
                        onClick={handleImageClick}
                        tabIndex={0}
                        role="button"
                        aria-label="プロフィール画像を選択"
                      >
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          disabled={editSaving}
                        />
                        <div
                          className="rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-500 group-hover:border-yellow-500"
                          style={{ width: 96, height: 96 }}
                        >
                          {iconPreview ? (
                            <img src={iconPreview} alt="プロフィール画像" className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-gray-400">画像</span>
                          )}
                        </div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-xs text-white px-2 py-1 rounded mt-2 pointer-events-none" style={{whiteSpace:'nowrap'}}>
                          画像を選択
                        </div>
                      </div>
                      {/* MyRule編集UI */}
                      <div className="w-full mb-4">
                        <div className="text-base font-bold text-white mb-1" style={{fontSize:9}}>MyRule</div>
                        <ul className="list-disc pl-5 space-y-1 mb-2">
                          {editMyrules.map((rule, idx) => (
                            <li key={idx} className="flex items-center text-white" style={{fontSize:9}}>
                              <span className="flex-1">{rule}</span>
                              <div className="flex flex-col ml-2">
                                <button type="button" className="text-xs text-gray-400 hover:text-white cursor-pointer" style={{lineHeight:1}} disabled={idx === 0} onClick={() => {
                                  if(idx > 0) {
                                    const newRules = [...editMyrules];
                                    [newRules[idx-1], newRules[idx]] = [newRules[idx], newRules[idx-1]];
                                    setEditMyrules(newRules);
                                  }
                                }}>▲</button>
                                <button type="button" className="text-xs text-gray-400 hover:text-white cursor-pointer" style={{lineHeight:1}} disabled={idx === editMyrules.length-1} onClick={() => {
                                  if(idx < editMyrules.length-1) {
                                    const newRules = [...editMyrules];
                                    [newRules[idx+1], newRules[idx]] = [newRules[idx], newRules[idx+1]];
                                    setEditMyrules(newRules);
                                  }
                                }}>▼</button>
                              </div>
                              <button type="button" className="ml-2 text-xs text-red-400 hover:text-red-600 cursor-pointer" onClick={() => setEditMyrules(editMyrules.filter((_, i) => i !== idx))}>削除</button>
                            </li>
                          ))}
                        </ul>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editMyruleInput}
                            onChange={e => setEditMyruleInput(e.target.value)}
                            className="flex-1 px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
                            placeholder="MyRuleを追加"
                            disabled={editSaving}
                          />
                          <button
                            type="button"
                            className="bg-gray-500 text-white px-3 py-1 rounded font-bold cursor-pointer"
                            disabled={editSaving || !editMyruleInput.trim()}
                            onClick={() => {
                              if (editMyruleInput.trim()) {
                                setEditMyrules([...editMyrules, editMyruleInput.trim()]);
                                setEditMyruleInput("");
                              }
                            }}
                          >追加</button>
                        </div>
                      </div>
                      <button type="submit" className="bg-gray-500 text-white px-6 py-2 rounded font-bold w-full mt-2 cursor-pointer" disabled={editSaving}>
                        {editSaving ? "保存中..." : "保存"}
                      </button>
                      {editMessage && <p className="mt-4 text-center text-green-400">{editMessage}</p>}
                    </form>
                  )}
                </div>
              </div>
            )}
            {/* 投稿タブ */}
            {/* <div className="flex mb-4 gap-2"> ... </div> */}
            {/* 投稿一覧 */}
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="text-center text-gray-400">まだ投稿がありません</p>
              ) : (
                posts.filter(post => post.cheat_day !== true).map((post) => (
                  <div
                    key={post.id}
                    className={`x-post${post.myrule ? ' myrule-x-post' : ''}`}
                  >
                    <div className="flex items-center mb-2 justify-between">
                      <div className="flex items-center">
                        {/* プロフィール画像を投稿欄にも表示 */}
                        {iconUrl ? (
                          <img
                            src={iconUrl}
                            alt="プロフィール画像"
                            style={{width:24,height:24,borderRadius:4,marginRight:8,objectFit:'cover',background:'#333'}}
                          />
                        ) : (
                          <div style={{width:24,height:24,background:'#333',borderRadius:4,marginRight:8}}></div>
                        )}
                        <span className="text-sm" style={post.myrule ? { color: '#bfa100', fontWeight: 600 } : {}}>{nickname}</span>
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
                    <div className="flex items-center mt-3">
                      <button
                        onClick={() => handleReaction(post.id, REACTION_TYPE(post))}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                          hasReacted(post.id, REACTION_TYPE(post))
                            ? 'bg-yellow-500 text-gray-900 shadow-md'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                        }`}
                      >
                        <span>{REACTION_LABEL(post)}</span>
                        <span
                          className="ml-1 text-xs opacity-80 cursor-pointer underline hover:text-yellow-400"
                          onClick={e => { e.stopPropagation(); setShowReactionModal({ open: true, postId: post.id, type: REACTION_TYPE(post) }); }}
                        >
                          {getReactionCount(post.id, REACTION_TYPE(post))}
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* リアクションした人のニックネーム表示モーダル */}
            {showReactionModal.open && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-gray-900 rounded-lg p-6 min-w-[220px] max-w-xs relative">
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setShowReactionModal({ open: false, postId: null, type: null })}>×</button>
                  <h2 className="text-lg font-bold mb-4 text-white text-center">リアクションした人</h2>
                  <ul className="space-y-2">
                    {showReactionModal.postId && showReactionModal.type && getReactionUserNicknames(showReactionModal.postId, showReactionModal.type).length > 0 ? (
                      getReactionUserNicknames(showReactionModal.postId, showReactionModal.type).map((nickname, idx) => (
                        <li key={idx} className="text-center text-white bg-gray-800 rounded px-2 py-1">{nickname}</li>
                      ))
                    ) : (
                      <li className="text-center text-gray-400">まだ誰もリアクションしていません</li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <BottomNav />
    </>
  );
}