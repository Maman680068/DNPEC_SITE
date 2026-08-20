import type { Messages } from "@/lib/i18n/messages";

export function navCards(t: Messages, hrefs: string[]) {
  return hrefs.map((href) => ({
    href,
    title: t.nav[href] ?? href,
    description: t.cardDesc[href] ?? "",
  }));
}
