'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from './Header' // 👈 ログアウトボタンのコンポーネントを読み込み

type Log = {
  id: string
  created_at: string
  content: string
  nickname: string
}

export default function Page() {
  const supabase = createClient()
  const [logs, setLogs] = useState<Log[]>([])

  useEffect(() => {
    const fetchLogs = async () => {
      const { data, error } = await supabase
        .from('gaman_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('読み込みエラー:', error)
      } else {
        setLogs(data)
      }
    }

    fetchLogs()
  }, [])

  return (
    <>
      <Header /> {/* 👈 ここにログアウトボタンを表示 */}
      <main className="max-w-xl mx-auto mt-12 px-4">
        <h1 className="text-2xl font-bold mb-4">みんなの我慢記録</h1>
        <ul className="space-y-4">
          {logs.map((log) => (
            <li key={log.id} className="p-4 bg-gray-800 rounded">
              <div className="text-xs text-gray-400">
                {new Date(log.created_at).toLocaleString()}
              </div>
              <div className="font-semibold text-green-400">{log.nickname}</div>
              <div className="text-white">{log.content}</div>
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
