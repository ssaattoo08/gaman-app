"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

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
  const [message, setMessage] = useState<string | null>(null) // メッセージ表示用

  useEffect(() => {
    const handleLogin = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        console.log("取得したセッション情報:", session)  // セッション情報を確認

        if (error || !session?.user) {
          console.error("ログインセッション取得失敗", error)
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

        // プロフィール取得エラー時のエラーハンドリング
        if (profileError) {
          console.error("プロフィール取得エラー", profileError)
          setMessage("プロフィールの取得に失敗しました。再度ログインしてください。")
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
            setMessage("プロフィールの登録に失敗しました。再度ログインしてください。")
            return
          }
        }

        // ログイン後に `/mypage` へリダイレクト
        router.push("/mypage")

      } catch (error) {
        console.error("ログイン処理中にエラーが発生しました", error)
        setMessage("ログイン処理中にエラーが発生しました。再度お試しください。")
        // エラーが発生した場合、ログインページにリダイレクト
        router.push("/login")
      }
    }

    handleLogin()
  }, [router, supabase])

  return (
    <div className="text-white p-4 text-center">
      {message ? <p>{message}</p> : "ログイン中..."}
    </div>
  )
}
