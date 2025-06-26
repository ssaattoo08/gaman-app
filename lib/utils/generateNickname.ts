import { supabase } from "@/lib/supabase/client";
import { foodNames } from "./foodNames";

export const generateUniqueNickname = async (): Promise<string | null> => {
  // すでに使われているニックネームを取得
  const { data: used, error } = await supabase
    .from("profiles")
    .select("nickname");

  if (error) {
    throw new Error("ニックネーム取得エラー: " + error.message);
  }

  const usedNicknames = (used ?? []).map((row) => row.nickname);

  // 未使用のニックネーム候補を抽出
  const available = foodNames.filter((name) => !usedNicknames.includes(name));

  if (available.length === 0) {
    // 候補が足りない場合はnullを返す
    return null;
  }

  // ランダムに1つ選ぶ
  const nickname = available[Math.floor(Math.random() * available.length)];
  return nickname;
};
