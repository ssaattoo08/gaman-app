import React, { useState } from "react";
import Link from "next/link";
import PostContent from "./PostContent";

export default function PostCardWithMenu({
  post,
  userId,
  iconUrl,
  nickname,
  onEdit,
  onDelete,
  formatDate,
  handleReaction,
  hasReacted,
  getReactionCount,
  REACTION_TYPE,
  REACTION_LABEL,
  isProcessing,
}: any) {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editModal, setEditModal] = useState<{ open: boolean, post: any | null }>({ open: false, post: null });
  const [editContent, setEditContent] = useState("");
  const [editType, setEditType] = useState<'gaman' | 'myrule' | 'cheatday'>('gaman');

  // 編集保存処理（親からonEditを受け取る想定）
  const handleEditSave = async () => {
    if (!editModal.post) return;
    let cheat_day = false, myrule = false;
    if (editType === 'cheatday') cheat_day = true;
    else if (editType === 'myrule') myrule = true;
    await onEdit({
      id: editModal.post.id,
      content: editContent,
      cheat_day,
      myrule,
    });
    setEditModal({ open: false, post: null });
  };

  return (
    <div className={`x-post${post.myrule ? ' myrule-x-post' : ''} border-b border-gray-500`}>
      <div className="flex items-center mb-2 justify-between">
        <div className="flex items-center">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt="プロフィール画像"
              style={{ width: 24, height: 24, borderRadius: 4, marginRight: 8, objectFit: 'cover', background: '#333' }}
            />
          ) : (
            <div style={{width:24,height:24,background:'#333',borderRadius:4,marginRight:8}}></div>
          )}
          {post.profiles?.username ? (
            <Link href={`/user/${post.profiles.username}`} className="text-sm hover:underline" style={post.myrule ? { color: '#bfa100', fontWeight: 600 } : {}}>
              {post.profiles?.nickname ? post.profiles.nickname : nickname || "名無し"}
            </Link>
          ) : (
            <span className="text-sm" style={post.myrule ? { color: '#bfa100', fontWeight: 600 } : {}}>{nickname || "名無し"}</span>
          )}
          <span className="text-xs ml-3" style={post.myrule ? { color: '#bfa100', fontWeight: 600 } : {}}>{formatDate(post.created_at)}</span>
          {post.myrule && (
            <span
              className="text-xs font-bold ml-2 flex items-center"
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
              {/* MyRuleラベルの右に三点リーダー */}
              <div className="relative group ml-2">
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
                    <button className="block w-full text-left px-4 py-2 text-sm font-bold hover:bg-gray-800 text-gray-400 cursor-pointer" style={{letterSpacing:1}} onClick={() => { onDelete(post.id); setMenuOpenId(null); }}>削除</button>
                  </div>
                )}
              </div>
            </span>
          )}
        </div>
        {/* 通常投稿は右上に三点リーダー */}
        {!post.myrule && (
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
                <button className="block w-full text-left px-4 py-2 text-sm font-bold hover:bg-gray-800 text-gray-400 cursor-pointer" style={{letterSpacing:1}} onClick={() => { onDelete(post.id); setMenuOpenId(null); }}>削除</button>
              </div>
            )}
          </div>
        )}
      </div>
      <PostContent content={post.content} url_title={post.url_title} />
      {/* リアクションボタン */}
      <div className="flex items-center mt-3">
        <button
          onClick={() => handleReaction(post.id, REACTION_TYPE(post))}
          disabled={isProcessing}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
            hasReacted(post.id, REACTION_TYPE(post))
              ? 'bg-yellow-500 text-gray-900 shadow-md'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
          } ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <span>{REACTION_LABEL(post)}</span>
          <span
            className="ml-1 text-xs opacity-80 cursor-pointer underline hover:text-yellow-400"
            onClick={e => { e.stopPropagation(); /* モーダル表示は親で */ }}
          >
            {getReactionCount(post.id, REACTION_TYPE(post))}
          </span>
        </button>
      </div>
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
    </div>
  );
} 