"use client";

import { usePathname } from "next/navigation";
import { messages, type Messages } from "./messages";
import { localeFromPathname } from "./href";
import type { Locale } from "./config";

export function useLocale(): Locale {
  return localeFromPathname(usePathname() ?? "/");
}

export function useMessages(): Messages {
  return messages[useLocale()];
}
