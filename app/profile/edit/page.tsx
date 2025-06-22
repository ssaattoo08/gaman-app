"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function EditProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [nickname, setNickname] = useState("")
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)  // ユーザーの情報を保持するステート

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log("✅ ユーザー:", user)
      if (userError) {
        console.error("❌ ユーザー取得エラー:", userError)
        return
      }

      setUser(user)  // ユーザー情報をステートに保存

      if (user) {
        // ユーザー情報があればプロフィールを取得
        const { data, error } = await supabase
          .from("profiles")
          .select("nickname")
          .eq("id", user.id)
          .single()

        console.log("📦 プロフィールデータ:", data)
        console.error("❌ プロフィール取得エラー:", error)

        if (data) setNickname(data.nickname || "")
      }
      setLoading(false)
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname) return // ニックネームが空でないか確認

    setLoading(true)

    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ nickname })
        .eq("id", user.id)

      setLoading(false)

      if (error) {
        alert("変更に失敗しました")
        console.error("❌ エラー:", error)
      } else {
        alert("ニックネームを変更しました")
        router.push("/")  // 成功したらトップページに遷移
      }
    }
  }

  if (loading) return <p>読み込み中...</p>

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <label className="block mb-2 text-sm font-medium">ニックネーム</label>
      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <button
        type="submit"
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        保存する
      </button>
    </form>
  )
}
