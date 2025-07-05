"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ProfileEditPage() {
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>("");

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
        .select("nickname, bio, icon_url")
        .eq("id", user.id)
        .single();
      if (!error && data) {
        setNickname(data.nickname || "");
        setBio(data.bio || "");
        if (data.icon_url) setIconPreview(data.icon_url);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setIconFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setIconPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setIconPreview("");
    }
  };

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
    let icon_url = iconPreview;
    if (iconFile) {
      // 拡張子取得
      const ext = iconFile.name.split('.').pop();
      const filePath = `${user.id}.${ext}`;
      // Storageにアップロード
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, iconFile, { upsert: true, contentType: iconFile.type });
      if (uploadError) {
        setMessage("画像アップロードに失敗しました");
        setSaving(false);
        return;
      }
      // 公開URL取得
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      icon_url = data.publicUrl;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ nickname, bio, icon_url })
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
          <label className="block mb-4 text-gray-300">
            プロフィール画像
            <input
              type="file"
              accept="image/*"
              className="block mt-1"
              onChange={handleFileChange}
              disabled={saving}
            />
            {iconPreview && (
              <img src={iconPreview} alt="プロフィール画像" className="mt-2 w-16 h-16 rounded-full object-cover" />
            )}
          </label>
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