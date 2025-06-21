import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "我慢記録アプリ",
  description: "我慢したことを記録・共有するアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white px-4 py-6`}
      >
        <header className="mb-6 text-sm">
          <a href="/" className="mr-4 underline text-blue-400">
            一覧ページ
          </a>
          <a href="/new" className="underline text-green-400">
            投稿ページ
          </a>
        </header>
        {children}
      </body>
    </html>
  );
}
