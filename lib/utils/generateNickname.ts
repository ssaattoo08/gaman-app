import { createClient } from "@/lib/supabase/client";
import { foodNames } from "./foodNames";

export const generateUniqueNickname = async (): Promise<string> => {
  const supabase = createClient()

  let nickname = ""
  let isUnique = false

  while (!isUnique) {
    const food = foodNames[Math.floor(Math.random() * foodNames.length)]
    const number = Math.floor(1000 + Math.random() * 9000)
    nickname = `${food}${number}`

    // `nickname` の重複チェック
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("nickname", nickname)
      .single()

    if (!data) {
      isUnique = true
    }
  }

  return nickname
}
