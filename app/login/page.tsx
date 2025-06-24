'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [userCount, setUserCount] = useState<number | null>(null)

  useEffect(() => {
    const fetchUserCount = async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
      if (!error) setUserCount(count ?? 0)
    }
    fetchUserCount()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setMessage('メールアドレスとパスワードを入力してください')
      return
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setMessage('ログインに失敗しました: ' + error.message)
    } else {
      setMessage('ログイン成功！')
      router.push('/mypage')
    }
  }

  const goToRegister = () => {
    router.push('/register')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4">
      <h1 className="text-2xl mb-6">メールログイン</h1>
      {userCount !== null && (
        <div className="mb-4 text-white text-center text-sm">登録ユーザー：{userCount}人</div>
      )}
      <form onSubmit={handleLogin} className="w-full max-w-md">
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 mb-4 rounded bg-white text-black"
          required
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 mb-4 rounded bg-white text-black"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded w-full"
        >
          ログイン
        </button>
      </form>
      <button
        onClick={goToRegister}
        className="mt-4 text-blue-500 hover:text-blue-700"
      >
        新規登録はこちら
      </button>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  )
}
