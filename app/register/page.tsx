"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"  // リダイレクトに必要
import { generateUniqueNickname } from "@/lib/utils/generateNickname"

const RegisterPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [userCount, setUserCount] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserCount = async () => {
      const supabase = createClient()
      const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
      if (!error) setUserCount(count ?? 0)
    }
    fetchUserCount()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const supabase = createClient()

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください")
      return
    }

    // Supabaseで新規登録
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(`登録エラー: ${signUpError.message}`)
      return
    }

    // user が null でないことを確認してから id にアクセス
    if (data.user && data.user.id) {
      // 食べ物ニックネームを自動生成
      const nickname = await generateUniqueNickname()
      if (!nickname) {
        setError("ニックネーム候補が足りません。管理者にご連絡ください。")
        return
      }
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert([
          {
            id: data.user.id, // user_idではなくidを使用
            nickname,
            email, // emailも保存
          },
        ])

      if (profileError) {
        setError(`プロフィール作成エラー: ${profileError.message}`)
        return
      }

      setSuccessMessage("新規登録が完了しました。ログインページへ移動します。")
      setTimeout(() => {
        router.push("/mypage")  // 登録後、ログインページへリダイレクト
      }, 2000)
    } else {
      setError("ユーザー情報が取得できませんでした。")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4">
      <h1 className="text-2xl mb-6">新規登録</h1>
      {userCount !== null && (
        <div className="mb-4 text-white text-center text-sm">登録ユーザー：{userCount}人</div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-bold mb-2">メールアドレス</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded bg-white text-black"
            placeholder="メールアドレス"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-bold mb-2">パスワード</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded bg-white text-black"
            placeholder="パスワード"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}

        <button
          type="submit"
          className="w-full py-3 mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full"
        >
          登録
        </button>
      </form>
    </div>
  )
}

export default RegisterPage
