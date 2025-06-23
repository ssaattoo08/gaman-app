import "./globals.css"
import BottomNav from "../components/BottomNav"
import TopNav from "../components/TopNav"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-black text-white font-sans">
        <TopNav />       {/* PC用ナビ */}
        {children}
        <BottomNav />    {/* モバイル用ナビ */}
      </body>
    </html>
  )
}