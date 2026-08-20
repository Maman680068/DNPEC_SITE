import { cookies, headers } from "next/headers";
import { connection } from "next/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  LOCALE_PATHNAME_HEADER,
  isLocale,
  localeFromPathname,
  type Locale,
} from "./config";
import { messages, type Messages } from "./messages";

export async function getLocale(): Promise<Locale> {
  // Empêche Next de servir une page FR en cache pour le rewrite /en → /.
  await connection();

  const headerStore = await headers();

  const fromHeader = headerStore.get(LOCALE_HEADER);
  if (isLocale(fromHeader)) return fromHeader;

  const fromPath = localeFromPathname(headerStore.get(LOCALE_PATHNAME_HEADER));
  if (fromPath === "en") return "en";

  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  return DEFAULT_LOCALE;
}

export async function getMessages(): Promise<Messages> {
  const locale = await getLocale();
  return messages[locale];
}
