"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // 初期値をlocalStorageまたはOS設定から取得
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "light";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", next);
    }
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="テーマ切り替え"
      style={{
        position: "fixed",
        top: 18,
        right: 18,
        zIndex: 100,
        background: "none",
        border: "none",
        fontSize: 28,
        cursor: "pointer",
        color: "var(--foreground)",
        opacity: 0.85,
        transition: "color 0.2s"
      }}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
} 