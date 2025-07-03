"use client";
import "./globals.css"
import BottomNav from "../components/BottomNav"
import TopNav from "../components/TopNav"
import { usePathname } from "next/navigation"
// import ThemeToggle from "../components/ThemeToggle"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === "/register" || pathname === "/login";
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/favicon-16x16.png" />
        {/* PNGアイコンも使いたい場合は下も追加 */}
        {/* <link rel="icon" type="image/png" href="/icon.png" /> */}
      </head>
      <body className="bg-black text-white font-sans">
        {/* <ThemeToggle /> */}
        {!hideNav && <TopNav />}
        {children}
        {!hideNav && <BottomNav />}
      </body>
    </html>
  )
}