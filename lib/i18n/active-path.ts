import { stripLocalePrefix } from "./href";

export function isActivePath(pathname: string, href: string): boolean {
  const path = stripLocalePrefix(pathname.split("#")[0] || "/");
  const target = stripLocalePrefix(href.split("#")[0] || "/");
  if (target === "/") return path === "/";
  return path === target || path.startsWith(`${target}/`);
}
