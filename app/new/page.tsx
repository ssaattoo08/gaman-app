'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NewPost() {
  const supabase = createClient()
  const [content, setContent] = useState('')
  const [message, setMessage] = useState('')
  const [nickname, setNickname] = useState('')

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

    const { error } = await supabase.from('gaman_logs').insert({
      content,
      user_id: user.id,
      nickname, // ← 追加！
    })

    if (error) {
      console.error(error)
      setMessage('投稿に失敗しました')
    } else {
      setMessage('投稿できました！')
      setContent('')
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
      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        投稿する
      </button>
      {message && <p className="mt-4 text-sm text-white">{message}</p>}
    </main>
  )
}
