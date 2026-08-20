"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getLocalizedNavItems } from "@/lib/i18n/nav";
import { isActivePath } from "@/lib/i18n/active-path";
import { useLocale, useMessages } from "@/lib/i18n/use-locale";
import type { NavItem } from "@/lib/nav-data";

function isItemActive(pathname: string, href: string) {
  return isActivePath(pathname, href);
}

type AccordionItemProps = {
  item: NavItem;
  pathname: string;
  depth: number;
  onNavigate: () => void;
};

function AccordionItem({ item, pathname, depth, onNavigate }: AccordionItemProps) {
  const t = useMessages();
  const hasChildren = !!item.children?.length;
  const active = isItemActive(pathname, item.href);
  const [open, setOpen] = useState(active && hasChildren);
  const panelId = useId();

  const paddingLeft = depth === 0 ? "pl-4" : depth === 1 ? "pl-6" : "pl-8";

  if (!hasChildren) {
    return (
      <li>
        <Link
          href={item.href}
          onClick={onNavigate}
          className={`block py-3 pr-4 text-[15px] font-medium border-b border-white/10 ${paddingLeft} ${
            active ? "text-yellow" : "text-[#dbe2f0] hover:text-white"
          }`}
        >
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div className={`flex items-stretch border-b border-white/10 ${paddingLeft}`}>
        <Link
          href={item.href}
          onClick={onNavigate}
          className={`flex-1 min-w-0 py-3 pr-2 text-[15px] font-medium ${
            active ? "text-yellow" : "text-[#dbe2f0] hover:text-white"
          }`}
        >
          {item.label}
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${open ? t.common.hideSubmenu : t.common.showSubmenu} ${item.label}`}
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 px-4 text-[#dbe2f0] hover:text-white"
        >
          <span className={`inline-block text-sm transition-transform ${open ? "-rotate-180" : ""}`} aria-hidden="true">
            ▾
          </span>
        </button>
      </div>
      {open && (
        <ul id={panelId} className="bg-navy-dark/60">
          {item.children!.map((child) => (
            <AccordionItem
              key={`${child.href}-${child.label}`}
              item={child}
              pathname={pathname}
              depth={depth + 1}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

type MobileNavProps = {
  onSearchOpen: () => void;
};

export default function MobileNav({ onSearchOpen }: MobileNavProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useMessages();
  const items = getLocalizedNavItems(locale);
  const [menuOpen, setMenuOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const panelId = useId();

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="lg:hidden">
      <div className="wrap flex items-center justify-between min-h-[52px] gap-3">
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls={panelId}
          aria-label={menuOpen ? t.common.closeMenu : t.common.openMenu}
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex items-center justify-center w-10 h-10 rounded-md text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow focus-visible:outline-offset-2"
        >
          <span className="text-xl leading-none" aria-hidden="true">
            {menuOpen ? "✕" : "☰"}
          </span>
        </button>

        <span className="text-white text-sm font-semibold tracking-wide truncate">DNPEC</span>

        <button
          type="button"
          aria-label={t.header.search}
          onClick={() => {
            setMenuOpen(false);
            onSearchOpen();
          }}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full text-lg text-[#dbe2f0] hover:text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow focus-visible:outline-offset-2"
        >
          ⌕
        </button>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label={t.common.closeMenu}
            className="fixed inset-0 z-30 bg-navy-dark/50"
            onClick={closeMenu}
          />
          <div
            id={panelId}
            className="absolute left-0 right-0 z-50 max-h-[min(80vh,calc(100dvh-8rem))] overflow-y-auto bg-navy shadow-lg border-t border-white/10"
          >
            <ul className="py-1">
              {items.map((item) => (
                <AccordionItem
                  key={`${item.href}-${item.label}`}
                  item={item}
                  pathname={pathname}
                  depth={0}
                  onNavigate={closeMenu}
                />
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
