"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function TopNav() {
  const pathname = usePathname()

  // トップページ（'/'）では何も表示しない
  if (pathname === "/") return null;

  return (
    <nav className="hidden md:flex justify-between items-center px-6 py-4 bg-black text-white">
      <div className="flex space-x-8">
        <Link href="/timeline" className={pathname === "/timeline" ? "font-bold underline" : ""}>HOME</Link>
        <Link href="/post" className={pathname === "/post" ? "font-bold underline" : ""}>投稿</Link>
        <Link href="/mypage" className={pathname === "/mypage" ? "font-bold underline" : ""}>マイページ</Link>
      </div>
    </nav>
  )
}
