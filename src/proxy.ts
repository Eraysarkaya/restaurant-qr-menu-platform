import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/staff" || pathname.startsWith("/staff/");
  if (isProtected && pathname !== "/admin/login") {
    const sessionCookie = getSessionCookie(request, { cookiePrefix: "kose-mutfak" });
    const supportCookie = request.cookies.get("restaurant_support_session")?.value;
    if (!sessionCookie && !supportCookie) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/staff/:path*"] };
