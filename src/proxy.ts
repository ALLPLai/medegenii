import { type NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect /dashboard - redirect to /login if no Supabase session cookie
  const hasSession = request.cookies.has("sb-vfqcfzmpacvcnkgmxihb-auth-token") ||
                     request.cookies.has("sb-vfqcfzmpacvcnkgmxihb-auth-token.0")

  if (!hasSession && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
