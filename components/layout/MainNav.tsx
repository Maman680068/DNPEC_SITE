"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav-data";
import DropdownMenu from "./nav/DropdownMenu";

function isItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MainNav() {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Referme tous les menus après une navigation (y compris vers une simple
  // ancre/query string, que usePathname ne distingue pas toujours).
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenIndex(null);
  }

  return (
    <nav className="bg-navy">
      <ul
        role="menubar"
        className="wrap flex flex-wrap xl:flex-nowrap items-center gap-x-3.5 gap-y-1 min-h-[52px] py-2 text-[13px] font-medium"
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
        <li className="list-none ml-auto">
          <button
            type="button"
            aria-label="Rechercher"
            className="text-[#dbe2f0] hover:text-white text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow focus-visible:outline-offset-2 rounded"
          >
            ⌕
          </button>
        </li>
      </ul>
    </nav>
  );
}
