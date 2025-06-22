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
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session?.user) {
          console.error("ログインセッション取得失敗", error)
          // セッションが取得できない場合、ログインページにリダイレクト
          await router.push("/login")
          return
        }

        const userId = session.user.id

        // すでに登録されていないか確認
        const { data: existingProfile, error: profileError } = await supabase
          .from("profiles")
          .select("nickname")
          .eq("id", userId)
          .single()

        if (profileError) {
          console.error("プロフィール取得エラー", profileError)
          return
        }

        // なければニックネームを挿入
        if (!existingProfile) {
          const nickname = generateRandomNickname()

          const { error: insertError } = await supabase
            .from("profiles")
            .insert([{ id: userId, nickname }])

          if (insertError) {
            console.error("プロフィール登録エラー", insertError)
            return
          }
        }

        // ログイン後に `/mypage` へリダイレクト
        await router.push("/mypage")

      } catch (error) {
        console.error("ログイン処理中にエラーが発生しました", error)
        // エラーが発生した場合、ログインページにリダイレクト
        await router.push("/login")
      }
    }

    handleLogin()
  }, [router, supabase])

  return (
    <div className="text-white p-4 text-center">ログイン中...</div>
  )
}
