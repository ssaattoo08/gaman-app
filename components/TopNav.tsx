"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase/client"

export default function TopNav() {
  const pathname = usePathname()
  const [unreadCount, setUnreadCount] = useState(0)
  const isMountedRef = useRef(true)

  // useEffectで未読件数取得も一時的にクローズ
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

  // ログイン・新規登録ページでは何も表示しない
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  // トップページ（'/'）では何も表示しない
  if (pathname === "/") return null;

  return (
    <nav className="hidden md:flex justify-center items-center px-6 py-4 bg-black text-white">
      <div className="flex space-x-8 items-center">
        <Link href="/timeline" className={pathname === "/timeline" ? "font-bold underline" : ""}>Timeline</Link>
        <Link href="/cheatday">
          <img src="/camel-icon-transparent.png" alt="Camel Icon" style={{ height: 32, width: 32, borderRadius: '50%', background: '#fff', objectFit: 'cover', display: 'block', cursor: 'pointer' }} />
        </Link>
        {/* <Link href="/post" className={pathname === "/post" ? "font-bold underline" : ""}>投稿</Link> */}
        <Link href="/mypage" className={pathname === "/mypage" ? "font-bold underline" : ""}>MyPage</Link>
      </div>
      {/* 通知ボタンを一時的に非表示
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
      */}
    </nav>
  )
}
