"use client"

import { useEffect, useState, useRef } from "react"
import BottomNav from "@/components/BottomNav"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import PostContent from "../../components/PostContent"

// リアクション・コメント機能を一時的にクローズ
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

export default function TimelinePage() {
  const [posts, setPosts] = useState<any[]>([])
  const [reactions, setReactions] = useState<any[]>([])
  // const [comments, setComments] = useState<any[]>([])
  // const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState<'gaman' | 'cheatday'>('gaman')
  const isMountedRef = useRef(true)
  const [content, setContent] = useState("")
  const [posting, setPosting] = useState(false)
  const [cheatDay, setCheatDay] = useState(false)
  const [myRule, setMyRule] = useState(false)
  const router = useRouter()
  const [showReactionModal, setShowReactionModal] = useState<{ open: boolean, postId: string | null, type: string | null }>({ open: false, postId: null, type: null });
  const [isProcessing, setIsProcessing] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean, post: any | null }>({ open: false, post: null });
  const [editContent, setEditContent] = useState("");
  const [editScope, setEditScope] = useState<'public' | 'private'>('public');
  const [editType, setEditType] = useState<'gaman' | 'myrule' | 'cheatday'>('gaman');

  useEffect(() => {
    isMountedRef.current = true

    const fetchData = async () => {
      const { data: postsData, error: postsError } = await supabase
        .from("gaman_logs")
        .select("id, content, created_at, user_id, profiles(nickname, username, icon_url), cheat_day, myrule, url_title")
        .order("created_at", { ascending: false })

      const { data: reactionsData, error: reactionsError } = await supabase
        .from("reactions")
        .select("id, post_id, user_id, type")

      // const { data: commentsData, error: commentsError } = await supabase
      //   .from("comments")
      //   .select("id, post_id, user_id, content, created_at, profiles(nickname)")
      //   .order("created_at", { ascending: true })

      const { data: { user } } = await supabase.auth.getUser()
      
      if (isMountedRef.current) {
        setUserId(user?.id ?? null)

        if (!postsError) {
          setPosts(postsData)
          setReactions(reactionsData || [])
          // setComments(commentsData)
          console.log("postsData:", postsData)
          console.log("cheat_day一覧:", postsData.map(p => p.cheat_day))
        }
        setLoading(false)
      }
    }
    fetchData()

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (userId === null && !loading) {
      router.replace('/');
    }
  }, [userId, loading, router]);

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

  const getReactionCount = (postId: string, type: string) =>
    reactions.filter(r => r.post_id === postId && r.type === type).length

  const hasReacted = (postId: string, type: string) =>
    reactions.some(r => r.post_id === postId && r.type === type && r.user_id === userId)

  const handleReaction = async (postId: string, type: string) => {
    if (!userId) {
      alert("ログインしてください")
      return
    }
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (hasReacted(postId, type)) {
        // 削除処理
        console.log("リアクション削除開始:", { postId, userId, type })
        const { error, data } = await supabase
          .from("reactions")
          .delete()
          .match({ post_id: postId, user_id: userId, type })
        
        console.log("削除結果:", { error, data })
        
        if (error) {
          console.error("リアクション削除エラー:", error)
          alert(`リアクション削除に失敗しました: ${error.message}`)
          return
        }
        setReactions(prev => prev.filter(
          r => !(r.post_id === postId && r.user_id === userId && r.type === type)
        ))
        const { data: reactionsData, error: fetchError } = await supabase
          .from("reactions")
          .select("id, post_id, user_id, type")
        if (fetchError) {
          console.error("リアクション再取得エラー:", fetchError)
        } else {
          console.log("削除後のリアクションデータ:", reactionsData)
          setReactions(reactionsData || [])
        }
      } else {
        // 追加処理
        console.log("リアクション追加開始:", { postId, userId, type })
        const { error, data } = await supabase.from("reactions").insert({
          post_id: postId,
          user_id: userId,
          type,
        })
        console.log("追加結果:", { error, data })
        if (error) {
          console.error("リアクション追加エラー:", error)
          alert(`リアクション追加に失敗しました: ${error.message}`)
          return
        }
        if (!error) {
          setReactions(prev => [...prev, { post_id: postId, user_id: userId, type }])
        }
      }
    } finally {
      setIsProcessing(false);
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

  // 投稿の絞り込み
  const filteredPosts = posts.filter(post =>
    selectedTab === 'gaman'
      ? (post.cheat_day === false || post.cheat_day === null || post.cheat_day === undefined)
      : (post.cheat_day === true)
  );

  const REACTION_TYPE = (post: any) => (post && !!post.cheat_day) ? 'ii' : 'sugoi';
  const REACTION_LABEL = (post: any) => (post && !!post.cheat_day) ? 'たまにはいいよね' : 'すごい';

  // 指定投稿・リアクションタイプのユーザー名リスト取得
  const getReactionUserNicknames = (postId: string, type: string) => {
    return reactions
      .filter(r => r.post_id === postId && r.type === type)
      .map(r => {
        const post = posts.find(p => p.id === postId);
        // 投稿にprofilesがあればそれを使う（自分の投稿はnicknameがpostsにある）
        if (r.user_id === post?.user_id && post?.profiles?.nickname) return post.profiles.nickname;
        // それ以外は「名無し」
        return "名無し";
      });
  };

  const handlePostSubmit = async (cheatDay: boolean) => {
    setPosting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert("ログインが必要です")
      router.push("/login")
      return
    }
    try {
      const res = await fetch("/api/postWithTitle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          content: content.trim(),
          cheat_day: cheatDay,
          myrule: myRule,
        })
      });
      const result = await res.json();
      if (!res.ok) {
        alert("投稿に失敗しました: " + (result.error || ""));
        setPosting(false);
        return;
      }
      setContent("");
      setMyRule(false);
      // 投稿後に再取得
      setLoading(true)
      const { data: postsData, error: postsError } = await supabase
        .from("gaman_logs")
        .select("id, content, created_at, user_id, profiles(nickname, username, icon_url), cheat_day, myrule, url_title")
        .order("created_at", { ascending: false })
      if (!postsError) {
        setPosts(postsData)
      }
      setLoading(false)
    } catch (e) {
      alert("投稿に失敗しました");
      console.error(e);
    }
    setPosting(false)
  }

  // 編集保存処理
  const handleEditSave = async () => {
    if (!editModal.post) return;
    const postId = editModal.post.id;
    let cheat_day = false, myrule = false;
    if (editType === 'cheatday') cheat_day = true;
    else if (editType === 'myrule') myrule = true;
    // ガマンは両方false
    const updates: any = {
      content: editContent,
      cheat_day,
      myrule,
    };
    const { error } = await supabase
      .from('gaman_logs')
      .update(updates)
      .eq('id', postId);
    if (error) {
      alert('編集に失敗しました: ' + error.message);
      return;
    }
    // 投稿一覧を再取得
    setLoading(true);
    const { data: postsData, error: postsError } = await supabase
      .from('gaman_logs')
      .select('id, content, created_at, user_id, profiles(nickname, username, icon_url), cheat_day, myrule, url_title')
      .order('created_at', { ascending: false });
    if (!postsError) {
      setPosts(postsData);
    }
    setLoading(false);
    setEditModal({ open: false, post: null });
  };

  // 投稿削除処理
  const handleDelete = async (postId: string) => {
    if (!window.confirm('本当にこの投稿を削除しますか？')) return;
    const { error } = await supabase
      .from('gaman_logs')
      .delete()
      .eq('id', postId);
    if (error) {
      alert('削除に失敗しました: ' + error.message);
      return;
    }
    // 投稿一覧を再取得
    setLoading(true);
    const { data: postsData, error: postsError } = await supabase
      .from('gaman_logs')
      .select('id, content, created_at, user_id, profiles(nickname, username, icon_url), cheat_day, myrule, url_title')
      .order('created_at', { ascending: false });
    if (!postsError) {
      setPosts(postsData);
    }
    setLoading(false);
  };

  return (
    <>
      <main className="px-4 py-6 max-w-xl mx-auto">
        {/* 投稿フォーム */}
        {userId && (
          <div className="mb-6 flex items-start w-full">
            <div className="flex-1 flex flex-col w-full relative">
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full p-4 pb-14 rounded-xl bg-gray-800 text-white resize-none mb-2 placeholder:text-xs text-xs"
                placeholder={
                  selectedTab === 'cheatday'
                    ? '例：大好きなお酒を思う存分飲みまくった'
                    : myRule
                      ? 'MyRule例：通勤電車で本を読む'
                      : 'ガマン例：飲み会を断り生成AIの勉強をした'
                }
                style={{minHeight:'60px',height:'80px',maxHeight:'120px', fontSize:'13px', width:'100%'}}
              />
              {/* MyRuleチェックボックスをテキストエリア内左下に絶対配置 */}
              {selectedTab === 'gaman' && (
                <label className="absolute bottom-4 left-4 flex items-center text-gray-300 text-xs" style={{userSelect:'none'}}>
                  <input
                    type="checkbox"
                    checked={myRule}
                    onChange={e => setMyRule(e.target.checked)}
                    className="mr-1 accent-blue-500 w-4 h-4"
                    style={{verticalAlign:'middle'}}
                  />
                  <span style={{lineHeight:'1.2'}}>MyRuleとして投稿</span>
                </label>
              )}
              {/* Postボタンをテキストエリア内右下にしっかり収める */}
              <button
                onClick={() => handlePostSubmit(selectedTab === 'cheatday')}
                disabled={posting || !content.trim()}
                className={`absolute bottom-4 right-4 flex items-center justify-center rounded-full font-bold transition-all duration-150 shadow text-xs cursor-pointer ${posting || !content.trim() ? 'opacity-60 bg-gray-500' : 'bg-gray-500 hover:bg-gray-600 text-white'}`}
                style={{ fontSize: '11px', width: '36px', height: '36px', borderRadius: '50%' }}
              >
                Post
              </button>
            </div>
          </div>
        )}
        {/* タブUI */}
        {/* <div className="flex mb-4 gap-2"> ... </div> */}
        {/* 投稿一覧 */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-white text-center">読み込み中...</p>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className={`x-post${post.myrule ? ' myrule-x-post' : ''} border-b border-gray-500`}
              >
                <div className="flex items-center mb-2 justify-between">
                  <div className="flex items-center">
                    {post.profiles?.icon_url ? (
                      <img
                        src={post.profiles.icon_url}
                        alt="プロフィール画像"
                        style={{ width: 24, height: 24, borderRadius: 4, marginRight: 8, objectFit: 'cover', background: '#333' }}
                      />
                    ) : (
                      <div style={{width:24,height:24,background:'#333',borderRadius:4,marginRight:8}}></div>
                    )}
                    <Link href={`/user/${post.profiles?.username ?? ""}`} className="text-sm hover:underline" style={post.myrule ? { color: '#bfa100', fontWeight: 600 } : {}}>
                      {post.profiles?.nickname ? post.profiles.nickname : "名無し"}
                    </Link>
                    <span className="text-xs ml-3" style={post.myrule ? { color: '#bfa100', fontWeight: 600 } : {}}>{formatDate(post.created_at)}</span>
                  </div>
                  {/* 三点リーダーメニュー */}
                  <div className="relative group">
                    <button
                      className="p-1 rounded-full hover:bg-gray-700 focus:outline-none cursor-pointer"
                      onClick={e => {
                        e.stopPropagation();
                        setMenuOpenId(post.id === menuOpenId ? null : post.id);
                      }}
                    >
                      <span style={{fontSize:'16px',lineHeight:1}}>︙</span>
                    </button>
                    {menuOpenId === post.id && (
                      <div className="absolute right-0 mt-2 w-32 border border-gray-700 rounded-lg shadow-lg z-50" style={{boxShadow:'0 2px 8px rgba(0,0,0,0.18)', background:'#23272e'}}>
                        <button className="block w-full text-left px-4 py-2 text-sm font-bold hover:bg-gray-800 text-gray-200 cursor-pointer" style={{letterSpacing:1}} onClick={() => {
                          setEditModal({ open: true, post });
                          setEditContent(post.content);
                          if (post.cheat_day) setEditType('cheatday');
                          else if (post.myrule) setEditType('myrule');
                          else setEditType('gaman');
                          setMenuOpenId(null);
                        }}>編集</button>
                        <button className="block w-full text-left px-4 py-2 text-sm font-bold hover:bg-gray-800 text-gray-400 cursor-pointer" style={{letterSpacing:1}} onClick={() => { handleDelete(post.id); setMenuOpenId(null); }}>削除</button>
                      </div>
                    )}
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
                    disabled={isProcessing}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      hasReacted(post.id, REACTION_TYPE(post))
                        ? 'bg-yellow-500 text-gray-900 shadow-md'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                    } ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {/* <span className="text-sm">
                      {REACTION_TYPE(post) === 'sugoi' ? '✨' : '😊'}
                    </span> */}
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
      </main>
      <BottomNav />
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
      {/* 編集モーダル */}
      {editModal.open && editModal.post && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 min-w-[320px] max-w-lg w-full relative border border-gray-700">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={() => setEditModal({ open: false, post: null })}>×</button>
            <div className="mb-2 text-xs text-gray-300">{formatDate(editModal.post.created_at)}</div>
            <textarea
              className="w-full p-3 rounded-lg bg-gray-800 text-white resize-none mb-3 placeholder:text-xs text-xs border border-gray-700"
              style={{minHeight:'60px',height:'80px',maxHeight:'120px', fontSize:'13px'}}
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
            />
            <div className="flex items-center mb-4 gap-4">
              <label className={`flex items-center text-sm ${editType === 'gaman' ? 'text-gray-100 font-bold' : 'text-gray-400'}`} style={{letterSpacing:1}}>
                <input
                  type="radio"
                  className="mr-1 accent-gray-500"
                  checked={editType === 'gaman'}
                  onChange={() => setEditType('gaman')}
                />ガマン
              </label>
              <label className={`flex items-center text-sm ${editType === 'myrule' ? 'text-yellow-200 font-bold' : 'text-gray-400'}`} style={{letterSpacing:1}}>
                <input
                  type="radio"
                  className="mr-1 accent-yellow-200"
                  checked={editType === 'myrule'}
                  onChange={() => setEditType('myrule')}
                />MyRule
              </label>
              <label className={`flex items-center text-sm ${editType === 'cheatday' ? 'text-pink-200 font-bold' : 'text-gray-400'}`} style={{letterSpacing:1}}>
                <input
                  type="radio"
                  className="mr-1 accent-pink-200"
                  checked={editType === 'cheatday'}
                  onChange={() => setEditType('cheatday')}
                />チートデイ
              </label>
            </div>
            <div className="flex gap-2 justify-start">
              <button className="px-4 py-2 rounded bg-gray-700 text-gray-100 font-bold text-sm hover:bg-gray-600 border border-gray-600 transition cursor-pointer" onClick={handleEditSave}>保存</button>
              <button className="px-4 py-2 rounded bg-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-400 border border-gray-400 transition cursor-pointer" onClick={() => setEditModal({ open: false, post: null })}>キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
