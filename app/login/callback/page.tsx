"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

// 食べ物リスト（必要ならもっと追加できます）
const foodNames = [
  "りんご", "バナナ", "たまご", "おにぎり", "パン", "チーズ", "からあげ",
  "ハンバーグ", "スイカ", "アイス", "クッキー", "うどん", "そば", "ラーメン",
  "みそしる", "ピザ", "カレー", "いくら", "シュークリーム", "ポテト"
]

// ランダムな食べ物ニックネームを生成
function generateRandomNickname() {
  const index = Math.floor(Math.random() * foodNames.length)
  return foodNames[index]
}

export default function Callback() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleLogin = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session?.user) {
        console.error("ログインセッション取得失敗", error)
        return
      }

      const userId = session.user.id

      // すでに登録されていないか確認
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", userId)
        .single()

      // なければニックネームを挿入
      if (!existingProfile) {
        const nickname = generateRandomNickname()

        const { error: insertError } = await supabase
          .from("profiles")
          .insert([{ id: userId, nickname }])

        if (insertError) {
          console.error("プロフィール登録エラー", insertError)
        }
      }

      // ログイン後に `/mypage` へリダイレクト
      router.push("/mypage")
    }

    handleLogin()
  }, [router, supabase])

  return (
    <div className="text-white p-4 text-center">ログイン中...</div>
  )
}
