"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"

export default function Home() {
  const router = useRouter()
  const [userCount, setUserCount] = useState<number | null>(null)

  useEffect(() => {
    const fetchUserCount = async () => {
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
        {/* ロゴ表示 */}
        <div className="flex justify-center">
          <img
            src="/camel-logo-small.png"  // 必要に応じて camel-icon-transparent.png に変更可
            alt="がまんロゴ"
            width={80}
            height={80}
            className="rounded-full"
          />
        </div>

        {/* キャッチコピー */}
        <p className="text-lg leading-relaxed text-gray-200">
          日々のガマンを記録し<br />
          見える化する習慣化サービス
        </p>

        {/* 説明文 */}
        <ul className="text-sm text-gray-400 space-y-1">
          <li>✔︎ ガマンを投稿するだけ、振り返り機能も搭載してます</li>
          <li>✔︎ 完全匿名性・登録時に自動でニックネームがつきます</li>
        </ul>

        {/* ボタン */}
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => router.push("/register")}
            style={{
              padding: '10px 24px',
              background: '#444',
              color: 'white',
              border: 'none',
              borderRadius: 9999,
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: 1,
              minWidth: 100,
              cursor: 'pointer'
            }}
          >
            新規登録
          </button>
          <button
            onClick={() => router.push("/login")}
            style={{
              padding: '10px 24px',
              background: '#444',
              color: 'white',
              border: 'none',
              borderRadius: 9999,
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: 1,
              minWidth: 100,
              cursor: 'pointer'
            }}
          >
            ログイン
          </button>
        </div>
      </div>
    </main>
  )
}
