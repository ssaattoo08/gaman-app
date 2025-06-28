import { supabase } from "@/lib/supabase/client";
import { foodNames } from "./foodNames";

export const generateUniqueNickname = async (): Promise<{ nickname: string, username: string } | null> => {
  // すでに使われているニックネーム・usernameを取得
  const { data: used, error } = await supabase
    .from("profiles")
    .select("nickname, username");

  if (error) {
    throw new Error("ニックネーム取得エラー: " + error.message);
  }

  const usedNicknames = (used ?? []).map((row) => row.nickname);
  const usedUsernames = (used ?? []).map((row) => row.username);

  // 未使用の候補を抽出
  const available = foodNames.filter(
    (item) => !usedNicknames.includes(item.ja) && !usedUsernames.includes(item.en)
  );

  if (available.length === 0) {
    // 候補が足りない場合はnullを返す
    return null;
  }

  // ランダムに1つ選ぶ
  const picked = available[Math.floor(Math.random() * available.length)];
  return { nickname: picked.ja, username: picked.en };
};
