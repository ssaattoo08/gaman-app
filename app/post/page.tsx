"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from '../../lib/supabase/client'

export default function PostPage() {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [cheatDay, setCheatDay] = useState(false)

  const placeholder = cheatDay
    ? "例：大好きなお酒を思う存分飲みまくった"
    : "例：飲み会を断って生成AIの勉強をした"

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
    <main className="px-4 py-12 max-w-xl mx-auto flex flex-col items-center">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-32 p-4 rounded-xl bg-gray-800 text-white mb-4"
        placeholder={placeholder}
      />
      <label className="flex items-center mb-4 self-start">
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
        className="w-full py-3 rounded-xl bg-gray-500 text-white font-bold hover:bg-gray-600 disabled:opacity-50"
      >
        {loading ? "投稿中..." : "投稿する"}
      </button>
    </main>
  )
}
