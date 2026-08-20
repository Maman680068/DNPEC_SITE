import { NAV_ITEMS, type NavItem } from "@/lib/nav-data";
import { localizeHref } from "./href";
import type { Locale } from "./config";
import { messages } from "./messages";

function translateItem(item: NavItem, locale: Locale): NavItem {
  const label = messages[locale].nav[item.href] ?? item.label;
  return {
    ...item,
    label,
    href: localizeHref(locale, item.href),
    children: item.children?.map((child) => translateItem(child, locale)),
  };
}

export function getLocalizedNavItems(locale: Locale): NavItem[] {
  return NAV_ITEMS.map((item) => translateItem(item, locale));
}
