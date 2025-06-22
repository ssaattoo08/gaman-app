"use client"

import { usePathname } from "next/navigation"

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-black border-t border-gray-700 z-50 md:hidden">
      <div className="flex justify-around items-center py-2 relative">
        {/* 投稿ボタンを削除 */}
      </div>
    </nav>
  )
}
