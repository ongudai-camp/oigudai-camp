import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["ru", "en", "kk"],
  defaultLocale: "ru",
  localePrefix: "always",
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    const preflight = new NextResponse(null, { status: 204 });
    preflight.headers.set("Access-Control-Allow-Origin", "*");
    preflight.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    preflight.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    preflight.headers.set("Access-Control-Max-Age", "86400");
    return preflight;
  }

  let response: NextResponse;

  // 1. Skip middleware for API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    response = NextResponse.next();
    addCorsHeaders(response);
    return response;
  }

  console.log(`[Middleware] Path: ${pathname}`);

  // Check if locale is in pathname
  const pathnameHasLocale = /^\/(ru|en|kk)(\/|$)/.test(pathname);

  if (pathnameHasLocale) {
    response = intlMiddleware(request);
    addCorsHeaders(response);
    return response;
  }

  // Try to detect locale from geolocation cookie
  const localeCookie = request.cookies.get("preferred-locale");
  if (localeCookie) {
    const locale = localeCookie.value;
    if (["ru", "en", "kk"].includes(locale)) {
      response = NextResponse.redirect(
        new URL(`/${locale}${pathname}`, request.url)
      );
      addCorsHeaders(response);
      return response;
    }
  }

  // Try to detect from Accept-Language header
  const acceptLanguage = request.headers.get("accept-language") || "";
  const detectedLocale = detectLocaleFromHeader(acceptLanguage);

  // Set cookie and redirect
  response = NextResponse.redirect(
    new URL(`/${detectedLocale}${pathname}`, request.url)
  );
  response.cookies.set("preferred-locale", detectedLocale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
  addCorsHeaders(response);
  return response;
}

function addCorsHeaders(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function detectLocaleFromHeader(acceptLanguage: string): string {
  const languages = acceptLanguage.split(",").map((lang) => {
    const [code, priority] = lang.trim().split(";q=");
    return {
      code: code.trim().toLowerCase(),
      priority: priority ? parseFloat(priority) : 1.0,
    };
  });
  
  // Sort by priority
  languages.sort((a, b) => b.priority - a.priority);
  
  // Map browser language to our supported locales
  for (const lang of languages) {
    if (lang.code.startsWith("ru")) return "ru";
    if (lang.code.startsWith("en")) return "en";
    if (lang.code.startsWith("kk")) return "kk";
  }
  
  return "ru"; // default
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|images|api|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|js|css)).*)"],
};
