'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setMessage('ログインリンクの送信に失敗しました')
    } else {
      setMessage('メールを確認してください（ログインリンクを送りました）')
    }
  }

  return (
    <main className="max-w-md mx-auto mt-20 px-4">
      <h1 className="text-2xl font-bold mb-4">ログイン</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">
          ログインリンクを送信
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </main>
  )
}
