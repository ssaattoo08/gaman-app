'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Header() {
  const supabase = createClient()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setIsLoggedIn(!!data.session)
    }
    checkSession()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (!isLoggedIn) return null

  return (
    <div className="text-right px-4 pt-4">
      <button
        onClick={handleLogout}
        className="text-sm text-gray-400 hover:text-white underline"
      >
        ログアウト
      </button>
    </div>
  )
}
