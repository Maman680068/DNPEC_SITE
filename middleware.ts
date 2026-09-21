import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE, LOCALE_HEADER, LOCALE_PATHNAME_HEADER } from "@/lib/i18n/config";
import { ADMIN_BASE_PATH, ADMIN_LOGIN_PATH, ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Espace contributeurs : ni localisé FR/EN, ni public — juste une
  // vérification de session avant de laisser passer (la validité réelle du
  // jeton est revérifiée par WordPress à chaque appel API côté serveur).
  if (pathname === ADMIN_BASE_PATH || pathname.startsWith(`${ADMIN_BASE_PATH}/`)) {
    if (pathname === ADMIN_LOGIN_PATH) {
      return NextResponse.next();
    }
    const hasSession = request.cookies.has(ADMIN_SESSION_COOKIE);
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN_PATH;
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

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
