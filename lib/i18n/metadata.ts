import type { Metadata } from "next";
import { getMessages } from "./locale";

export async function navTitleMetadata(href: string): Promise<Metadata> {
  const t = await getMessages();
  return { title: t.nav[href] ?? t.meta.titleDefault };
}
