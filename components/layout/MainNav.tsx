"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-data";
import DropdownMenu from "./nav/DropdownMenu";
import SearchModal from "./SearchModal";

function isItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MainNav() {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [searchOpen, setSearchOpen] = useState(false);

  // Referme tous les menus après une navigation (y compris vers une simple
  // ancre/query string, que usePathname ne distingue pas toujours).
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenIndex(null);
  }

  return (
    <nav className="bg-navy sticky top-0 z-40 shadow-md">
      <ul
        role="menubar"
        className="wrap flex flex-wrap xl:flex-nowrap items-center gap-x-5 gap-y-2 min-h-[58px] py-2.5 text-[14.5px] font-medium"
      >
        {NAV_ITEMS.map((item, index) => (
          <DropdownMenu
            key={item.href}
            item={item}
            level={1}
            isOpen={openIndex === index}
            onOpenChange={(open) =>
              setOpenIndex((current) => (open ? index : current === index ? null : current))
            }
            isActive={isItemActive(pathname, item.href)}
            onNavigate={() => setOpenIndex(null)}
          />
        ))}
        <li className="list-none">
          <button
            type="button"
            aria-label="Rechercher"
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
