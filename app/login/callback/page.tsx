'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Callback() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        console.error('セッション取得失敗:', error?.message)
        return router.replace('/login?error=session')
      }

      // 🔐 ログイン成功 → プロフィール作成 or 上書き
      await supabase.from('profiles').upsert({
        id: data.session.user.id,
        nickname: '',
      })

      router.replace('/')
    }

    checkSession()
  }, [router, supabase])

  return <p className="text-white text-center">ログイン処理中です...</p>
}
