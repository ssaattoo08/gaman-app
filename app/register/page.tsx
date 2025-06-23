"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"  // リダイレクトに必要

const RegisterPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  // handleSubmit関数の定義
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const supabase = createClient()

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください")
      return
    }

    // Supabaseで新規登録
    const { data: user, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    // デバッグ用ログ
    console.log("ユーザー情報:", user)
    console.log("エラー:", signUpError)

    if (signUpError) {
      setError(`登録エラー: ${signUpError.message}`)
      return
    }

    if (user && user.id) {
      // プロフィール作成
      const nickname = `user_${user.id.slice(0, 8)}`
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert([
          {
            user_id: user.id,
            email,
            nickname,
          },
        ])

      // プロフィール作成エラー
      if (profileError) {
        setError(`プロフィール作成エラー: ${profileError.message}`)
        return
      }

      setSuccessMessage("新規登録が完了しました。ログインページへ移動します。")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } else {
      setError("ユーザー情報が取得できませんでした。")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4">
      <h1 className="text-2xl mb-6">新規登録</h1>

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
