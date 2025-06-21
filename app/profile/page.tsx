'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilePage() {
  const supabase = createClient()
  const [nickname, setNickname] = useState('')
  const [message, setMessage] = useState('')

  // ユーザー情報とプロフィール取得・自動作成
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

      // プロフィールが存在しなければ作成
      if (!data && !error) {
        await supabase.from('profiles').insert({
          id: user.id,
          nickname: '',
        })
      } else if (data) {
        setNickname(data.nickname || '')
      }
    }

    loadProfile()
  }, [])

  // ニックネーム更新処理
  const handleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('ログインが必要です')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ nickname })
      .eq('id', user.id)

    if (error) {
      setMessage('更新に失敗しました')
    } else {
      setMessage('✔ 保存しました！')
    }
  }

  return (
    <main className="max-w-xl mx-auto mt-12 px-4">
      <h1 className="text-xl font-bold mb-4">ニックネームを編集</h1>
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="ニックネーム"
        className="w-full border rounded p-2 mb-4 text-black"
      />
      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        保存する
      </button>
      {message && <p className="mt-4 text-sm text-green-400">{message}</p>}
    </main>
  )
}
