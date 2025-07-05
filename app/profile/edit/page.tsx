import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ProfileEditPage() {
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("nickname, bio")
        .eq("id", user.id)
        .single();
      if (!error && data) {
        setNickname(data.nickname || "");
        setBio(data.bio || "");
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage("ログイン情報が取得できませんでした");
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ nickname, bio })
      .eq("id", user.id);
    if (error) {
      setMessage("保存に失敗しました");
    } else {
      setMessage("プロフィールを更新しました！");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-gray-900 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-white">プロフィール編集</h2>
      {loading ? (
        <p className="text-gray-400">読み込み中...</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 text-gray-300">
            ニックネーム
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-800 text-white mt-1"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              disabled={saving}
            />
          </label>
          <label className="block mb-4 text-gray-300">
            自己紹介
            <textarea
              className="w-full p-2 rounded bg-gray-800 text-white mt-1"
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              disabled={saving}
            />
          </label>
          <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded font-bold w-full" disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </button>
          {message && <p className="mt-4 text-center text-green-400">{message}</p>}
        </form>
      )}
    </div>
  );
} 