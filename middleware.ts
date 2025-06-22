import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // セッションの取得
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // セッションがない場合、最初に `/`（新規登録・ログイン選択ページ）にリダイレクト
  if (!session && !req.nextUrl.pathname.startsWith("/login") && !req.nextUrl.pathname.startsWith("/login/callback") && !req.nextUrl.pathname.startsWith("/")) {
    return NextResponse.redirect(new URL("/", req.url)) // `/login` ではなく `/` にリダイレクト
  }

  // セッションがある場合、`/login` にアクセスすると `/timeline` にリダイレクト
  if (session && req.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/timeline", req.url)) // リダイレクト先を `/timeline` に変更
  }

  return res
}

// `/login` や `/login/callback` を除外
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|login/callback).*)",
  ],
}
