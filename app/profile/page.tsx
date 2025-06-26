'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ProfilePage() {
  const [nickname, setNickname] = useState('')
  const [message, setMessage] = useState('')

  // ユーザー情報とプロフィール取得のみ（編集不可）
  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setMessage('ログインが必要です')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single()

      if (data) {
        setNickname(data.nickname || '')
      }
    }

    loadProfile()
  }, [])

  return (
    <main className="max-w-xl mx-auto mt-12 px-4">
      <h1 className="text-xl font-bold mb-4">プロフィール</h1>
      <div className="mb-4">
        <span className="text-gray-400">あなたのニックネーム：</span>
        <span className="font-bold text-lg">{nickname}</span>
      </div>
      {message && <p className="mt-4 text-sm text-red-400">{message}</p>}
    </main>
  )
}
