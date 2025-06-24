"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function Home() {
  const router = useRouter()
  const [userCount, setUserCount] = useState<number | null>(null)

  useEffect(() => {
    const fetchUserCount = async () => {
      const supabase = createClient()
      const { count, error } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
      if (!error) setUserCount(count ?? 0)
    }
    fetchUserCount()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-wide">g</h1>
        {userCount !== null && (
          <div className="mb-4 text-white text-center text-sm">登録ユーザー：{userCount}人</div>
        )}
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => router.push("/register")}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-bold transition"
          >
            新規登録
          </button>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-bold transition"
          >
            ログイン
          </button>
        </div>

        <p className="text-lg leading-relaxed text-gray-200">
          日々のガマンを記録し<br />
          見える化する習慣化サービス
        </p>

        <ul className="text-sm text-gray-400 space-y-1">
          <li>✔︎ ガマンを投稿するだけ、振り返り機能も搭載してます</li>
          <li>✔︎ 完全匿名性・登録時に自動でニックネームがつきます</li>
        </ul>
      </div>
    </main>
  )
}
