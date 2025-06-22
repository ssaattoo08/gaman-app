import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()
  return res
}

// ✅ `/login` や `/login/callback` など認証まわりは除外する
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|login/callback).*)",
  ],
}
