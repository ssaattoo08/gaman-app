"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PlusSquare, User, Bell } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase/client"

export default function BottomNav() {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0) // 仮実装
  const isMountedRef = useRef(true)
  // 本来はuseEffectでSupabaseから未読件数を取得

  // 表示したくないページ
  const hideOnPages = ["/", "/login", "/register"]
  if (hideOnPages.includes(pathname)) {
    return null
  }

  useEffect(() => {
    isMountedRef.current = true

    const fetchUnreadCount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !isMountedRef.current) {
          if (isMountedRef.current) {
            setUnreadCount(0)
          }
          return
        }
        const { data, error } = await supabase
          .from("reactions")
          .select("id, read")
          .eq("read", false)
        if (error || !isMountedRef.current) {
          if (isMountedRef.current) {
            setUnreadCount(0)
          }
          return
        }
        if (isMountedRef.current) {
          setUnreadCount(Array.isArray(data) ? data.length : 0)
        }
      } catch (e) {
        if (isMountedRef.current) {
          setUnreadCount(0)
        }
      }
    }
    fetchUnreadCount()

    return () => {
      isMountedRef.current = false
    }
  }, [])

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-black border-t border-gray-700 z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        <Link href="/timeline" className="flex flex-col items-center justify-center w-full h-full">
          <Home color={pathname === "/timeline" ? "white" : "gray"} />
          <span className={`text-xs ${pathname === "/timeline" ? "text-white" : "text-gray-400"}`}>ホーム</span>
        </Link>
        <Link href="/post" className="flex flex-col items-center justify-center w-full h-full">
          <PlusSquare color={pathname === "/post" ? "white" : "gray"} />
          <span className={`text-xs ${pathname === "/post" ? "text-white" : "text-gray-400"}`}>投稿</span>
        </Link>
        <Link href="/notifications" className="flex flex-col items-center justify-center w-full h-full relative">
          <Bell color={pathname === "/notifications" ? "white" : "gray"} />
          <span className={`text-xs ${pathname === "/notifications" ? "text-white" : "text-gray-400"}`}>通知</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {unreadCount}
            </span>
          )}
        </Link>
        <Link href="/mypage" className="flex flex-col items-center justify-center w-full h-full">
          <User color={pathname === "/mypage" ? "white" : "gray"} />
          <span className={`text-xs ${pathname === "/mypage" ? "text-white" : "text-gray-400"}`}>マイページ</span>
        </Link>
      </div>
    </nav>
  )
}