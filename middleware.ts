import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, getCookieName } from "./lib/auth";

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/login"];

// API routes should not be protected by auth middleware
const API_ROUTES = "/api/";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to API routes (auth is handled within the API)
  if (pathname.startsWith(API_ROUTES)) {
    return NextResponse.next();
  }

  // Allow access to public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for auth token in cookies
  const token = request.cookies.get(getCookieName())?.value;

  if (!token) {
    // Redirect to login if no token
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token
  const user = await verifyToken(token);

  if (!user) {
    // Token invalid, redirect to login
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(getCookieName());
    return response;
  }

  // User is authenticated, proceed
  return NextResponse.next();
}

// Configure middleware to run on all routes except static files and api
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
