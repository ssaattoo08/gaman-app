"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function TopNav() {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data, error } = await supabase
        .from("reactions")
        .select("id, read, gaman_logs(user_id)")
        .eq("read", false)
      if (!error && data) {
        const count = data.filter((r: any) => r.gaman_logs?.user_id === user.id).length
        setUnreadCount(count)
      }
    }
    fetchUnreadCount()
  }, [])

  // トップページ（'/'）では何も表示しない
  if (pathname === "/") return null;

  return (
    <nav className="hidden md:flex justify-between items-center px-6 py-4 bg-black text-white">
      <div className="flex space-x-8">
        <Link href="/timeline" className={pathname === "/timeline" ? "font-bold underline" : ""}>HOME</Link>
        <Link href="/post" className={pathname === "/post" ? "font-bold underline" : ""}>投稿</Link>
        <Link href="/mypage" className={pathname === "/mypage" ? "font-bold underline" : ""}>マイページ</Link>
      </div>
      <div className="relative ml-8">
        <Link href="/notifications" className="flex items-center">
          <Bell color={pathname === "/notifications" ? "white" : "gray"} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  )
}
