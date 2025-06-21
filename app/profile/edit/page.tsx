'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function EditProfile() {
  const supabase = createClient()
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [message, setMessage] = useState('')

  // 現在のニックネームを取得
  useEffect(() => {
    const fetchNickname = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return router.push('/login')

      const { data } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('id', user.id)
        .single()

      if (data) {
        setNickname(data.nickname || '')
      }
    }

    fetchNickname()
  }, [])

  const handleUpdate = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ nickname })
      .eq('id', user.id)

    if (error) {
      setMessage('更新に失敗しました')
    } else {
      setMessage('✔︎ 保存しました！')
    }
  }

  return (
    <main className="max-w-xl mx-auto mt-12 px-4">
      <h1 className="text-xl font-bold mb-4">ニックネームを編集</h1>
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="w-full border rounded p-2 mb-4 text-white"
        placeholder="ニックネーム"
      />
      <button
        onClick={handleUpdate}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        保存する
      </button>
      {message && <p className="mt-4 text-green-400 text-sm">{message}</p>}
    </main>
  )
}
