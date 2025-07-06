"use client";
import React, { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import { Camera } from "lucide-react";

export default function ProfileEditPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        .select("icon_url")
        .eq("id", user.id)
        .single();
      if (!error && data && data.icon_url) {
        setIconPreview(data.icon_url);
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
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
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
      const ext = iconFile.name.split(".").pop();
      const filePath = `${user.id}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, iconFile, {
          contentType: iconFile.type,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        setMessage("画像アップロードに失敗しました");
        setSaving(false);
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      icon_url = data.publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ icon_url })
      .eq("id", user.id);

    if (error) {
      setMessage("保存に失敗しました");
    } else {
      setMessage("プロフィール画像を更新しました！");
    }

    setSaving(false);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-gray-900 rounded-lg">
      <h2 className="text-xl font-bold mb-6 text-white text-center">プロフィール画像編集</h2>
      {loading ? (
        <p className="text-gray-400 text-center">読み込み中...</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
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
              disabled={saving}
            />
            <div
              className="rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-500 group-hover:border-yellow-500"
              style={{ width: 96, height: 96 }}
            >
              {iconPreview ? (
                <img src={iconPreview} alt="プロフィール画像" className="object-cover w-full h-full" />
              ) : (
                <Camera size={40} color="#bbb" />
              )}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-xs text-white px-2 py-1 rounded mt-2 pointer-events-none" style={{ whiteSpace: 'nowrap' }}>
              画像を選択
            </div>
          </div>
          <button type="submit" className="bg-yellow-600 text-white px-6 py-2 rounded font-bold w-full mt-2" disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </button>
          {message && <p className="mt-4 text-center text-green-400">{message}</p>}
        </form>
      )}
    </div>
  );
}
