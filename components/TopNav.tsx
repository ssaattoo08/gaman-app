"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function TopNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex justify-between items-center px-6 py-4 bg-black border-b border-gray-700 text-white">
      <div className="text-lg font-bold">G</div>
      <div className="flex space-x-6">
        <Link
          href="/timeline"
          className={`${pathname === "/timeline" ? "text-blue-400" : "hover:text-blue-400"}`}
        >
          タイムライン
        </Link>
        <Link
          href="/post"
          className={`${pathname === "/post" ? "text-blue-400" : "hover:text-blue-400"}`}
        >
          投稿
        </Link>
        <Link
          href="/mypage"
          className={`${pathname === "/mypage" ? "text-blue-400" : "hover:text-blue-400"}`}
        >
          マイページ
        </Link>
      </div>
    </nav>
  )
}
