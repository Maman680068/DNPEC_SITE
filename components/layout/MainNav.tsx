"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import DropdownMenu from "./nav/DropdownMenu";
import MobileNav from "./MobileNav";
import SearchModal from "./SearchModal";
import { getLocalizedNavItems } from "@/lib/i18n/nav";
import { isActivePath } from "@/lib/i18n/active-path";
import { useLocale, useMessages } from "@/lib/i18n/use-locale";

export default function MainNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useMessages();
  const items = getLocalizedNavItems(locale);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [searchOpen, setSearchOpen] = useState(false);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenIndex(null);
  }

  return (
    <nav className="bg-navy sticky top-0 z-40 shadow-md relative">
      <MobileNav onSearchOpen={() => setSearchOpen(true)} />

      <ul
        role="menubar"
        className="wrap hidden lg:flex flex-nowrap items-center gap-x-5 gap-y-2 min-h-[58px] py-2.5 text-[14.5px] font-medium"
      >
        {items.map((item, index) => (
          <DropdownMenu
            key={item.href}
            item={item}
            level={1}
            isOpen={openIndex === index}
            onOpenChange={(open) =>
              setOpenIndex((current) => (open ? index : current === index ? null : current))
            }
            isActive={isActivePath(pathname, item.href)}
            onNavigate={() => setOpenIndex(null)}
          />
        ))}
        <li className="list-none">
          <button
            type="button"
            aria-label={t.header.search}
            onClick={() => setSearchOpen(true)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-lg text-[#dbe2f0] cursor-pointer transition-colors hover:text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow focus-visible:outline-offset-2"
          >
            ⌕
          </button>
        </li>
      </ul>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
}
