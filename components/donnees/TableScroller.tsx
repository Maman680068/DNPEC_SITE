"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type TableScrollerProps = {
  /** Indication affichée quand le tableau dépasse la largeur disponible (mobile). */
  hint: string;
  children: ReactNode;
};

/**
 * Conteneur défilant horizontalement qui s'ouvre sur les colonnes de droite
 * (années les plus récentes) quand le tableau est plus large que l'écran.
 */
export default function TableScroller({ hint, children }: TableScrollerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let positioned = false;
    const observer = new ResizeObserver(() => {
      const isOverflowing = node.scrollWidth > node.clientWidth + 1;
      setOverflowing(isOverflowing);
      // Une seule fois : on ne déplace plus le tableau une fois que le lecteur l'a fait défiler.
      if (isOverflowing && !positioned) {
        node.scrollLeft = node.scrollWidth;
        positioned = true;
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {overflowing ? (
        <p className="mb-2 flex items-center gap-1.5 text-[12px] text-muted" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {hint}
        </p>
      ) : null}
      <div ref={ref} className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
