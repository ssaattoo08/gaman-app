'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function NewPost() {
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')
  const [nickname, setNickname] = useState('')
  const [cheatDay, setCheatDay] = useState(false)

  // ニックネームを取得
  useEffect(() => {
    const fetchNickname = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('gaman_logs')
          .select('nickname')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (data && data[0]) {
          setNickname(data[0].nickname)
        }
      }
    }

    fetchNickname()
  }, [])

  const handleSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('ログインが必要です')
      return
    }

    try {
      const res = await fetch("/api/postWithTitle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          content,
          nickname,
          cheat_day: cheatDay,
        })
      })
      const result = await res.json()
      if (!res.ok) {
        setMessage('投稿に失敗しました: ' + (result.error || ''))
        return
      }
      setMessage('投稿できました！')
      setContent('')
      setCheatDay(false)
    } catch (e) {
      setMessage('投稿に失敗しました')
      console.error(e)
    }
  }

  return (
    <main className="max-w-xl mx-auto mt-12 px-4">
      <h1 className="text-xl font-bold mb-4">我慢したことを投稿</h1>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="例：ビールを我慢した"
        className="w-full border rounded p-2 mb-4"
      />
      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={cheatDay}
          onChange={e => setCheatDay(e.target.checked)}
          className="mr-2"
        />
        チートデイとして投稿
      </label>
      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
      >
        投稿する
      </button>
      {message && <p className="mt-4 text-sm text-white">{message}</p>}
    </main>
  )
}
