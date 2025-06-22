"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { generateUniqueNickname } from "@/lib/utils/generateNickname" // ニックネーム生成関数をインポート
import { useRouter } from "next/navigation"

const RegisterPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const supabase = createClient()

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください")
      return
    }

    // ユーザーの新規登録（Supabase）
    const { user, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(`登録エラー: ${signUpError.message}`)
      return
    }

    // ニックネームの自動生成
    const nickname = await generateUniqueNickname()

    // プロフィールの作成
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: user?.id, email, nickname }) // profilesテーブルにデータを挿入

    if (profileError) {
      setError(`プロフィールの作成に失敗しました: ${profileError.message}`)
      return
    }

    setSuccessMessage("新規登録が完了しました。ログインページへ移動します。")
    setTimeout(() => {
      router.push("/login")  // 登録後、ログインページへリダイレクト
    }, 2000)
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
