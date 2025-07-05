import "./globals.css";
import BottomNav from "../components/BottomNav";
import TopNav from "../components/TopNav";
// import ThemeToggle from "../components/ThemeToggle";

export const metadata = {
  title: "Gaman App",
  icons: {
    icon: "/camel-favicon.ico",              // ファビコン（32x32）
    apple: "/camel-icon-transparent.png",    // iPhone用（180x180 推奨）
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/camel-logo.png" />
      </head>
      <body className="bg-black text-white font-sans">
        <TopNav />
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
