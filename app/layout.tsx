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
        <link rel="icon" href="/camel-favicon.ico" />
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