import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyTokenFromCookie } from "./lib/auth";

// Next.js 16 renamed `middleware` to `proxy`.
export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isAuthenticated = !!verifyTokenFromCookie(token);
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname === "/signin" || pathname === "/signup";
  const isProtected = pathname === "/links" || pathname.startsWith("/link/");

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/links", request.url));
  }

  if (!isAuthenticated && isProtected) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/links", "/link/:path*", "/signin", "/signup"],
};
