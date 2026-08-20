"use client";

import { usePathname } from "next/navigation";
import { switchLocaleHref } from "@/lib/i18n/href";
import { useLocale } from "@/lib/i18n/use-locale";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

function setLocaleCookie(next: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;samesite=lax`;
}

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname() ?? "/";

  function go(next: Locale) {
    if (next === locale) return;
    setLocaleCookie(next);
    // Navigation complète : le rewrite /en → / ne doit pas réutiliser le RSC français en cache.
    window.location.assign(switchLocaleHref(pathname, next));
  }

  return (
    <nav aria-label="Language" className="flex items-center gap-1 text-[12px] sm:text-[13px] font-bold tracking-wide">
      <button
        type="button"
        lang="fr"
        onClick={() => go("fr")}
        className={`px-1.5 py-0.5 rounded cursor-pointer ${
          locale === "fr" ? "text-navy bg-yellow" : "text-navy/55 hover:text-navy"
        }`}
        aria-current={locale === "fr" ? "true" : undefined}
      >
        FR
      </button>
      <span className="text-navy/30" aria-hidden="true">
        |
      </span>
      <button
        type="button"
        lang="en"
        onClick={() => go("en")}
        className={`px-1.5 py-0.5 rounded cursor-pointer ${
          locale === "en" ? "text-navy bg-yellow" : "text-navy/55 hover:text-navy"
        }`}
        aria-current={locale === "en" ? "true" : undefined}
      >
        EN
      </button>
    </nav>
  );
}
