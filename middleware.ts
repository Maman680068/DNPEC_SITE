import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, LOCALE_HEADER, LOCALE_PATHNAME_HEADER } from "@/lib/i18n/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const locale = isEnglish ? "en" : "fr";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);
  requestHeaders.set(LOCALE_PATHNAME_HEADER, pathname);

  let response: NextResponse;
  if (!isEnglish) {
    response = NextResponse.next({ request: { headers: requestHeaders } });
  } else {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/en" ? "/" : pathname.slice(3) || "/";
    response = NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  // Cookie : secours fiable si Next ne transmet pas x-locale aux Server Components.
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
