import { supabase } from "../supabase/client";
import { foodNames } from "./foodNames";
import supabaseAdmin from "../supabase/admin";

export const generateUniqueNickname = async (): Promise<{ nickname: string, username: string } | null> => {
  // すでに使われているニックネーム・usernameを取得
  const { data: used, error } = await supabase
    .from("profiles")
    .select("nickname, username");

  if (error) {
    throw new Error("ニックネーム取得エラー: " + error.message);
  }

  const usedNicknames = (used ?? []).map((row: any) => row.nickname);
  const usedUsernames = (used ?? []).map((row: any) => row.username);

  // 未使用の候補を抽出
  const available = foodNames.filter(
    (item: any) => !usedNicknames.includes(item.ja) && !usedUsernames.includes(item.en)
  );

  if (available.length === 0) {
    // 候補が足りない場合はnullを返す
    return null;
  }

  // ランダムに1つ選ぶ
  const picked = available[Math.floor(Math.random() * available.length)];
  return { nickname: picked.ja, username: picked.en };
};

// 既存ユーザーにusernameを一括付与するバッチ関数
export const batchAssignUsernames = async () => {
  // すでにusernameが設定されているユーザーはスキップ
  const { data: users, error } = await supabaseAdmin
    .from("profiles")
    .select("id, nickname, username");
  console.log("users:", users);
  if (error) throw new Error("ユーザー取得エラー: " + error.message);

  // すでに使われているusername一覧
  const usedUsernames = new Set((users ?? []).map((u: any) => u.username).filter(Boolean));

  // username未設定ユーザーのみ処理
  for (const user of users ?? []) {
    console.log(user);
    if (user.username) continue;
    // foodNamesからnicknameに対応する英語名を探す
    const food = foodNames.find((f: any) => f.ja === user.nickname);
    if (!food) continue;
    let base = food.en;
    let candidate = base;
    let i = 1;
    // 重複があれば連番を付与
    while (usedUsernames.has(candidate)) {
      candidate = `${base}${i}`;
      i++;
    }
    // usernameを付与
    await supabaseAdmin.from("profiles").update({ username: candidate }).eq("id", user.id);
    usedUsernames.add(candidate);
  }
};
