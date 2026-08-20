"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { localizeHref } from "@/lib/i18n/href";
import { useLocale } from "@/lib/i18n/use-locale";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export default function LocalizedLink({ href, ...props }: Props) {
  const locale = useLocale();
  return <Link href={localizeHref(locale, href)} {...props} />;
}
