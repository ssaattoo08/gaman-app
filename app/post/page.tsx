"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from '../../lib/supabase/client'

export default function PostPage() {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [cheatDay, setCheatDay] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("ログインが必要です")
      router.push("/login")
      return
    }

    const { error } = await supabase.from("gaman_logs").insert({
      user_id: user.id,
      content: content.trim(),
      cheat_day: cheatDay,
    })

    if (error) {
      alert("投稿に失敗しました")
      console.error(error)
    } else {
      setContent("")
      setCheatDay(false)
      router.push("/mypage")
    }

    setLoading(false)
  }

  return (
    <main className="px-4 py-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6 text-center">
        我慢したことを記録する
      </h1>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-32 p-4 rounded-xl bg-gray-800 text-white"
        placeholder="例：夜のラーメンを我慢した"
      />
      <label className="flex items-center mt-4 mb-2">
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
        disabled={loading || !content.trim()}
        className="mt-2 w-full py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "投稿中..." : "投稿する"}
      </button>
    </main>
  )
}
