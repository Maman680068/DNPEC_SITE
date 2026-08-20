import { DEFAULT_LOCALE, localeFromPathname, type Locale } from "./config";

export { localeFromPathname };

export function stripLocalePrefix(pathname: string): string {
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3) || "/";
  return pathname;
}

export function localizeHref(locale: Locale, href: string): string {
  if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return href;
  }
  const hashIndex = href.indexOf("#");
  const path = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const hash = hashIndex >= 0 ? href.slice(hashIndex) : "";
  const bare = stripLocalePrefix(path || "/");
  if (locale === DEFAULT_LOCALE) return `${bare}${hash}`;
  if (bare === "/") return `/en${hash}`;
  return `/en${bare}${hash}`;
}

export function switchLocaleHref(pathname: string, nextLocale: Locale): string {
  return localizeHref(nextLocale, stripLocalePrefix(pathname));
}
