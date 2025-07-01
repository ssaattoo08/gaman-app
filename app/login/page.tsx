'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
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
      window.location.href = '/mypage'
    }
  }

  const goToRegister = () => {
    router.push('/register')
  }

  return (
    <div style={{ color: "white", minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#111' }}>
      <div style={{ width: 360, background: 'transparent', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="メールアドレス" style={{ padding: 10, borderRadius: 6, border: '1px solid #444', background: '#fef9c3', color: '#222' }} />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="パスワード" style={{ padding: 10, borderRadius: 6, border: '1px solid #444', background: '#fef9c3', color: '#222' }} />
          <button type="submit" style={{ padding: 12, background: '#444', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 16, letterSpacing: 1, cursor: 'pointer' }}>ログイン</button>
        </form>
        {message && <div style={{ color: message.includes('成功') ? "#4ade80" : "#f87171", marginTop: 20, textAlign: 'center' }}>{message}</div>}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a href="/register" style={{ color: '#fff', textDecoration: 'underline', fontSize: 14 }}>新規登録はこちら</a>
        </div>
      </div>
    </div>
  )
}
