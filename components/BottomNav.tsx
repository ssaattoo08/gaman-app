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
  // 通知機能を一時的にクローズ

  // 表示したくないページ
  const hideOnPages = ["/", "/login", "/register"]
  if (!pathname || hideOnPages.includes(pathname)) {
    return null
  }

  // 通知機能を一時的にクローズ
  // useEffect(() => {
  //   isMountedRef.current = true

  //   const fetchUnreadCount = async () => {
  //     try {
  //       const { data: { user } } = await supabase.auth.getUser()
  //       if (!user || !isMountedRef.current) {
  //         if (isMountedRef.current) {
  //           setUnreadCount(0)
  //         }
  //         return
  //       }
  //       const { data, error } = await supabase
  //         .from("reactions")
  //         .select("id, read")
  //         .eq("read", false)
  //       if (error || !isMountedRef.current) {
  //         if (isMountedRef.current) {
  //           setUnreadCount(0)
  //         }
  //         return
  //       }
  //       if (isMountedRef.current) {
  //         setUnreadCount(Array.isArray(data) ? data.length : 0)
  //       }
  //     } catch (e) {
  //       if (isMountedRef.current) {
  //         setUnreadCount(0)
  //       }
  //     }
  //   }
  //   fetchUnreadCount()

  //   return () => {
  //     isMountedRef.current = false
  //   }
  // }, [])

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-black border-t border-gray-700 z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        <Link href="/timeline" className="flex flex-col items-center justify-center w-full h-full">
          <Home color={pathname === "/timeline" ? "white" : "gray"} />
          <span className={`text-xs ${pathname === "/timeline" ? "text-white" : "text-gray-400"}`}>Timeline</span>
        </Link>
        {/* 通知ボタンを完全に非表示
        <Link href="/notifications" className="flex flex-col items-center justify-center w-full h-full relative">
          <Bell color={pathname === "/notifications" ? "white" : "gray"} />
          <span className={`text-xs ${pathname === "/notifications" ? "text-white" : "text-gray-400"}`}>通知</span>
        </Link>
        */}
        <Link href="/mypage" className="flex flex-col items-center justify-center w-full h-full">
          <User color={pathname === "/mypage" ? "white" : "gray"} />
          <span className={`text-xs ${pathname === "/mypage" ? "text-white" : "text-gray-400"}`}>My Page</span>
        </Link>
      </div>
    </nav>
  )
}