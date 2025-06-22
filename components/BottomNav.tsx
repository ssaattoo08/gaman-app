"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, User } from "lucide-react"

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-black border-t border-gray-700 z-50 md:hidden">
      <div className="flex justify-around items-center py-2 relative">
        {/* ホーム */}
        <Link href="/timeline" className={`text-white ${pathname === "/timeline" ? "text-blue-400" : "hover:text-blue-400"}`}>
          <Home className="w-6 h-6 mx-auto" />
        </Link>

        {/* 投稿（＋ボタン） */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
  <Link
    href="/post"
    className="w-14 h-14 flex items-center justify-center bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 border-4 border-black"
  >
    <Plus className="w-6 h-6" />
  </Link>
</div>

        {/* マイページ */}
        <Link href="/mypage" className={`text-white ${pathname === "/mypage" ? "text-blue-400" : "hover:text-blue-400"}`}>
          <User className="w-6 h-6 mx-auto" />
        </Link>
      </div>
    </nav>
  )
}
