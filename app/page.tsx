"use client"

import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        /* <h1 className="text-5xl font-bold tracking-wide">g</h1> */

        <p className="text-lg leading-relaxed text-gray-200">
          日々のガマンを記録し<br />
          見える化する習慣化サービス
        </p>

        <ul className="text-sm text-gray-400 space-y-1">
          <li>✔︎ ガマンを投稿するだけ、振り返り機能も搭載予定</li>
          <li>✔︎ 完全匿名性・登録時に自動で食べ物ニックネームがつきます</li>
        </ul>

        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => router.push("/signup")}
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
      </div>
    </main>
  )
}
