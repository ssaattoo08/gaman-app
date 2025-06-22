'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation' // `next/navigation` から `useRouter` をインポート

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter() // useRouterフックを使ってページ遷移
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    if (!email) {
      setMessage('📩 メールアドレスを入力してください')
      return
    }

    // 本番と開発環境に応じてリダイレクトURLを切り替え
    const redirectUrl = process.env.NEXT_PUBLIC_REDIRECT_URL || 'http://localhost:3000/login/callback'

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })

    if (error) {
      console.error('Login error:', error.message)
      setMessage('ログインリンクの送信に失敗しました。もう一度試してください。')
    } else {
      setMessage('✅ メールにログインリンクを送信しました。確認してください。')
    }
  }

  // 新規登録ページへ遷移するための関数
  const goToRegister = () => {
    router.push('/register') // '/register' ページに遷移
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4">
      <h1 className="text-2xl mb-6">メールログイン</h1>
      <input
        type="email"
        placeholder="メールアドレスを入力"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full max-w-md px-4 py-2 mb-4 rounded bg-white text-black"
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
      >
        ログインリンクを送信
      </button>

      {/* 新規登録ボタン */}
      <button
        onClick={goToRegister} // 新規登録ページへの遷移
        className="mt-4 text-blue-500 hover:text-blue-700"
      >
        新規登録はこちら
      </button>

      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  )
}
