"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function TopNav() {
  const pathname = usePathname()

  return (
    <nav className="hidden md:flex justify-between items-center px-6 py-4 bg-black text-white">
      {/* コメントアウト部分を完全に削除した場合 */}
    </nav>
  )
}
