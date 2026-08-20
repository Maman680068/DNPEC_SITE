export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_HEADER = "x-locale";
export const LOCALE_PATHNAME_HEADER = "x-pathname";
export const LOCALE_COOKIE = "dnpec-locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return value === "fr" || value === "en";
}

export function dateLocale(locale: Locale): string {
  return locale === "en" ? "en-GB" : "fr-FR";
}

export function localeFromPathname(pathname: string | null | undefined): Locale {
  if (!pathname) return DEFAULT_LOCALE;
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : DEFAULT_LOCALE;
}
