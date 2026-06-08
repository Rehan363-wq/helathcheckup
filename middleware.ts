import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("clinihome-session");
  const { pathname } = request.nextUrl;

  const isProtectedRoute = [
    "/dashboard",
    "/profile",
    "/reminders",
    "/scan",
    "/report",
    "/doctors",
    "/chat",
    "/health-bot",
    "/tracker",
    "/doctor-dashboard",
    "/admin",
  ].some(route => pathname === route || pathname.startsWith(route + "/"));

  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Admin page restriction: doctors only
  if (pathname.startsWith("/admin") && sessionCookie) {
    try {
      const decodedVal = decodeURIComponent(sessionCookie.value);
      const user = JSON.parse(decodedVal);
      if (user.role !== "doctor") {
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    } catch (e) {
      // If parsing fails, fall back to default redirect
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/reminders/:path*",
    "/scan/:path*",
    "/report/:path*",
    "/doctors/:path*",
    "/chat/:path*",
    "/health-bot/:path*",
    "/tracker/:path*",
    "/doctor-dashboard/:path*",
    "/admin/:path*",
  ],
};
