"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { NavItem } from "@/lib/nav-data";

const OPEN_DELAY = 150;
const CLOSE_DELAY = 250;

function focusableItems(panel: HTMLUListElement) {
  return Array.from(
    panel.querySelectorAll<HTMLElement>(":scope > li > a, :scope > li > button, :scope > li > span > a, :scope > li > span > button"),
  );
}

type DropdownMenuProps = {
  item: NavItem;
  level: 1 | 2;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isActive?: boolean;
  onNavigate?: () => void;
};

export default function DropdownMenu({
  item,
  level,
  isOpen,
  onOpenChange,
  isActive = false,
  onNavigate,
}: DropdownMenuProps) {
  const [openChildIndex, setOpenChildIndex] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLLIElement>(null);
  const chevronRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const focusFirstOnOpen = useRef(false);

  const hasChildren = !!item.children?.length;

  function clearTimers() {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }

  useEffect(() => clearTimers, []);

  // Referme le sous-panneau de niveau 2 dès que ce panneau se referme.
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) setOpenChildIndex(null);
  }

  useEffect(() => {
    if (isOpen && focusFirstOnOpen.current) {
      focusFirstOnOpen.current = false;
      requestAnimationFrame(() => {
        const panel = panelRef.current;
        if (panel) focusableItems(panel)[0]?.focus();
      });
    }
  }, [isOpen]);

  // Ferme au clic en dehors — uniquement nécessaire au niveau 1 (le niveau 2
  // se démonte automatiquement quand son parent se referme).
  useEffect(() => {
    if (level !== 1 || !isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [level, isOpen, onOpenChange]);

  function scheduleOpen() {
    if (!hasChildren) return;
    clearTimers();
    openTimer.current = setTimeout(() => onOpenChange(true), OPEN_DELAY);
  }

  function scheduleClose() {
    if (!hasChildren) return;
    clearTimers();
    closeTimer.current = setTimeout(() => onOpenChange(false), CLOSE_DELAY);
  }

  function handleWrapperKeyDown(event: React.KeyboardEvent<HTMLLIElement>) {
    if (event.key === "Escape" && isOpen) {
      event.stopPropagation();
      onOpenChange(false);
      chevronRef.current?.focus();
    }
  }

  function handleChevronKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || (level === 2 && event.key === "ArrowRight")) {
      event.preventDefault();
      if (!isOpen) {
        focusFirstOnOpen.current = true;
        onOpenChange(true);
      } else {
        const panel = panelRef.current;
        if (panel) focusableItems(panel)[0]?.focus();
      }
    }
  }

  function handlePanelKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    const items = focusableItems(event.currentTarget);
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      items[(currentIndex + 1) % items.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      items[(currentIndex - 1 + items.length) % items.length]?.focus();
    } else if (event.key === "ArrowLeft" && level === 2) {
      event.stopPropagation();
      onOpenChange(false);
      chevronRef.current?.focus();
    }
  }

  const labelClasses =
    level === 1
      ? `whitespace-nowrap py-1.5 border-b-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow focus-visible:outline-offset-2 ${
          isActive || isOpen
            ? "text-white border-yellow"
            : "text-[#dbe2f0] border-transparent hover:text-white hover:border-yellow"
        }`
      : `block px-4 py-2 text-sm rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow focus-visible:outline-offset-2 ${
          isOpen ? "bg-white/10 text-white" : "text-[#dbe2f0] hover:bg-white/10 hover:text-white"
        }`;

  const chevronButtonClasses =
    level === 1
      ? "p-1 text-[#dbe2f0] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow focus-visible:outline-offset-2 rounded"
      : "px-2 py-2 text-[#dbe2f0] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow focus-visible:outline-offset-2 rounded";

  const chevronIconClasses = `inline-block text-[10px] transition-transform ${
    level === 1 ? (isOpen ? "-rotate-180" : "") : isOpen ? "rotate-90" : ""
  }`;

  const panelClasses =
    level === 1
      ? "absolute top-full left-0 mt-0 min-w-[280px] bg-navy-dark rounded-b-lg rounded-tr-lg shadow-lg py-2 z-50"
      : "absolute left-full top-0 ml-1 min-w-[300px] bg-navy-dark rounded-lg shadow-lg py-2 z-50";

  return (
    <li
      ref={wrapperRef}
      className="relative list-none"
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
      onKeyDown={handleWrapperKeyDown}
    >
      <span className="inline-flex items-center gap-1">
        <Link href={item.href} role="menuitem" className={labelClasses} onClick={onNavigate}>
          {item.label}
        </Link>
        {hasChildren && (
          <button
            ref={chevronRef}
            type="button"
            aria-haspopup="true"
            aria-expanded={isOpen}
            aria-label={`Afficher le sous-menu ${item.label}`}
            onClick={() => onOpenChange(!isOpen)}
            onKeyDown={handleChevronKeyDown}
            className={chevronButtonClasses}
          >
            <span className={chevronIconClasses} aria-hidden="true">
              {level === 1 ? "▾" : "▸"}
            </span>
          </button>
        )}
      </span>

      {hasChildren && isOpen && (
        <ul ref={panelRef} role="menu" className={panelClasses} onKeyDown={handlePanelKeyDown}>
          {item.children!.map((child, index) =>
            child.children?.length ? (
              <DropdownMenu
                key={child.label}
                item={child}
                level={2}
                isOpen={openChildIndex === index}
                onOpenChange={(open) =>
                  setOpenChildIndex((current) => (open ? index : current === index ? null : current))
                }
                onNavigate={onNavigate}
              />
            ) : (
              <li key={child.label} role="none">
                <Link
                  href={child.href}
                  role="menuitem"
                  onClick={onNavigate}
                  className="block px-4 py-2 text-sm text-[#dbe2f0] rounded-md hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow focus-visible:outline-offset-2"
                >
                  {child.label}
                </Link>
              </li>
            ),
          )}
        </ul>
      )}
    </li>
  );
}
