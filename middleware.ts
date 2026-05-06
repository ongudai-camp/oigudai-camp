import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["ru", "en", "tr"],
  defaultLocale: "ru",
  localePrefix: "always",
});

export default function middleware(request: any) {
  const { pathname } = request.nextUrl;
  
  // Check if locale is in pathname
  const pathnameHasLocale = /^\/(ru|en|tr)(\/|$)/.test(pathname);
  
  if (pathnameHasLocale) {
    // Already has locale, proceed with intl middleware
    return intlMiddleware(request);
  }
  
  // Try to detect locale from geolocation cookie
  const localeCookie = request.cookies.get("preferred-locale");
  if (localeCookie) {
    const locale = localeCookie.value;
    if (["ru", "en", "tr"].includes(locale)) {
      return NextResponse.redirect(
        new URL(`/${locale}${pathname}`, request.url)
      );
    }
  }
  
  // Try to detect from Accept-Language header
  const acceptLanguage = request.headers.get("accept-language") || "";
  const detectedLocale = detectLocaleFromHeader(acceptLanguage);
  
  // Set cookie and redirect
  const response = NextResponse.redirect(
    new URL(`/${detectedLocale}${pathname}`, request.url)
  );
  response.cookies.set("preferred-locale", detectedLocale, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
  
  return response;
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
    if (lang.code.startsWith("tr")) return "tr";
  }
  
  return "ru"; // default
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|images|api).*)"],
};
