import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function ProfileEditPage() {
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-gray-900 rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-white">プロフィール編集</h2>
      {loading ? (
        <p className="text-gray-400">読み込み中...</p>
      ) : (
        <form>
          <label className="block mb-2 text-gray-300">
            ニックネーム
            <input
              type="text"
              className="w-full p-2 rounded bg-gray-800 text-white mt-1"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
            />
          </label>
          <label className="block mb-4 text-gray-300">
            自己紹介
            <textarea
              className="w-full p-2 rounded bg-gray-800 text-white mt-1"
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </label>
          <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded font-bold w-full">
            保存
          </button>
        </form>
      )}
    </div>
  );
} 