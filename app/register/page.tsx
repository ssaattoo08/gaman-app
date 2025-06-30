"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"  // リダイレクトに必要
import { generateUniqueNickname } from "@/lib/utils/generateNickname"
import { supabase } from "@/lib/supabase/client"

const RegisterPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [userCount, setUserCount] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUserCount = async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
      if (!error) setUserCount(count ?? 0)
    }
    fetchUserCount()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
      // 食べ物ニックネームと英語usernameを自動生成
      const result = await generateUniqueNickname()
      if (!result) {
        setError("ニックネーム候補が足りません。管理者にご連絡ください。")
        return
      }
      const { nickname, username } = result
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert([
          {
            id: data.user.id, // user_idではなくidを使用
            nickname,
            username,
            email, // emailも保存
          },
        ])

      if (profileError) {
        setError(`プロフィール作成エラー: ${profileError.message}`)
        return
      }

      setSuccessMessage("新規登録が完了しました。マイページへ移動します。")
      setTimeout(() => {
        window.location.href = "/mypage";  // 登録後、マイページへリダイレクト
      }, 2000)
    } else {
      setError("ユーザー情報が取得できませんでした。")
    }
  }

  return (
    <div style={{ color: "white", padding: 40 }}>
      <h1>新規登録フォーム</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 320 }}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="メールアドレス" style={{ padding: 8 }} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="パスワード" style={{ padding: 8 }} />
        <button type="submit" style={{ padding: 8, background: '#2563eb', color: 'white', border: 'none', borderRadius: 4 }}>新規登録</button>
      </form>
      {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
      {successMessage && <div style={{ color: "green", marginTop: 16 }}>{successMessage}</div>}
    </div>
  )
}

export default RegisterPage